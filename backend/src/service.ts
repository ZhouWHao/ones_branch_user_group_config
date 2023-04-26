import { Logger } from '@ones-op/node-logger'
import { Relation, RelationType } from './dao/project_role_map'
import * as project_role_map_dao from './dao/project_role_map'
import * as project_user_sync_dao from './dao/project_user_sync'
import * as project_user_sync_cron_dao from './dao/project_user_sync_cron'
import { IntervalUnit, SyncCron } from './dao/project_user_sync_cron'
import * as  external from './external'
import { Process, LanguagePkg, ProcessType, ProcessResult } from '@ones-op/node-ability'


export interface SyncResult {
    deleted: string[] // 删除用户id集合
    added: string[]  // 新增用户id集合
}


/**同步 */
async function sync(project_uuid: string, role_uuid: string, relations: Relation[]): Promise<SyncResult> {
    const old = (await external.role_members(project_uuid))?.find(x => x.role.uuid == role_uuid)?.members || []
    const old_sync = (await project_user_sync_dao.query(project_uuid, role_uuid))

    const department_uuids = relations.find(x => x.relation_type == RelationType.Department)?.relation_uuids;
    const usergroup_uuids = relations.find(x => x.relation_type == RelationType.UserGroup)?.relation_uuids;

    const new_sync = Array.from(new Set((await external.get_user_uuid_by_department(department_uuids)).concat(await external.get_user_uuid_by_usergroup(usergroup_uuids))))


    const old_sync_set = new Set(old_sync)
    const new_sync_set = new Set(new_sync)

    const not_sync = old.filter(x => !old_sync_set.has(x))
    const not_sync_set = new Set(not_sync)

    const del_sync = old_sync.filter(x => !new_sync_set.has(x) && !not_sync_set.has(x))
    const add_sync = new_sync.filter(x => !not_sync_set.has(x) && !old_sync_set.has(x))

    if (del_sync.length > 0) {
        await project_user_sync_dao.del_by_user_uuids(project_uuid, role_uuid, del_sync)
        await external.delete_members(project_uuid, role_uuid, del_sync)
    }
    if (add_sync.length > 0) {
        await project_user_sync_dao.inserts(project_uuid, role_uuid, add_sync)
        await external.update_members(project_uuid, role_uuid, add_sync)
    }

    return { deleted: del_sync, added: add_sync }
}


/**设置角色部门映射结果 */
export interface SetProjectRoleMapResult {
    deleted: Relation[] // 删除映射集合
    added: Relation[]  // 新增映射集合
}


/**获取角色部门映射 */
export async function get_project_role_map(project_uuid: string, role_uuid: string): Promise<Relation[]> {
    return await project_role_map_dao.query(project_uuid, role_uuid)
}

/**设置角色部门映射 */
export async function set_project_role_map(project_uuid: string, role_uuid: string, relations: Relation[]): Promise<SetProjectRoleMapResult> {
    const old_relations = await project_role_map_dao.query(project_uuid, role_uuid);
    const old_relations_map = new Map(old_relations.map(x => [x.relation_type, new Set(x.relation_uuids)]))
    const new_relations_map = new Map(relations.map(x => [x.relation_type, new Set(x.relation_uuids)]))
    const del_relations = old_relations.map(x => {
        return {
            relation_type: x.relation_type,
            relation_uuids: x.relation_uuids.filter(y => !new_relations_map.has(x.relation_type) || !new_relations_map.get(x.relation_type)?.has(y))
        }
    })
    const add_relations = relations.map(x => {
        return {
            relation_type: x.relation_type,
            relation_uuids: x.relation_uuids.filter(y => !old_relations_map.has(x.relation_type) || !old_relations_map.get(x.relation_type)?.has(y))
        }
    })
    await project_role_map_dao.del_by_relations(project_uuid, role_uuid, del_relations)
    await project_role_map_dao.inserts(project_uuid, role_uuid, add_relations)
    return { deleted: del_relations, added: add_relations }
}

