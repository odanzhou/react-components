// 表单点击
import { useCallback } from 'react'
import { WrappedFormUtils } from 'antd/lib/form/Form'

/**
 * 表单点击
 * @param { WrappedFormUtils } form
 * @param {{
 *  onOk(params: Record<string, any>, form: WrappedFormUtils, e: React.MouseEvent<HTMLElement, MouseEvent>): void,
 *  trim?: boolean,
 *  dataFormat?: (data?: Record<string, any>) => Record<string, any>
 * }} conf
 */
const useFormClick = (form, conf) => {
  const { onOk, trim, dataFormat } = conf
  const { validateFields } = form
  const onOkClick = useCallback((e) => {
    validateFields((errors, data) => {
      if(!_IS_PRODUCT_) {
        console.log('data', data)
      }
      if (errors) return
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
      onOk(values, form, e)
    })
  }, [validateFields, onOk, trim, dataFormat])

  /**
   * 先交验，校验成功再触发对应的函数（二次确认框）
   */
  const onValidateClick = useCallback((e, cb) => {
    validateFields((errors) => {
      if (errors) return
      cb?.(e)
    })
  }, [validateFields])

  return {
    onOkClick,
    onValidateClick
  }
}

export default useFormClick
