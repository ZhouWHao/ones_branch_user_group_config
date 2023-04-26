
import { Logger } from '@ones-op/node-logger'
import { select, exec } from '@ones-op/node-database'

/**关系类型 */
export enum RelationType {
    Department = 1, //部门
    UserGroup = 2 //用户组
}

/**对应关系 */
export interface Relation {
    relation_type: RelationType; // 关系类型
    relation_uuids: string[]; // uuid集合
}

/**删除给定关系条件的映射 
 * @project_uuid 项目uuid
 * @role_uuid 角色uuid
 * @relations 对应关系
*/
export async function del_by_relations(project_uuid: string, role_uuid: string, relations: Relation[]) {
    try {
        for (const r of relations) {
            if (r.relation_uuids.length == 0) {
                continue
            }
            const str = `(${r.relation_uuids.map(x => `'${x}'`).join(',')})`
            const sql = `delete from project_role_map where project_uuid='${project_uuid}' and role_uuid='${role_uuid}' and relation_type=${r.relation_type} and relation_uuid in ${str}`
            await exec(
                'delete',
                sql
            )
        }
    } catch (err) {
        Logger.error('DAO[project_role_map] del_by_relations failed: ', err)
        throw err
    }
}

/**插入映射
 * @project_uuid 项目uuid
 * @role_uuid 角色uuid
 * @relations 对应关系
*/
export async function inserts(project_uuid: string, role_uuid: string, relations: Relation[]) {
    const values = relations.flatMap(x => x.relation_uuids.map(y => `('${project_uuid}','${role_uuid}','${y}','${x.relation_type}')`))
    if (values.length == 0) {
        return
    }
    const sql = `insert into project_role_map(project_uuid,role_uuid,relation_uuid,relation_type) values ${values.join(',')}`
    try {
        await exec(
            'insert',
            sql
        )
    } catch (err) {
        Logger.error('DAO[project_role_map] inserts failed: ', err)
        throw err
    }
}

/**查询映射 
 * @project_uuid 项目uuid
 * @role_uuid 角色uuid
*/
export async function query(project_uuid: string, role_uuid: string): Promise<Relation[]> {
    try {
        let res: Relation[] = []
        for (const t of [RelationType.Department, RelationType.UserGroup]) {
            const uuids = await select(
                `select relation_uuid from project_role_map where project_uuid='${project_uuid}' and role_uuid='${role_uuid}' and relation_type=${t}`
            )
            const x = { relation_type: t, relation_uuids: uuids.map(x => x.relation_uuid) } as Relation
            if (x.relation_uuids.length > 0) {
                res.push(x)
            }
        }
        return res
    } catch (err) {
        Logger.error('DAO[project_role_map] query failed: ', err)
        throw err
    }
}


