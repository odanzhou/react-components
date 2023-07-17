import React, { useCallback, useMemo, useState } from 'react'
import { Form, Col } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { FormProps, GetFieldDecoratorOptions } from 'antd/lib/form/Form'
import { FormItemProps } from 'antd/lib/form/FormItem'
import { useNewRef, useRefWrapper } from 'hooks'
import useFormClick from './useFormClick'
import useLangForm from './useLangForm'
import { DefLabelColSpan, DefLoading, DefUseRow, DefTrim, DefDisabled } from './constants'
import { ColProps } from 'antd/lib/col'
import { valIsEmpty } from 'src/utils/utils'
import { LangOriginUsedId } from './constants'

const { Item: FormItem } = Form

/**
 * 表单配置项
 * @typedef {{
 *  labelColSpan?: number,
 *  wrapperColSpan?: number
 *  form?: FormProps,
 * }} FormConf
 */

/**
 * 表单项内容
 * @typedef {{
 *  content?: React.ReactNode | (item: FormItemContent, conf: { form: WrappedFormUtils, list: FormItemContent[] }) => React.ReactNode,
 *  template?: React.ReactNode | (item: FormItemContent, conf: { form: WrappedFormUtils, list: FormItemContent[] }) => React.ReactNode,
 *  options?: GetFieldDecoratorOptions,
 *  show?: boolean,
 *  colProps?: ColProps,
 *  required?: boolean,
 *  useLang?: boolean, [是否使用语言选择]
 *  showLang?: boolean, [是否展示lang选择框]
 *  langRequired?: boolan | string | string[], [必填语言]
 *  langConf?: Omit<FormItemContent, 'useLang' | 'langRequired' | 'langConf'>,
 *  childProps?: Record<string, any>, [子节点的属性]
 *  getChangeVal?: (e) => string,
 *  newRow?: boolean, [用一个新的Row, useRow 为true才行]
 * } & FormItemProps} FormItemContent template 和 content 二选一, useLang 时会讲required转化为langRequired:true(如果未设置langRequired)
 */

/**
 * FormType
 * @param {{
 *  form: WrappedFormUtils,
 *  onOk(params: Record<string, any>, form: WrappedFormUtils, e: React.MouseEvent<HTMLElement, MouseEvent>): void,
 *  list: FormItemContent[] | (fromIns: WrappedFormUtils, conf: {
 *    onOk: (values: Record<string, string>, form: WrappedFormUtils, e) => void,
 *    loading: boolean,
 *    confirmLoading: boolean,
 *    onHideChange: (ids: string[] | string, hide?: boolean) => void
 *  }) => FormItemContent[],
 *  formConf?: FormConf,
 *  useRow?: boolean,
 *  rowProps?: RowProps,
 *  colProps?: ColProps,
 *  loading?: boolean | SpinProps,
 *  originData?: Record<string, any>,
 *  trim?: boolean,
 *  disabled?: boolean,
 *  buttonRender?: React.ReactNode | ((params: {
 *    onOk: (values: Record<string, string>, form: WrappedFormUtils, e) => void,
 *    disabled: boolean,
 *    loading: boolean,
 *    confirmLoading: boolean,
 *  }) =>  React.ReactNode),
 *  confirmLoading?: boolean,
 *  compact?: boolean,
 *  disabledNoRules?: boolean,
 *  initHideIds?: string[],
 *  onOkProxy?: Function,
 * }} props
 */
