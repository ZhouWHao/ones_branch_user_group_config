import type { PluginRequest, PluginResponse } from '@ones-op/node-types'
import type { Relation } from './dao/project_role_map'
import type { IntervalUnit, SyncCron } from './dao/project_user_sync_cron'
import * as service from './service'
import type { SyncResult, SetProjectRoleMapResult } from './service'

export async function hello(request: PluginRequest): Promise<PluginResponse> {
  return {
    body: {
      res: 'ok'
    }
  }
}

interface GetProjectRoleMapInput {
  project_uuid: string
  role_uuid: string
}

/**获取角色部门映射 */
export async function get_project_role_map(
  request: PluginRequest<GetProjectRoleMapInput>
): Promise<PluginResponse> {
  try {
    const input = request.body
    const res = await service.get_project_role_map(input.project_uuid, input.role_uuid)
    return {
      body: {
        res: res as Relation[]
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        msg: '获取部门或用户组失败'
      }
    }
  }
}

interface SetProjectRoleMapInput {
  project_uuid: string
  role_uuid: string
  relations: Relation[]
}
/**设置角色部门映射 */
export async function set_project_role_map(
  request: PluginRequest<SetProjectRoleMapInput>
): Promise<PluginResponse> {
  try {
    const input = request.body
    const res = await service.set_project_role_map(
      input.project_uuid,
      input.role_uuid,
      input.relations
    )
    return {
      body: {
        res: res as SetProjectRoleMapResult
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        msg: '设置部门或用户组失败'
      }
    }
  }
}

interface SyncInput {
  process_uuid: string
  project_uuid: string
}
/**手动同步 */
export async function sync(request: PluginRequest<SyncInput>): Promise<PluginResponse> {
  try {
    const input = request.body
    const res = await service.sync_by_project(input.process_uuid, input.project_uuid)
    return {
      body: {
        res: res as SyncResult
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        msg: '同步失败'
      }
    }
  }
}

function warning(reason: string) {
  return {
    statusCode: 400,
    body: {
      reason,
      code: 400,
      type: 'warning',
      model: 'plugin.xxx'
    }
  }
}

class CreateProcessInput {
  user_uuid!: string
  timeoutSeconds = 60
}
/**创建进度 */
export async function create_process(
  request: PluginRequest<CreateProcessInput>
): Promise<PluginResponse> {
  try {
    const input = request.body
    const res = await service.create_process(input.user_uuid, input.timeoutSeconds)
    return {
      body: {
        res: res as string
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        msg: '创建进度失败'
      }
    }
  }
}

interface DeleteMemberInput {
  members: string[]
}
/**删除成员 */
export async function delete_member(
  request: PluginRequest<DeleteMemberInput>
): Promise<PluginResponse> {
  const input = request.body
  // console.log(input)
  // console.log(request.url)
  const url_match = request.url?.match('^/team/.+/project/(.+)/role/(.+)/members/delete$')
  const project_uuid = url_match?.[1]
  const role_uuid = url_match?.[2]
  if (!project_uuid) {
    return warning('缺少项目ID')
  }

  if (!role_uuid) {
    return warning('缺少角色ID')
  }
  try {
    const done = await service.delete_member(
      project_uuid as string,
      role_uuid as string,
      input.members
    )
    if (done) {
      return {
        body: {
          msg: 'success'
        }
      }
    } else {
      return warning('该用户为同步用户，请在部门或用户组中设置')
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        msg: '删除成员失败'
      }
    }
  }
}

/**删除角色 */
export async function delete_role(request: PluginRequest): Promise<PluginResponse> {
  // console.log(input)
  // console.log(request.url)
  const url_match = request.url?.match('^/team/.+/project/(.+)/role/(.+)/delete$')
  const project_uuid = url_match?.[1]
  const role_uuid = url_match?.[2]
  if (!project_uuid) {
    return warning('缺少项目ID')
  }

  if (!role_uuid) {
    return warning('缺少角色ID')
  }
  try {
    await service.delete_role(project_uuid, role_uuid)
    return {
      body: {
        msg: 'success'
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        msg: '删除角色失败'
      }
    }
  }
}

interface SetCronInput {
  interval: number
  unit: IntervalUnit
}
/**设置定时任务 */
export async function set_cron(request: PluginRequest<SetCronInput>): Promise<PluginResponse> {
  try {
    const input = request.body
    await service.set_cron(input.interval, input.unit)
    return {
      body: {
        msg: 'success'
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        msg: '设置定时任务失败'
      }
    }
  }
}

/**获取定时任务 */
export async function get_cron(request: PluginRequest): Promise<PluginResponse> {
  try {
    const res = await service.get_cron()
    return {
      body: {
        res: res as SyncCron
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: {
        msg: '获取定时任务失败'
      }
    }
  }
}
