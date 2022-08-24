import { useCallback, useMemo, useState, useEffect } from 'react'
import { ColumnProps } from 'antd/lib/table'
import { useIsUpdate, useRequest, useNewRef } from 'src/hooks'


const tableDataFormat = (res) => {
  const { currentPage: current, pageSize, totalNum: total, items } = res
  return {
    ...res,
    data: {
      pageInfo: {
        current,
        pageSize,
        total
      },
      dataSource: Array.isArray(items) ? items : []
    }
  }
}

/**
 * 表格数据请求接口
 * @template { Record<any, any> } T
 * @typedef {{
 *  code: string,
 *  currentPage: number,
 *  items: T[],
 *  msg: string,
 *  pageSize: number,
 *  retry: boolean,
 *  success: boolean,
 *  totalNum: number,
 *  totalPage: number
 * }} TableFetchData
 */

/**
 * 表格
 * @param {{
 *  columns: ColumnProps[] | (conf: { onRest: Function }) => ColumnProps[]
 *  fetchApi: (params: Record<any, any>) => Promise<TableFetchData>,
 *  rowKey: string | ((record: T, index: number) => string)
 *  pageSize?: number, // 10
 *  params?: Record<string, any>,
 * }} props 
 */
const useTable = (props) => {
  const { columns: columnsProp, fetchApi, params: paramsProps, rowKey, pageSize = 10 } = props
  const [tableParams, setTableParams] = useState({
    pageSize,
    pageNo: 1,
  })
  const tableParamsRef = useNewRef(tableParams)
  const isUpdateRef = useIsUpdate()
  const { loading, setParams, data } = useRequest(fetchApi, {
    initParams: {
      ...paramsProps,
      ...tableParams,
    },
    initData: {
      pageInfo: {
        current: 0,
        pageSize,
        total: 0,
      },
      dataSource: []
    },
    fetchHandleConf: {
      dataFormat: tableDataFormat
    }
  })

  const { pageInfo, dataSource } = data
  const dataSourceLen = dataSource && dataSource.length || 0

  const onChange = useCallback((pageNo, pageSize) => {
    setTableParams({
      pageNo,
      pageSize
    })
  }, [])

  /**
   * 默认动态处理刷新页
   * @type {(isDel?: boolean, pageNo?: number) => void}
   */
  const onReset = useCallback((isDel = false, pageNo) => {
    setTableParams(params => {
      if (isDel === true && pageNo == null) {
        pageNo = Math.max(dataSourceLen <= 1 ? params.pageNo - 1 : params.pageNo, 1)
      }
      return pageNo ? { ...params, pageNo } : { ...params }
    })
  }, [dataSourceLen])

  const pagination = useMemo(() => {
    return {
      ...pageInfo,
      onChange
    }
  }, [pageInfo, onChange])

  useEffect(() => {
    if(!isUpdateRef.current) return
    setParams({
      ...paramsProps,
      ...tableParamsRef.current,
      pageNo: 1
    })
  },[paramsProps])

  useEffect(() => {
    if(!isUpdateRef.current) return
    setParams(params => ({
      ...params,
      ...tableParams,
    }))
  }, [tableParams, setParams, isUpdateRef])

  useEffect(() => {
    if(!isUpdateRef.current) return
    setTableParams(x => ({...x, pageSize}))
  }, [pageSize])

  const columns = useMemo(() => {
    return typeof columnsProp === 'function' ? columnsProp({ onReset }) : columnsProp
  }, [onReset, columnsProp])

  return {
    tableProps: {
      columns,
      dataSource,
      pagination,
      rowKey,
      loading
    },
    onReset,
  }
}

export default useTable
