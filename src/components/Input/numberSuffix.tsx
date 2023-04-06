import React, { forwardRef, useMemo } from 'react'
import { InputNumber } from 'antd'
import style from './style.less'

/**
 * 具有后缀的数字输入框
 */
const NumberSuffix = forwardRef((props, ref) => {
  const { suffix, autoPrecision, ...others } = props
  const precision = autoPrecision > 8 ? autoPrecision : undefined
  return <div className={style.number_suffix}>
    <InputNumber precision={precision} {...others} ref={ref} />
    <div className='number_suffix'>{suffix}</div>
  </div>
})

export default NumberSuffix
