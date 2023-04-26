import { fetchONES } from '@ones-op/node-fetch'
import { Logger } from '@ones-op/node-logger'

const TEAM_UUID = globalThis.onesEnv.teamUUID

/**role_membersf result */
interface RoleMember {
    role: RoleMemberRole
    members: string[]
}

interface RoleMemberRole {
    uuid: string
    name: string
    name_pinyin: string
    is_project_member: boolean
}

/**项目下所有角色成员 */
export async function role_members(project_uuid: string): Promise<RoleMember[]> {
    try {
        const response: any = await fetchONES({
            path: `/team/${TEAM_UUID}/project/${project_uuid}/role_members`,
            method: 'GET',
            root: true,
        })
        if (response?.statusCode != 200) {
            throw response?.error || response
        }
        return response?.body?.role_members as RoleMember[]
    }
    catch (err) {
        Logger.error("EXTERNAL[role_members] failed: ", err)
        throw err
    }
}

/**更新角色成员 */
export async function update_members(project_uuid: string, role_uuid: string, user_uuids: string[]): Promise<void> {
    try {
        const response = await fetchONES({
            path: `/team/${TEAM_UUID}/project/${project_uuid}/role/${role_uuid}/members/update`,
            method: 'POST',
            root: true,
            body: {
                members: user_uuids,
            },
        })
        if (response?.statusCode != 200) {
            throw response?.error || response
        }
    }
    catch (err) {
        Logger.error("EXTERNAL[update_members] failed: ", err)
        throw err
    }
}

/**删除角色成员 */
export async function delete_members(project_uuid: string, role_uuid: string, user_uuids: string[]): Promise<void> {
    try {
        const response = await fetchONES({
            path: `/team/${TEAM_UUID}/project/${project_uuid}/role/${role_uuid}/members/delete`,
            method: 'POST',
            root: true,
            body: {
                members: user_uuids,
            },
        })
        if (response?.statusCode != 200) {
            throw response?.error || response
        }
    }
    catch (err) {
        Logger.error("EXTERNAL[delete_members] failed: ", err)
        throw err
    }
}

/**所有项目 */
export async function projects(): Promise<string[]> {
    const rqeuestBody = {
        query: `{
                projects{
                    uuid
                }
            }`,
        variables: {
        },
    }
    try {
        const response: any = await fetchONES({
            path: `/team/${TEAM_UUID}/items/graphql`,
            method: 'POST',
            body: rqeuestBody,
            root: true
        });
        if (response?.statusCode != 200) {
            throw response?.error || response
        }
        return response?.body?.data?.projects?.map(x => x.uuid) || []
    }
    catch (err) {
        Logger.error("EXTERNAL[projects] failed: ", err)
        throw err
    }
}

/**查找部门下员工 */
export async function get_user_uuid_by_department(department_uuids: string[] | undefined): Promise<string[]> {
    if (!department_uuids || department_uuids.length == 0) {
        return []
    }
    const rqeuestBody = {
        query: `{
                users(filter: {departments_in:$departments_in}){
                    uuid
                    departments {
                        uuid
                    }
                }
            }`,
        variables: {
            departments_in: department_uuids,
        },
    }
    try {
        const response: any = await fetchONES({
            path: `/team/${TEAM_UUID}/items/graphql`,
            method: 'POST',
            body: rqeuestBody,
            root: true
        });
        if (response?.statusCode != 200) {
            throw response?.error || response
        }
        return response?.body?.data?.users?.map(x => x.uuid) || []
    }
    catch (err) {
        Logger.error("EXTERNAL[get_user_uuid_by_department] failed: ", err)
        throw err
    }
}

/**查找用户组下员工 */
export async function get_user_uuid_by_usergroup(usergroup_uuids: string[] | undefined): Promise<string[]> {
    if (!usergroup_uuids || usergroup_uuids.length == 0) {
        return []
    }
    const rqeuestBody = {
        query: `{
                users(filter: {userGroups_in:$userGroups_in}){
                    uuid
                    userGroups {
                        uuid
                    }
                }
            }`,
        variables: {
            userGroups_in: usergroup_uuids
        }
    }
    try {
        const response: any = await fetchONES({
            path: `/team/${TEAM_UUID}/items/graphql`,
            method: 'POST',
            body: rqeuestBody,
            root: true
        });
        if (response?.statusCode != 200) {
            throw response?.error || response
        }
        return response?.body?.data?.users.map(x => x.uuid) || []
    }
    catch (err) {
        Logger.error("EXTERNAL[get_user_uuid_by_usergroup] failed: ", err)
        throw err
    }
}

/**删除角色 */
export async function delete_role(project_uuid: string, role_uuid: string): Promise<void> {
    try {
        const response = await fetchONES({
            path: `/team/${TEAM_UUID}/project/${project_uuid}/role/${role_uuid}/delete`,
            method: 'POST',
            root: true,
        })
        if (response?.statusCode != 200) {
            throw response?.error || response
        }
    }
    catch (err) {
        Logger.error("EXTERNAL[delete_role] failed: ", err)
        throw err
    }
}