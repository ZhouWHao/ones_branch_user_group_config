import { request, NodeOPrequest } from './fetch'

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

// 更新定时频率
export async function updateFrequency(body) {
  return NodeOPrequest(`/project/api/project/cron_job`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}
// 获取定时频率
export async function getFrequency() {
  return NodeOPrequest(`/project/api/project/query_cron_job`, 'GET')
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
    query: graphql,
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

// 查询已添加的部门或用户组
export async function getCheckedData(body) {
  return NodeOPrequest(`/project/api/project/check_data`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

// 更新部门或用户组
export async function updateCheckedData(body) {
  return NodeOPrequest(`/project/api/project/add_member`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

// 通知后端创建进度管理器
export async function createProcessManagement() {
  return NodeOPrequest(`/project/api/project/createProcessManagement`, 'GET')
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

// 同步
export async function activeSync(body) {
  return NodeOPrequest(`/project/api/project/sync_data`, 'POST', body)
    .then((res) => {
      return res
    })
    .catch((err) => {
      console.log(err)
    })
}

// export async function getLastFrequencyTime(teamUUID: String, projectUUID: String) {
//   return NodeOPrequest(`/project/api/project/team/${teamUUID}/project/${projectUUID}/get_last_frequency_time`, 'GET')
//     .then((res) => {
//       return res
//     })
//     .catch((err) => {
//       console.log(err)
//     })
// }