const useForm = (props) => {
  const { form, formConf = {}, list, onOk: onOkOrigin, useRow = DefUseRow, rowProps, compact, disabledNoRules = true,
    colProps: colCommonProps, loading = DefLoading, originData, trim = DefTrim, buttonRender, initHideIds,
    disabled = DefDisabled, confirmLoading = DefLoading, onOkProxy
  } = props
  const { labelColSpan = DefLabelColSpan, wrapperColSpan, form: formProps } = formConf
  const onOk = useCallback((...args) => {
    if(typeof onOkProxy === 'function') {
      const res = onOkProxy(...args)
      return onOkOrigin(...(Array.isArray(res) ? res : args))
    }
    return onOkOrigin(...args)
  }, [onOkOrigin, onOkProxy])
  const formRef = useNewRef(form)
  const { getFieldDecorator } = form
  const conf = useMemo(() => ({ fns: ['onOkClick', 'getFormParams', 'onValidateClick'] }))
  const { setRefVal, objWrapper } = useRefWrapper(undefined, conf)
  const [hideItems, setHideItems] = useState(() => Array.isArray(initHideIds) ? initHideIds : []);
  const onHideChange = useCallback((ids, hide) => {
    if(valIsEmpty(ids)) return
    if(typeof ids === 'string') ids = [ids]
    if(!Array.isArray(ids)) return
    setHideItems(list => {
      // 添加隐藏
      if(hide) {
        return [...new Set([...list,...ids])]
      }
      // 清除隐藏
      return list.filter(id => !ids.includes(id))
    })
  }, [])
  const genFormList = useMemo(() => {
    const { onOkClick: onOk, ...otherMethods } = objWrapper
    return (typeof list === 'function' ? list(formRef.current, { onOk, ...otherMethods, loading, confirmLoading, onHideChange }) : list) || []
  }, [list, formRef, loading, confirmLoading, objWrapper, onHideChange])
  // 处理语言选择
  const { list: allList, dataFormat } = useLangForm(genFormList, { form, labelColSpan, originData, trim })
  const formList = useMemo(() => {
    return allList.map(item => {
      const { options, required, label } = item
      const rulesHandle = options?.rules
      let rules = (typeof rulesHandle === 'function' ? rulesHandle({ data: item, disabled }) : rulesHandle) || []
      rules = Array.isArray(rules) ? rules : []
      if (required) {
        rules = [
          { required: true, message: label ? `请输入${label}` : undefined },
          ...rules
        ]
      }
      return {
        ...item,
        options: {
          ...options,
          rules
        }
      }
    }).filter(item => item.show !== false && !hideItems.includes(item[LangOriginUsedId] ||item.id))
  }, [allList, formRef, hideItems])
  const formClickMethod = useFormClick(form, { trim, onOk, dataFormat, formList })
  useMemo(() => {
    setRefVal(formClickMethod)
  }, [formClickMethod])

  const [formItems, rowIndexList] = useMemo(() => {
    const list = []
    const arr = formList.map((item, index) => {
      let { id, content, template, options, colProps, childProps, labelColSpan, extraProps, newRow, ...others } = item
      if(useRow && newRow) {
        list.push(index)
      }
      const initValue = originData || {}
      let itemOptions = options
      if (id in initValue) {
        itemOptions = {
          ...options,
          initialValue: initValue[id],
        }
      }
      const itemChildProps = { disabled, ...childProps}
      if(disabledNoRules && itemChildProps.disabled && itemOptions) {
        itemOptions = { ...itemOptions }
        delete itemOptions.rules
      }
      let colObj = {}
      if(labelColSpan || labelColSpan === 0) {
        colObj = {
          labelCol: { span: labelColSpan },
          wrapperCol: { span: 24 - labelColSpan },
        }
      }

      const formItemContent = (
        <FormItem key={id} {...colObj} {...others}>
          {
            template ? React.cloneElement((typeof template === 'function' ? template(item, { form, list: formList, extraProps, disabled }) : template), itemChildProps) :
              getFieldDecorator(id, itemOptions)(React.cloneElement(typeof content === 'function' ? content(item, { form, list: formList, extraProps, disabled }) : content, itemChildProps))
          }
        </FormItem>
      )
      if (useRow) {
        return <Col key={id} span={24} {...colCommonProps} {...colProps}>{formItemContent}</Col>
      }
      return formItemContent
    })
    return [arr, list]
  }, [formList, form, useRow, colCommonProps, getFieldDecorator, originData, disabled, disabledNoRules])

  const footerContent = useMemo(() => {
    const { onOkClick: onOk, ...otherMethods } = objWrapper
    if(typeof buttonRender === 'function') {
      return buttonRender({
        onOk,
        ...otherMethods,
        form,
        disabled,
        loading,
        confirmLoading,
      })
    }
    return buttonRender
  },[buttonRender, objWrapper, form, disabled, loading, confirmLoading])

  return {
    formListProps: {
      useRow,
      rowProps,
      loading,
      footerContent,
      formItems,
      rowIndexList,
      formProps,
      labelColSpan,
      wrapperColSpan,
      compact,
    },
    ...formClickMethod,
    confirmLoading,
  }
}

export default useForm
