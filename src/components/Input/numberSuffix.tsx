import React, { forwardRef, useMemo } from 'react'
import { InputNumber } from 'antd'
import style from './style.less'

/**
 * 具有后缀的数字输入框
 */
const NumberSuffix = forwardRef((props, ref) => {
  const { suffix, autoPrecision, ...others } = props
  const { value } = others
  // 低优先级的 precision
  const precision = useMemo(() => {
    if(!autoPrecision) return undefined
    const pointVal = String(value).split('.')[1]
    if(!pointVal) return
    // 处理指数问题
    const [pointLen, eLenght] = pointVal.split('e-')
    return pointLen.length + (Number(eLenght || 0) || 0)
  }, [value, autoPrecision])
  return <div className={style.number_suffix}>
    <InputNumber precision={precision} {...others} ref={ref} />
    <div className='number_suffix'>{suffix}</div>
  </div>
})

export default NumberSuffix
