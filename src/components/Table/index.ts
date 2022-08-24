import React, { memo } from 'react'
import { Table } from 'antd'
import useTable from './useTable'
import ItemDel from './ItemDel'

/**
 * 表格
 * @param {Parameters<useTable>[0]} props 
 */
const KTable = (props) => {
  const { tableProps } = useTable(props)

  return (
    <Table {...tableProps} />
  )
}

export {
  ItemDel,
  useTable
}

export default memo(KTable)