/**创建进度管理器 */
export async function create_process(user_uuid: string, timeoutSeconds: number): Promise<string> {
    //从请求中获取参数
    // const { user_uuid, title, timeout } = request?.body as any
    //进度管理器多语言标题
    // "TaLDMj99"
    const titlePkg: LanguagePkg = {
        en: '同步部门或用户组',
        zh: '同步部门或用户组',
    }
    //创建进度管理器，获取返回值processUUID
    const processUUID = await Process.create(ProcessType.DataSync, user_uuid, titlePkg, timeoutSeconds)
    return processUUID
}

/**更新进度管理器 */
async function update_process(process_uuid: string, successed: number, failed: number, remain: number): Promise<void> {
    //进度管理器更新
    await Process.update(
        process_uuid,
        successed,
        failed,
        remain
    )
}

/**更新进度管理器 */
async function done_process(process_uuid: string, is_success: boolean, msg: string): Promise<void> {
    //多语言详情内容
    const resultText: LanguagePkg = {
        en: msg,
        zh: msg,
    }

    //完成进度
    await Process.done(process_uuid, is_success, resultText, {})
}


/**按项目同步  */
export async function sync_by_project(process_uuid: string, project_uuid: string): Promise<SyncResult> {
    const role_members = await external.role_members(project_uuid);
    let remain = role_members.length
    let successed = 0
    let failed = 0
    let added = [] as string[]
    let deleted = [] as string[]
    for (const rm of role_members) {
        const role_uuid = rm.role.uuid
        try {
            const relations = await project_role_map_dao.query(project_uuid, role_uuid);
            const res = await sync(project_uuid, role_uuid, relations)
            added = added.concat(res.added)
            deleted = deleted.concat(res.deleted)
            successed += 1
        } catch (err) {
            Logger.error(`SERVICE[sync_by_project,role_uuid: ${role_uuid}] filed: `, err)
            failed += 1
        } finally {
            remain -= 1
            update_process(process_uuid, successed, failed, remain)
        }
    }

    done_process(process_uuid, true, `同步新增${added.length}人，移除${deleted.length}人`)
    return { deleted: deleted, added: added }
}

/**删除成员 */
export async function delete_member(project_uuid: string, role_uuid: string, user_uuids: string[]): Promise<boolean> {
    const res = await project_user_sync_dao.exist(project_uuid, role_uuid, user_uuids)
    if (!res) {
        await external.delete_members(project_uuid, role_uuid, user_uuids)
        return true
    }
    return false
}

/**删除角色 */
export async function delete_role(project_uuid: string, role_uuid: string): Promise<void> {
    await set_project_role_map(project_uuid, role_uuid, [])
    await external.delete_role(project_uuid, role_uuid)
}


/**设置定时任务 */
export async function set_cron(interval: number, unit: IntervalUnit): Promise<void> {
    await project_user_sync_cron_dao.set(interval, unit)
}

/**获取定时任务 */
export async function get_cron(): Promise<SyncCron> {
    return await project_user_sync_cron_dao.get()
}

/**定时同步 */
export async function sync_by_timer(): Promise<void> {
    const cron = await project_user_sync_cron_dao.get();
    const now = new Date().getTime() / 1000
    if (now >= cron.next_at) {
        Logger.debug('start cron')
        const project_uuids = await external.projects();
        for (const project_uuid of project_uuids) {
            Logger.debug(`start sync project ${project_uuid}`)
            const role_members = await external.role_members(project_uuid);
            for (const rm of role_members) {
                const relations = await project_role_map_dao.query(project_uuid, rm.role.uuid);
                await sync(project_uuid, rm.role.uuid, relations);
            }

            Logger.debug(`sync project ${project_uuid} done`)
        }

        await project_user_sync_cron_dao.set(cron.interval, cron.unit)
    }
}
