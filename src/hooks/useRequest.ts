import { useCallback, useState, useRef, useEffect } from 'react'
import { fetchHandle } from 'utils/request'
import useNewRef from './useNewRef'
import useLoading from './useLoading'
import useIsUpdate from './useIsUpdate'

const EmptyObj = Object.freeze({})

/**
 * 数据请求
 * @template T
 * @param {(params: Record<any, any>) => Promise<TableFetchData>} fetchApi
 * @param {{
 *  fetchHandleConf: Record<string, Function> | ((setData: React.Dispatch<React.SetStateAction<T | undefined>>) => Record<string, Function>),
 *  initParams?: Record<string, any>,
 *  initSilenceParams?: Record<string, any>, // 变化不发请求的参数，优先级低于params
 *  initData?: T,
 *  checkFetch?: (params) => boolean, // 判断是否需要发请求
 *  isSilence?: boolean, // true 不提示正确时的信息,
 *  manual?: boolan, // 手动处理请求,
 *  delay?: boolean, // 第一次不执行
 * }} [conf]
 */
const useRequest = (fetchApi, conf = {}) => {
  const confRef = useNewRef(conf || EmptyObj)
  const { initData, initParams = {}, initSilenceParams = {}, manual = false, delay = false } = confRef.current
  const {loading, onLoading} = useLoading(() => (manual || delay) ? false : !!fetchApi)
  const [data, setData] = useState(initData)
  const isUpdateRef = useIsUpdate()
  const dataRef = useNewRef(data)

  // 默认成功后的数据处理方式
  const onSetData = useCallback((res) => {
    setData(res?.data)
  }, [])
  const [params, setParams] = useState(initParams)
  const silenceParamsRef = useRef(initSilenceParams)
  const setSilenceParams = useCallback((paramsObj) => {
    let res = paramsObj
    if(typeof res === 'function') {
      res = res(silenceParamsRef.current)
    }
    silenceParamsRef.current = {
      ...silenceParamsRef.current,
      ...res
    }
  }, [])
  const timeRef = useRef()
  const onFetch = useCallback(async (fetchParams) => {
    if (fetchApi) {
      const { checkFetch, fetchHandleConf, isSilence = true } = confRef.current
      if(typeof checkFetch === 'function' && checkFetch(params) === false) {
        return
      }
      timeRef.current = Date.now()
      const time = timeRef.current
      const onLoadingEnd = onLoading()
      const fetchConf = (typeof fetchHandleConf === 'function' ? fetchHandleConf(setData) : fetchHandleConf) || {}
      const { onUpdate: onUpdateFn, onOk, onSilenceOk } = fetchConf
      const onUpdate = onUpdateFn || (() => {
        return time != null && time !== timeRef.current
      })
      let defConf = {}
      // 没有成功的函数处理
      if(!onOk && !onSilenceOk) {
        // 默认成功后数据处理方式
        defConf = {
          [isSilence ? 'onSilenceOk' : 'onOk']: onSetData
        }
      }
      const allParams = { ...silenceParamsRef.current, ...params, ...fetchParams}
      return fetchHandle(fetchApi(allParams), {
        ...defConf,
        ...fetchConf,
        onUpdate,
        params: allParams,
      }).finally(() => {
        if(!onUpdate()) {
          onLoadingEnd()
        }
      })
    }
  }, [fetchApi, params, onLoading, confRef, onSetData])

  useEffect(() => {
    if(manual) return
    if(delay && !isUpdateRef.current) return
    onFetch()
  }, [manual, onFetch, delay]);
  return {
    data,
    dataRef,
    loading,
    params,
    setParams,
    setData,
    silenceParams: silenceParamsRef.current,
    setSilenceParams,
    onFetch
  }
}

export default useRequest
