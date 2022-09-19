import React, { memo } from 'react'
import { Modal, Form, Button } from 'antd'
import { ModalProps } from 'antd/lib/modal/Modal'
import { _t } from 'utils/i18n';
import { FormList, useForm, useFormState } from '../KForm'
import ConfirmButton from './confirmButton'

/**
 * 默认Modal 的 BodyStyle
 */
const DefBodyStyle = { maxHeight: 450, overflow: 'auto' }

/**
 * 表单 Modal
 * readonly 下footer设置为null
 * @param {{
 *  modalConf?: Omit<ModalProps, 'onOk'> & { readOnly?: boolean, },
 *  useConfirm?: boolean, // 二次确认
 *  operName?: string,
 * } & Parameters<useForm>[0]} props 
 */
const KModal = (props) => {
  const { modalConf: { readOnly, footer, useConfirm = false, operName = _t('admin.common.confirm'), ...modalConf}, ...fromConf } = props
  const { onCancel } = modalConf
  const { formListProps, onOkClick, confirmLoading, onValidateClick } = useForm(fromConf)
  let footerContent = footer !== undefined ? footer : readOnly ? null : undefined
  if(footerContent === undefined && useConfirm) {
    footerContent = <div>
      <Button onClick={onCancel}>{_t('admin.trade.common.cancel')}</Button>
      <ConfirmButton operName={operName} onOk={onOkClick} onValidate={onValidateClick} loading={modalConf.confirmLoading} />
    </div>
  }
  return (
    <Modal footer={footerContent} maskClosable={false} bodyStyle={DefBodyStyle} confirmLoading={confirmLoading} {...modalConf}  onOk={onOkClick}>
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
