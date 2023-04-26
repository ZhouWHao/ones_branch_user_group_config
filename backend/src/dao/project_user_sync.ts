
import { Logger } from '@ones-op/node-logger'
import { select, exec, count } from '@ones-op/node-database'


/**
 * 删除同步用户
 * @param project_uuid  
 * @param role_uuid 
 * @param user_uuids 
 * @returns 
 */
export async function del_by_user_uuids(project_uuid: string, role_uuid: string, user_uuids: string[]) {
    if (user_uuids.length == 0) {
        return
    }
    const str = `(${user_uuids.map(x => `'${x}'`).join(',')})`
    try {
        await exec(
            'delete',
            `delete from project_user_sync where project_uuid='${project_uuid}' and role_uuid='${role_uuid}' and user_uuid in ${str}`
        )
    } catch (err) {
        Logger.error('DAO[project_user_sync] del_by_user_uuids failed: ', err)
        throw err
    }
}

/**
 * 插入同步用户
 * @param project_uuid 
 * @param role_uuid 
 * @param user_uuids 
 * @returns 
 */
export async function inserts(project_uuid: string, role_uuid: string, user_uuids: string[]) {
    if (user_uuids.length == 0) {
        return
    }
    const strs = user_uuids.map(x => `('${project_uuid}', '${role_uuid}', '${x}')`).join(',')
    const sql = `insert into project_user_sync(project_uuid,role_uuid,user_uuid) values ${strs}`
    try {
        await exec(
            'insert',
            sql
        )
    } catch (err) {
        Logger.error('DAO[project_user_sync] inserts failed: ', err)
        throw err
    }
}

/**
 * 判断是否存在该同步用户
 * @param project_uuid 
 * @param role_uuid 
 * @param user_uuid 
 * @returns 
 */
export async function exist(project_uuid: string, role_uuid: string, user_uuids: string[]): Promise<boolean> {
    const str = `(${user_uuids.map(x => `'${x}'`).join(',')})`
    try {
        const result = await count(
            `select count(1) from project_user_sync where project_uuid='${project_uuid}' and role_uuid='${role_uuid}' and user_uuid in ${str}`
        )
        return result > 0
    } catch (err) {
        Logger.error('DAO[project_user_sync] exist failed: ', err)
        throw err
    }
}

/**
 * 查找角色下的同步用户
 * @param project_uuid 
 * @param role_uuid 
 * @returns 
 */
export async function query(project_uuid: string, role_uuid: string): Promise<string[]> {
    try {
        const result = await select(
            `select user_uuid from project_user_sync where project_uuid='${project_uuid}' and role_uuid='${role_uuid}'`
        )
        return result.map(x => x.user_uuid)
    } catch (err) {
        Logger.error('DAO[project_user_sync] query failed: ', err)
        throw err
    }
}