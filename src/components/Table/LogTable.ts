import React, { useMemo, useCallback, memo } from 'react'
import { Button, Input } from 'antd'
import { _t } from 'utils/i18n';
import { useCallbackFn, useSearchConf } from 'hooks'
import { TableModalQuery } from 'src/KComponents/TableModal'

/**
 * 通用日志日志表格
 * @param {{
 *  paramsKey: string,
 *  fetchApi: (params?: Reacrd<string, any>) => Promise<any>,
 *  placeholder?: string,
 *  content?: React.ReactNode,
 *  list?: any[] | (form, conf) => any[],
 *  columns?: any[],
 *  rowKey?: string,
 * }} props
 */
const LogTable = (props) => {
  const { paramsKey, placeholder, content, fetchApi, columns: columnsList, rowKey = 'id', list } = props
  const { setFnCurr, onFnHandle } = useCallbackFn()
  const hasSearchInput = !!paramsKey || (Array.isArray(list) ? !!list.length : !!list)
  const confObj = useMemo(() => ({
    useRow: hasSearchInput
  }), [hasSearchInput])

  const { searchConf } = useSearchConf({
    onResetClick: onFnHandle,
    paramsKey,
    placeholder,
    content,
    list,
  }, confObj)

  const columns = useCallback(({ onReset }) => {
    setFnCurr(onReset)
    return [
      ...(columnsList || []),
      {
        title: '操作人',
        dataIndex: 'applicant',
      }, {
        title: '操作时间',
        dataIndex: 'verifier',
      }, {
        title: '操作内容',
        dataIndex: 'remark',
      },
    ]
  }, [setFnCurr, columnsList])

  
  const tableConf = useMemo(() => ({
    columns,
    fetchApi,
    rowKey,
  }), [columns, fetchApi, rowKey])

  const conf = {
    table: tableConf,
    search: searchConf,
  }
  
  return <TableModalQuery {...conf} />
}

export default memo(LogTable)
