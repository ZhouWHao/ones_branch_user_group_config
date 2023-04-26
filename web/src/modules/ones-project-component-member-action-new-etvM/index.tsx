import React, { useState, useEffect, useMemo } from 'react'
import type { FC } from 'react'
import ReactDOM from 'react-dom'
import { ConfigProvider, Button, toast } from '@ones-design/core'
import './index.css'
import { useTeamInfo, useProjectInfo, useProjectRoleInfo, useUserInfo } from '@ones-op/store'
import NewUserGroupModal from './modal'
import { useRequest } from 'ahooks'
import { OPDispatch, MFDispatch } from '@ones-op/event'
import { getProjectRoleMap, syncData, create_process } from '../../common/api'
import {
  graphqlRequest,
  getGroupsMemberCount,
  getUserPermissions,
  setProjectRoleMap,
} from '../../common/api'
import _ from 'lodash'
const NewUserGroup: FC = () => {
  const { uuid: userUUID } = useUserInfo() //用户信息
  const { uuid: teamUUID, name: teamName } = useTeamInfo() // 团队信息
  const { uuid: projectUUID } = useProjectInfo() //项目信息
  const { uuid: roleUUID, name: roleName } = useProjectRoleInfo() //选中项目角色
  const [tooltipMsg, setToolMessage] = useState('没有已选的部门或用户组')
  const [synchronizeDisabled, SynchronizeDisabled] = useState(true)
  const [isAuthority, setIsAuthority] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [departments, setDepartments] = useState([])
  const [user_groups, setUserGroups] = useState([])
  const [defaultChecked, setDefaultChecked] = useState({
    departments: [],
    user_groups: [],
  })
  // 查询用户组的人数
  const getGroupsCountList = async (groupsList) => {
    const idarr = []
    for (let i = 0; i < groupsList.length; i++) {
      idarr.push(groupsList[i].uuid)
    }
    const body = {
      ignore_usergroup_ids: [],
      ignore_userrole_ids: [],
      project_id: '',
      source: 2,
      user_group_ids: idarr,
    }
    const res = await getGroupsMemberCount(teamUUID, body)
    if (res.status === 200 && res.data) {
      return res.data.usergroups
    } else {
      return []
    }
  }
  // 查询部门
  const getDepartments = async () => {
    const gql = `
      {
          departments(
            orderBy:{namePinyin: DESC}
          )
          {
            name
            uuid
            member_count: memberCount
            sync_type: syncType
            parent_uuid: parent
            next_uuid: next
          }
      }
      `
    const res = await graphqlRequest(gql, teamUUID)
    if (res.status === 200) {
      if (res?.data && res?.data?.data && res?.data?.data?.departments) {
        let list = res.data.data.departments
        list = list.map((i) => ({
          ...i,
          content: i.name,
          key: i.uuid,
          parentId: i.parent_uuid || 'team',
          title: '',
        }))
        const addTeamObj = {
          name: teamName,
          uuid: 'team',
          parent_uuid: '',
          parentId: '',
          isRoot: true,
          content: teamName,
          key: 'team',
          member_count: list.length,
          title: '',
          depth: 0,
          checkable: false,
          children: list,
        }
        setDepartments([addTeamObj])
      } else {
        setDepartments([])
      }
    } else {
      toast.error('获取信息失败', 2000, false)
      setDepartments([])
    }
  }

  // 查询所有用户组
  const getUserGroups = async () => {
    const gql = `  
        {
          userGroups(
            orderBy: {
              namePinyin: ASC
            }
          ){
            name
            uuid
          }
        }
    `
    const res = await graphqlRequest(gql, teamUUID)
    if (res.status === 200) {
      if (res?.data && res?.data?.data && res?.data?.data?.userGroups) {
        let list = res.data.data.userGroups
        const countList = await getGroupsCountList(list)
        list = list.map((i, index) => ({
          ...i,
          checkable: true,
          content: `${i.name}`,
          description: `${countList[index].member_count}人`,
          id: i.uuid,
          key: i.uuid,
          parentId: '',
          title: '',
        }))
        setUserGroups(list)
      } else {
        setUserGroups([])
      }
    } else {
      toast.error('获取信息失败', 2000, false)
    }
  }
  const synchronizeData = async () => {
    // 模拟存储时间
    const nowTime = new Date().getTime()
    localStorage.setItem('syncTime', nowTime.toString())
    // 获取进度id
    const res1: any = await create_process({ user_uuid: userUUID, timeoutSeconds: 60 })
    if (res1.status === 200) {
      // 同步
      const res: any = await syncData({
        process_uuid: res1.data.res,
        project_uuid: projectUUID,
      })
      OPDispatch('invoke:ones:global:progressManager')
      if (res.status === 200) {
        SynchronizeDisabled(true)
        // 刷新用户列表
        OPDispatch('ones:event:memberList:refresh')
        setToolMessage('请1分钟后重试')
        setTimeout(() => {
          SynchronizeDisabled(false)
          setToolMessage('同步已选的部门或用户组')
        }, 60000)
      }
    }
  }

  const { run: getSyncHandler } = useRequest(synchronizeData, {
    debounceWait: 500,
    manual: true,
  })

  const [checkData, setCheckData] = useState({
    departments: [],
    user_groups: [],
  })
  const [activeTabKey, setActiveTabKey] = useState('departments')

  // 查询设置数据
  const getProjectRoleMapData = async () => {
    const res: any = await getProjectRoleMap({
      role_uuid: roleUUID,
      project_uuid: projectUUID,
    })
    if (res.status === 200) {
      const { data } = res
      setDefaultChecked({
        departments: data.res.find((item) => item.relation_type === 1)?.relation_uuids || [],
        user_groups: data.res.find((item) => item.relation_type === 2)?.relation_uuids || [],
      })
      setCheckData({
        departments: data.res.find((item) => item.relation_type === 1)?.relation_uuids || [],
        user_groups: data.res.find((item) => item.relation_type === 2)?.relation_uuids || [],
      })
    }
  }

  const showNewUserGroupModal = () => {
    getDepartments()
    getUserGroups()
    getProjectRoleMapData()
    setModalVisible(true)
  }

  const handleCancel = () => {
    setModalVisible(false)
  }
  const isNoOperation = useMemo(() => {
    const diff1 = _.isEqualWith(defaultChecked.departments, checkData.departments)
    const diff2 = _.isEqualWith(defaultChecked.user_groups, checkData.user_groups)
    return diff1 && diff2
  }, [defaultChecked, checkData])
  const handleSave = async () => {
    if (isNoOperation || (!checkData.user_groups.length && !checkData.departments.length)) {
      handleCancel()
      return false
    }
    const relations =
      checkData.departments.length && checkData.user_groups.length
        ? [
            { relation_type: '1', relation_uuids: checkData.departments },
            { relation_type: '2', relation_uuids: checkData.user_groups },
          ]
        : checkData.departments.length
        ? [{ relation_type: '1', relation_uuids: checkData.departments }]
        : checkData.user_groups.length
        ? [{ relation_type: '2', relation_uuids: checkData.user_groups }]
        : []
    const res: any = await setProjectRoleMap({
      project_uuid: projectUUID,
      role_uuid: roleUUID,
      relations,
    })
    if (res.status === 200) {
      const arr = []
      const { departments, user_groups } = checkData
      if (departments.length) {
        arr.push(`${departments.length}个部门`)
      }
      if (user_groups.length) {
        arr.push(`${user_groups.length}个用户组`)
      }
      const text = arr.join('，')
      toast.success(`${text}成功添加到「${roleName}角色」`)
      setModalVisible(false)
      // 刷新用户列表
      OPDispatch('ones:event:memberList:refresh')
      // 同步按钮状态
      SynchronizeDisabled(false)
      setToolMessage('同步已选的部门或用户组')
      // 模拟存储同步动作时间
      const nowTime = new Date().getTime()
      localStorage.setItem('syncTime', nowTime.toString())
    } else {
      toast.error(res.reason)
      return false
    }
  }

  const { run: saveDataHandler } = useRequest(handleSave, {
    debounceWait: 500,
    manual: true,
  })

  // 查询是否有权限
  const getUserPermissionsFn = async () => {
    const body = {
      rules: [
        {
          context_param: { project_uuid: projectUUID },
          context_type: 'project',
          permission: 'manage_project',
        },
      ],
    }
    const permissionsres = await getUserPermissions(teamUUID, body)
    if (permissionsres.status === 200 && permissionsres.data) {
      if (permissionsres.data.evaluated_permissions.length > 0) {
        setIsAuthority(true)
      } else {
        setIsAuthority(false)
      }
    }
  }
  const getLastSyncTime = async () => {
    const nowTime = new Date().getTime()
    const res = { data: Number(localStorage.getItem('syncTime')) }

    if (res.data) {
      // 同步过
      const interval = nowTime - res.data
      if (interval <= 60000) {
        SynchronizeDisabled(true)
        setToolMessage('请1分钟后重试')

        setTimeout(() => {
          SynchronizeDisabled(false)
          setToolMessage('同步已选的部门或用户组')
        }, 60000 - interval)
      } else {
        SynchronizeDisabled(false)
        setToolMessage('同步已选的部门或用户组')
      }
    } else {
      return false
    }
  }

  useEffect(() => {
    getUserPermissionsFn()
    getLastSyncTime()
  }, [])

  return (
    <>
      {isAuthority && (
        <>
          <Button
            tooltipProps={{ title: tooltipMsg }}
            disabled={synchronizeDisabled}
            onClick={getSyncHandler}
          >
            同步
          </Button>
          <Button onClick={showNewUserGroupModal}>管理部门或用户组</Button>
        </>
      )}
      <NewUserGroupModal
        visible={modalVisible}
        data={{ departments, user_groups }}
        onCancel={handleCancel}
        onOk={saveDataHandler}
        setCheckData={setCheckData}
        setTabKey={setActiveTabKey}
        tabKey={activeTabKey}
        checkKey={checkData}
      />
    </>
  )
}
ReactDOM.render(
  <ConfigProvider>
    <NewUserGroup />
  </ConfigProvider>,
  document.getElementById('ones-mf-root')
)
