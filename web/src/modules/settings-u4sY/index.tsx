import React, { useState, useCallback, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { ConfigProvider, Alert, InputNumber, Button, Form, Select, toast } from '@ones-design/core'
import { OPFetch } from '@ones-op/fetch'
import './index.css'
import { syncFrequency, getFrequency } from '../../common/api'
const SettingsUserGroup = () => {
  const [form] = Form.useForm()
  const [disabled, setDisabled] = useState(true)
  const frequency = Form.useWatch('frequency', form)
  const unit = Form.useWatch('unit', form)
  enum IntervalUnit {
    'minute' = 1,
    'hour' = 2,
    'day' = 3,
  }
  const syncFrequencyAction = useCallback(async () => {
    const res: any = await syncFrequency({ interval: frequency, unit: IntervalUnit[unit] })
    if (res?.status === 200) {
      toast.success('保存成功')
    }
  }, [IntervalUnit, frequency, unit])

  const getInitialSyncFrequency = useCallback(async () => {
    const res: any = await getFrequency()
    if (res.status === 200) {
      form.setFieldsValue({
        frequency: res.data.res.interval,
        unit: IntervalUnit[res.data.res.unit],
      })
    } else {
      form.setFieldsValue({ frequency: 1, unit: 'minute' })
    }
  }, [])
  useEffect(() => {
    getInitialSyncFrequency()
  }, [getInitialSyncFrequency])
  return (
    <>
      <Alert type="info">
        当添加项目成员选择部门或用户组，若部门或用户组调整，将按照同步频率同步部门或用户组的成员到项目成员列表中。
      </Alert>
      <Form
        form={form}
        layout="vertical"
        labelCol={{
          span: 24,
        }}
        name="settingUserGroupForm"
        // initialValues={{ frequency: 1, unit: 'minute' }}
        onValuesChange={() => {
          setDisabled(false)
        }}
        onFinish={syncFrequencyAction}
      >
        <div className="inline_item_content">
          <Form.Item
            label="部门或用户组同步频率"
            name="frequency"
            rules={[
              {
                required: true,
                message: '请输入大于0的整数',
              },
            ]}
          >
            <InputNumber
              max={68719476736}
              min={1}
              step={1}
              parser={(value) => value.replace(/\D/g, '')}
            />
          </Form.Item>
        </div>
        <div className="inline_item_content">
          <Form.Item name="unit">
            <Select
              className="unit_select"
              bordered
              notFoundContent="没有匹配结果"
              optionFilterProp="label"
              optionLabelProp="label"
              options={[
                {
                  label: '分钟',
                  value: 'minute',
                },
                {
                  label: '小时',
                  value: 'hour',
                },
                {
                  label: '天',
                  value: 'day',
                },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item name="button">
          <Button
            disabled={disabled}
            onClick={() => {
              setDisabled(true)
              form.submit()
            }}
            type="primary"
          >
            保存
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
ReactDOM.render(
  <ConfigProvider>
    <SettingsUserGroup />
  </ConfigProvider>,
  document.getElementById('ones-mf-root')
)
