import type { FC } from 'react'
import { useMemo } from 'react'
import React, { useState, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Input, Tabs, Tree, toast } from '@ones-design/core'
import { FolderFilled, Close } from '@ones-design/icons'
import { useRequest } from 'ahooks'
import './transfer.css'

const NewUserGroupTransfer: FC<{
  tabs
  activeTabKey
  checkedKeys
  tabChange
  checkDataChange
  checkDataRemove
  clearSelected
  data
}> = ({
  tabs,
  activeTabKey,
  checkedKeys,
  tabChange,
  checkDataChange,
  checkDataRemove,
  clearSelected,
  data,
}) => {
  const [searchValue, setSearchValue] = useState('')
  const recurrenceData = useCallback((arr, queryArr, result) => {
    arr.forEach((item) => {
      if (item.children) {
        recurrenceData(item.children, queryArr, result)
      }
      if (queryArr.includes(item.key)) {
        result.push(item)
      }
    })

    return result
  }, [])

  const targetData = useMemo(() => {
    let departments = []
    let user_groups = []
    if (checkedKeys.departments.length) {
      departments = recurrenceData(data.departments, checkedKeys.departments, [])
    }
    if (checkedKeys.user_groups.length) {
      user_groups = data.user_groups.filter((item) => checkedKeys.user_groups.includes(item.key))
    }
    return { departments, user_groups }
  }, [
    checkedKeys.departments,
    checkedKeys.user_groups,
    recurrenceData,
    data.departments,
    data.user_groups,
  ])

  const department_content = useMemo(() => {
    return targetData.departments.length ? (
      <div className="result_department">
        <div className="data_list_title">部门</div>
        <div className="data_list">
          {targetData.departments.map((item) => (
            <div className="data_item">
              {item.content}
              <Close onClick={() => checkDataRemove('departments', item)} />
            </div>
          ))}
        </div>
      </div>
    ) : null
  }, [checkDataRemove, targetData.departments])

  const user_groups_content = useMemo(() => {
    return targetData.user_groups.length ? (
      <div className="user_groups">
        <div className="data_list_title">用户组</div>
        <div className="data_list">
          {targetData.user_groups.map((item) => (
            <div className="data_item">
              {item.content}
              <Close onClick={() => checkDataRemove('user_groups', item)} />
            </div>
          ))}
        </div>
      </div>
    ) : null
  }, [checkDataRemove, targetData.user_groups])

  const result_tips_content = useMemo(() => {
    return checkedKeys.departments.length === 0 && checkedKeys.user_groups.length === 0 ? (
      <div className="result_tips">请在左侧选择{tabs[activeTabKey]}</div>
    ) : null
  }, [checkedKeys.departments, checkedKeys.user_groups, activeTabKey, tabs])

  const [treeData, setTreeData] = useState([])
  const handleSearchData = async (text: string) => {
    if (activeTabKey === 'departments') {
      const deepFind = (arr) => {
        const list = arr.reduce((acc, curr) => {
          if (curr.content.includes(text)) {
            acc.push(curr)
          } else {
            if (curr?.children && curr?.children?.length) {
              const child = deepFind(curr.children)
              if (child.length) {
                acc.push({
                  ...curr,
                  children: child,
                })
              }
            }
          }
          return acc
        }, [])
        return list
      }
      const result = deepFind(data.departments)
      setTreeData(result)
    } else {
      const list = data.user_groups.filter((i) => i.content.includes(text))
      setTreeData(list)
    }
  }

  const totalText = useMemo(() => {
    const arr = []
    if (targetData.departments.length) {
      arr.push(`${targetData.departments.length}个部门`)
    }
    if (targetData.user_groups.length) {
      arr.push(`${targetData.user_groups.length}个用户组`)
    }
    const text = arr.join('，')
    return `（共${text}）`
  }, [targetData])

  const { run: getSearchData } = useRequest(handleSearchData, {
    debounceWait: 500,
    manual: true,
  })
  const handleChangeSearch = (e) => {
    const { value } = e.target
    setSearchValue(value)
  }
  useEffect(() => {
    if (searchValue) {
      getSearchData(searchValue)
    } else {
      setTreeData(data[activeTabKey])
    }
  }, [data, activeTabKey, searchValue, getSearchData])
  return (
    <div className="main_content">
      <div className="left_content">
        <div className="content_title">全部</div>
        <div className="tree_content">
          <Tabs
            activeTabKey={activeTabKey}
            defaultActiveTabKey={tabs[0].key}
            tabs={tabs}
            border="bottom"
            onActiveTabChange={(tab: any) => {
              setSearchValue('')
              tabChange(tab.key)
            }}
          />
          <Input.Search
            className="input_search_content"
            value={searchValue}
            placeholder={`搜索${tabs.find((i) => i.key === activeTabKey).label}`}
            onChange={(e) => handleChangeSearch(e)}
          />
          {treeData.length ? (
            <Tree
              className="tree_main_content"
              defaultExpandAll
              checkable
              checkStrictly
              selectable={false}
              icon={activeTabKey === 'departments' ? <FolderFilled /> : undefined}
              checkedKeys={checkedKeys[activeTabKey]}
              treeData={treeData}
              onCheck={(checkedValue: any) => {
                const { checked } = checkedValue
                checkDataChange(activeTabKey, checked)
              }}
            />
          ) : (
            <div className="empty-data">暂无结果</div>
          )}
        </div>
      </div>
      <div className="right_content">
        <div>
          <div className="content_title">
            <span className="content_title_text">
              已选 <span className="sub_title_text">{totalText}</span>
            </span>

            <span className="clear_button" onClick={clearSelected}>
              <svg
                className="remove_svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.51968 4.29582L0.911111 6.90439C0.833006 6.98249 0.833006 7.10913 0.911111 7.18723L8.62824 14.9044C8.70634 14.9825 8.83298 14.9825 8.91108 14.9044L11.5197 12.2958M3.51968 4.29582L6.14927 1.66623C6.22752 1.58798 6.35444 1.58815 6.43249 1.66661L8.92375 4.17116L12.096 0.998899C12.1351 0.959846 12.1984 0.959846 12.2374 0.998899L14.971 3.73247C15.01 3.77152 15.01 3.83484 14.971 3.87389L11.791 7.05383L14.129 9.40438C14.2067 9.48255 14.2066 9.60889 14.1286 9.68684L11.5197 12.2958M3.51968 4.29582L11.5197 12.2958"
                  stroke="#606060"
                  stroke-width="1.5"
                />
              </svg>
              清空
            </span>
          </div>
          <div className="result_content">
            {result_tips_content}
            {department_content}
            {user_groups_content}
          </div>
        </div>
      </div>
    </div>
  )
}
export default NewUserGroupTransfer
