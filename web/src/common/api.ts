import { request, NodeOPrequest } from './fetch'
// 修改同步频率
export async function syncFrequency(body) {
  return NodeOPrequest(`/project/api/project/set_cron`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}
// 获取同步频率
export async function getFrequency() {
  return NodeOPrequest(`/project/api/project/get_cron`, 'POST')
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}
// 查询已添加的部门或用户组
export async function getProjectRoleMap(body) {
  return NodeOPrequest(`/project/api/project/get_project_role_map`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}
// 更新部门或用户组
export async function setProjectRoleMap(body) {
  return NodeOPrequest(`/project/api/project/set_project_role_map`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

//部门或用户组列表
/**
 * graphql 请求
 *
 * @param graphql
 *
 * @return Promise<Response>
 */
export function graphqlRequest(graphql: string, teamUUID: string) {
  return request(`/project/api/project/team/${teamUUID}/items/graphql`, 'POST', {
    query: graphql
  })
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

// 查询用户组的人数
export async function getGroupsMemberCount(teamUUID, body) {
  return request(`/project/api/project/team/${teamUUID}/usergroups/member_count`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}
// 获取权限
export async function getUserPermissions(teamUUID: string, body: any) {
  return request(`/project/api/project/team/${teamUUID}/filter_evaluated_permissions`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

// 通知后端创建进度管理器
export async function create_process(body) {
  return NodeOPrequest(`/project/api/project/create_process`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

// 同步
export async function syncData(body) {
  return NodeOPrequest(`/project/api/project/sync`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}
