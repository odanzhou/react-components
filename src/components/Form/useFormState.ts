// 表单状态
import { useCallback } from 'react'
import { useMemo, useState, useRef, useEffect } from 'react'

/**
 * 获取禁用状态
 * @param {Record<string, any>} [data]
 */
const getDisabledStatus = (data) => {
  return !!data && typeof data === 'object' && !!Object.values(data).filter(x => x != null || x !== '').length
}

/**
 * 表单配置信息
 * 编辑状态，以及初始化的值
 * @tempalte T
 * @param {{
 *  initDisabled?: boolean,
 *  initVisible?: boolean,
 *  useDisabled?: boolean,
 * }} [conf]
 * @param { T } data data (接口数据而非编辑数据)
 */
const useFormState = (data, conf) => {
  const { initDisabled, initVisible = false, useDisabled = false } = conf || {}
  const [visible, setVisible] = useState(initVisible)
  const [disabled, setDisabled] = useState(() => {
    if(typeof initDisabled === 'boolean') return initDisabled
    return getDisabledStatus(data)
  }) // 禁用（不能编辑）
  const isUpdateRef = useRef(false)
  const keyRef = useRef(0)
  // 数据变化时生成一个新的key
  useMemo(() => {
    keyRef.current++
  }, [data])

  const onSetKey = useCallback(() => keyRef.current++, [])

  useEffect(() => {
    if(isUpdateRef.current && useDisabled) {
      setDisabled(getDisabledStatus(data))
    }
  }, [data, useDisabled]);

  useEffect(() => {
    isUpdateRef.current = true
  }, []); 

  return {
    disabled,
    setDisabled,
    visible,
    setVisible,
    key: keyRef.current,
    onSetKey
  }
}

export default useFormState
