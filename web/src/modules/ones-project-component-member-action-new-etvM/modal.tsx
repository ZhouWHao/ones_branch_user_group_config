import type { FC } from 'react'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Modal, toast } from '@ones-design/core'
import NewUserGroupTransfer from './transfer'

const NewUserGroupModal: FC<{
  data: { departments: {}[]; user_groups: {}[] }
  visible: boolean
  onCancel: () => void
  onOk: () => void
  setCheckData
  setTabKey
  tabKey
  checkKey
}> = ({ visible, onCancel, onOk, data, setCheckData, setTabKey, tabKey, checkKey }) => {
  const tabs = [
    { key: 'departments', label: '部门' },
    { key: 'user_groups', label: '用户组' },
  ]

  return (
    <Modal width={880} onCancel={onCancel} onOk={onOk} title="管理部门或用户组" visible={visible}>
      <NewUserGroupTransfer
        tabChange={(tab) => setTabKey(tab)}
        tabs={tabs}
        activeTabKey={tabKey}
        checkedKeys={checkKey}
        data={data}
        checkDataRemove={(tab, item) => {
          const list = checkKey[tab].filter((i) => i !== item.key)
          setCheckData((prev) => ({
            ...prev,
            [tab]: list,
          }))
        }}
        checkDataChange={(tab, values) => {
          setCheckData((prev) => ({
            ...prev,
            [tab]: values,
          }))
        }}
        clearSelected={() =>
          setCheckData({
            departments: [],
            user_groups: [],
          })
        }
      />
    </Modal>
  )
}
export default NewUserGroupModal
