// 二次确认框弹窗，默认是删除信息
import React, { memo, useCallback, useState } from 'react'
import { Popconfirm, Button, Modal } from 'antd'
import { _t } from 'utils/i18n';

/**
 * 二次确认弹窗，支持先校验，校验通过后再出现二次弹窗
 * @param {{
 *  onOk(...args: any[]): void,
 *  onValidate?: (cb: Function) => void,
 *  operName?: string,
 *  title?: string,
 *  inModal?: boolean,
 *  loading?: boolean,
 *  type?: string,
 * }} props
 */
const ConfirmButton = (props) => {
  const { onOk, onValidate, operName =_t('admin.common.delete'), inModal = true, loading = false, type='primary' } = props
  let { title } = props
  if(title === undefined) {
    title = _t('admin.common.confirm')
    title = `${title}${operName === title ? _t('check.handle') : operName}`
  }
  const onConfirm = useCallback((e) => {
    const fn = () => {
      const modal = Modal.confirm({
        title: `${title}`,
        content: '该操作不可恢复，请谨慎操作！',
        onOk(...args) {
          modal.destroy()
          return onOk(...args)
        },
      })
    };
    if(onValidate) {
      onValidate(e, fn)
    } else {
      fn()
    }
  }, [title, onOk, onValidate])
  const hasValidateFn = typeof onValidate === 'function'
  const [visible, setVisible] = useState(false);
  const onClick = (e) => {
    onValidate(e, () => setVisible(true))
  }
  const btnContent = <Button type={type} loading={loading} onClick={inModal ? onConfirm : hasValidateFn ? onClick : undefined}>{operName}</Button>
  if(inModal) {
    return btnContent
  }

  const onPopOk = (...args) => {
    setVisible(false)
    return onOk(...args)
  }
  let conf = {
    title,
    onConfirm: onPopOk,
    okText: _t('admin.common.confirm'),
    cancelText: _t('admin.trade.common.cancel'),
  }
  if(hasValidateFn) {
    conf = {
      ...conf,
      visible,
      onCancel: () => setVisible(false)
    }
  }
  return (
    <div style={{ minWidth: 50, display: 'inline-block' }}>
      <Popconfirm {...conf}>
        {btnContent}
      </Popconfirm>
    </div>
  )
}

export default memo(ConfirmButton)
