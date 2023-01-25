import React, { forwardRef } from 'react'
import { InputNumber } from 'antd'
import style from './style.less'

/**
 * 具有后缀的数字输入框
 */
const NumberSuffix = forwardRef((props, ref) => {
  const { suffix, ...others } = props
  return <div className={style.number_suffix}>
    <InputNumber {...others} ref={ref} />
    <div className='number_suffix'>{suffix}</div>
  </div>
})

export default NumberSuffix
