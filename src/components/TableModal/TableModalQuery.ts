import React, { useMemo, memo } from 'react'
import { DataQuery, DataQueryKey } from '../Query'
import TableModal from './TableModal'

/**
 * TableModal 处理 params
 * @param {Parameters<TableModal>[0] & {[DataQueryKey]: { params: Record<string, any> }}} props
 */
const TableModalWrap = (props) => {
  const { [DataQueryKey]: { params }, table, ...ohters } = props
  const tableProps = useMemo(() => {
    return {
      ...table,
      params: {
        ...table?.params,
        ...params,
      }
    }
  }, [params, table])
  return <TableModal table={tableProps} {...ohters} />
}

/**
 * TableModalQuery 具有搜索功能的表格+弹窗
 * @param {Parameters<TableModal>[0] & {search: Parameters<DataQuery>[0]}} props
 */
const TableModalQuery = (props) => {
  const { search, ...tableModalProps } = props
  return <DataQuery {...search}>
    <TableModalWrap {...tableModalProps} />
  </DataQuery>
}

export default memo(TableModalQuery)
