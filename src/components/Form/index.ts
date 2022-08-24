import React, { memo } from 'react'
import { Form } from 'antd'
import useForm from './useForm'
import useFormState from './useFormState'
import FormList from './formList'

/**
 * KFormType
 * @param { Parameters<useForm>[0] } props
 */
const KForm = (props) => {
  const { formListProps } = useForm(props)
  return <FormList {...formListProps} />
}

const KFormWithForm = memo(Form.create()(KForm))

/**
 * KFormKey 数据变化重置Key
 * @param { Parameters<useForm>[0] } props
 */
const KFormKey = (props) => {
  const { key } = useFormState(props.originData)
  return <KFormWithForm {...props} key={key} />
}

export {
  FormList,
  useForm,
  useFormState,
  KFormKey,
}

export default KFormWithForm
