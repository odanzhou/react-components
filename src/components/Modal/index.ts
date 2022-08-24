import React, { memo } from 'react'
import { Modal, Form } from 'antd'
import { ModalProps } from 'antd/lib/modal/Modal'
import { FormList, useForm, useFormState } from '../KForm'

/**
 * 默认Modal 的 BodyStyle
 */
const DefBodyStyle = { maxHeight: 450, overflow: 'auto' }

/**
 * 表单 Modal
 * @param {{
 *  modalConf?: Omit<ModalProps, 'onOk'>
 * } & Parameters<useForm>[0]} props 
 */
const KModal = (props) => {
  const { modalConf, ...fromConf } = props
  const { formListProps, onOkClick, confirmLoading } = useForm(fromConf)
  return (
    <Modal maskClosable={false} bodyStyle={DefBodyStyle} confirmLoading={confirmLoading} {...modalConf}  onOk={onOkClick}>
      <FormList {...formListProps} />
    </Modal>
  )
}

const KModalWithForm = memo(Form.create()(KModal))

/**
 * 表单 Modal，数据变化重置key
 * @param {{
 *  modalConf?: Omit<ModalProps, 'onOk'>
 * } & Parameters<useForm>[0]} props 
 */
const KModalKey = (props) => {
  const { key } = useFormState(props.originData)
  return <KModalWithForm {...props} key={key} />
}

export {
  KModal as KModalPure,
  KModalKey
}

export default KModalWithForm
