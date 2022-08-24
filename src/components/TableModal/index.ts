import React, { memo } from 'react'
import { ColumnProps } from 'antd/lib/table'
import KModal from '../KModal'
import KTable, { ItemDel } from '../KTable'

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
 *  table: {
 *      columns: ColumnProps[],
 *      fetchApi: (params: Record<any, any>) => Promise<TableFetchData>,
 *      rowKey: string | ((record: T, index: number) => string)
 *  },
 * modal: {
 *  modalConf?: {
 *    visible: boolean,
 *    title: React.ReactNode,
 *    onCancel(): void,
 *    onOk(params: Record<string, any>): void,
 *  },
 * }
 * }} props 
 */
const TableModal = (props) => {
  const { table: tableProps, modal: modalProps } = props
  return <div>
    <KTable {...tableProps} />
    {modalProps?.modalConf?.visible && <KModal {...modalProps} />}
  </div>
}

export {
  ItemDel
}

export default TableModal
