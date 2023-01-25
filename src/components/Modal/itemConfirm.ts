// 二次确认框，默认是删除信息
import React, { useMemo, memo, useCallback } from 'react'
import { _t } from 'utils/i18n';
import { useRequest } from 'src/hooks'
import ConfirmButton from './confirmButton'

const getParamsId = (data, keyField) => ({ [keyField]: data?.[keyField] })

/**
 * 删除操作
 * @param {{
 *  onOk(isDel: boolean): void,
 *  fetchApi: (params) => Promise<any>,
 *  data?: Record<string, any>,
 *  getParams?: (data: Record<string, any>) => Record<string, any>, // 默认获取 id {id: string},
 *  keyField?: string,
 * } & Omit<Parameters<ConfirmButton>[0], 'loading' | 'onOk'>} props
 */
const ItemConfirm = (props) => {
  const { data, onOk, fetchApi, getParams = getParamsId, params: paramsProps, keyField = 'id', ...others } = props
  const params = useMemo(() => {
    return typeof getParams === 'function' ? getParams(data, keyField) : data
  }, [data, getParams, keyField])

  const { onFetch, loading } = useRequest(fetchApi, { manual: true, isSilence: false, fetchHandleConf: {
    onOk() {
      onOk?.(true)
    }
  }})

  const onOkClick = useCallback(() => {
    return onFetch({...params, ...paramsProps})
  }, [params, paramsProps])

  return <ConfirmButton onOk={onOkClick} type="link" {...others} loading={loading} />
}

export default memo(ItemConfirm)
