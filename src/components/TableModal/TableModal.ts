import React from 'react'
import KModal from '../KModal'
import KTable from '../KTable'

/**
 * 表格
 * @param {{
 *  table: Parameters<KTable>[0],
 *  modal: Parameters<KModal>[0],
 * } props 
 */
const TableModal = (props) => {
  const { table: tableProps, modal: modalProps } = props
  return <div>
    <KTable {...tableProps} />
    {modalProps?.modalConf?.visible && <KModal {...modalProps} />}
  </div>
}

export default TableModal
