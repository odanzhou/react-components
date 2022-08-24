import React, { useMemo, memo } from 'react'
import { Popconfirm, Button } from 'antd'
import { fetchHandle } from 'src/utils/request'
import { useLoading } from 'src/hooks'

const getParamsId = data => data && data.id

/**
 * 删除操作
 * @param {{
 *  data: Record<string, any>,
 *  onOk(isDel: boolean): void,
 *  fetchApi: (params) => Promise<any>
 *  getParams?: (data: Record<string, any>) => any, // 默认获取id
 * }} props
 */
const ItemDel = (props) => {
  const { data, onOk, fetchApi, getParams = getParamsId } = props
  const { loading, onLoading } = useLoading()
  const params = useMemo(() => {
    return typeof getParams === 'function' ? getParams(data) : data
  }, [data, getParams])
  return (
    <div style={{ minWidth: 100 }}>
      <Popconfirm
        title="确认删除?"
        onConfirm={() => {
          const onLoadingEnd = onLoading()
          fetchHandle(fetchApi(params), {
            onOk() {
              onOk(true)
            }
          }).finally(onLoadingEnd)
        }}
        okText="确认"
        cancelText="取消"
      >
        <Button type="link" loading={loading}>删除</Button>
      </Popconfirm>
    </div>
  )
}

export default memo(ItemDel)
