// 表单点击
import { useCallback } from 'react'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { useMemo } from 'react'

/**
 * 表单点击
 * @param { WrappedFormUtils } form
 * @param {{
 *  onOk(params: Record<string, any>, form: WrappedFormUtils, e: React.MouseEvent<HTMLElement, MouseEvent>): void,
 *  formList: {id?: string, group?: string}[],
 *  trim?: boolean,
 *  dataFormat?: (data?: Record<string, any>) => Record<string, any>
 * }} conf
 */
const useFormClick = (form, conf) => {
  const { onOk, trim, dataFormat, formList } = conf
  const { validateFields, getFieldsValue } = form
  const groupHandle = useMemo(() => {
    let hasGroup = false
    const groupHash = {}
    formList?.forEach(({id, group}) => {
      if(id && group) {
        hasGroup = true
        groupHash[id] = group
      }
    })
    return (values) => {
      if(hasGroup && values && typeof values === 'object') {
        values = Object.keys(values).reduce((res, key) => {
          const val = values[key]
          const groupKey = groupHash[key]
          if (groupKey) {
            if(!res[groupKey]) {
              res[groupKey] = {}
            }
            res[groupKey][key] = val
          } else {
            res[key] = val
          }
          return res
        }, {})
      }
      if(!_IS_PRODUCT_ && hasGroup) {
        console.log('Group Data: ', values)
      }
      return values
    }
  }, [formList])
  const getFormData = useCallback((fn, allowError = false) => {
    const handle = (errors, data) => {
      if(!_IS_PRODUCT_) {
        console.log('data', data)
      }
      if (errors && !allowError) return
      let values = typeof dataFormat === 'function' ? dataFormat(data) : data
      if(!_IS_PRODUCT_) {
        console.log('values', values)
      }
      if (trim && (values != null && typeof values === 'object')) {
        let val
        values = Object.keys(values).reduce((res, key) => {
          val = values[key]
          if (typeof val === 'string') {
            val = val.trim()
          }
          res[key] = val
          return res
        }, {})
      }
      values = groupHandle(values)
      return fn?.(values)
    }
    if(allowError) {
      return handle(undefined, getFieldsValue())
    } else {
      return validateFields(handle)
    }
  }, [validateFields, getFieldsValue, trim, dataFormat, groupHandle])

  const getFormParams = useCallback((fn) => {
    return getFormData(fn, true)
  }, [getFormData])

  const onOkClick = useCallback((e) => {
    return getFormData((values) => onOk(values, form, e))
  }, [onOk, getFormData, form])

  /**
   * 先交验，校验成功再触发对应的函数（二次确认框）
   */
  const onValidateClick = useCallback((e, ...args) => {
    const validateargs = [
      ...args,
      (errors) => {
        if (errors) return false
      }
    ]
    return validateFields(...validateargs)
  }, [validateFields])


  return useMemo(() => ({
    onOkClick,
    onValidateClick,
    getFormParams
  }), [onOkClick, onValidateClick, getFormParams])
}

export default useFormClick
