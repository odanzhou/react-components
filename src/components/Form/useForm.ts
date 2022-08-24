import React, { useMemo } from 'react'
import { Form, Col } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { FormProps, GetFieldDecoratorOptions } from 'antd/lib/form/Form'
import { FormItemProps } from 'antd/lib/form/FormItem'
import { useNewRef } from 'src/hooks'
import useFormClick from './useFormClick'
import useLangForm from './useLangForm'
import { DefLabelColSpan, DefLoading, DefUseRow, DefTrim, DefDisabled } from './constants'
import { ColProps } from 'antd/lib/col'

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
 * } & FormItemProps} FormItemContent template 和 content 二选一, useLang 时会讲required转化为langRequired:true(如果未设置langRequired)
 */

/**
 * FormType
 * @param {{
 *  form: WrappedFormUtils,
 *  onOk(params: Record<string, any>, form: WrappedFormUtils, e: React.MouseEvent<HTMLElement, MouseEvent>): void,
 *  list: FormItemContent[] | (fromIns: WrappedFormUtils) => FormItemContent[],
 *  formConf?: FormConf,
 *  useRow?: boolean,
 *  rowProps?: RowProps,
 *  colProps?: ColProps,
 *  loading?: boolean | SpinProps,
 *  originData?: Record<string, any>,
 *  trim?: boolean,
 *  disabled?: boolean,
 *  buttonRender?: React.ReactNode | ((params: {
 *    onClick: (values: Record<string, string>, form: WrappedFormUtils, e) => void
 *  }) =>  React.ReactNode),
 *  confirmLoading?: boolean
 * }} props
 */
const useForm = (props) => {
  const { form, formConf = {}, list, onOk, useRow = DefUseRow, rowProps,
    colProps: colCommonProps, loading = DefLoading, originData, trim = DefTrim, buttonRender,
    disabled = DefDisabled, confirmLoading = DefLoading
  } = props
  const { labelColSpan = DefLabelColSpan, wrapperColSpan, form: formProps } = formConf
  const formRef = useNewRef(form)
  const { getFieldDecorator } = form
  const genFormList = useMemo(() => {
    return (typeof list === 'function' ? list(formRef.current) : list) || []
  }, [list, formRef])
  // 处理语言选择
  const { list: allList, dataFormat } = useLangForm(genFormList, { form, labelColSpan, originData, trim })
  const formList = useMemo(() => {
    return allList.map(item => {
      const { options, required, label,  } = item
      let fileOptions = options
      if (required) {
        let rules = [...(fileOptions && fileOptions.rules || [])]
        rules.unshift({ required: true, message: label ? `请输入${label}` : undefined })
        fileOptions = {
          ...fileOptions,
          rules
        }
      }
      return {
        ...item,
        options: fileOptions
      }
    }).filter(item => item.show !== false)
  }, [allList, formRef])
  const { onOkClick } = useFormClick(form, { trim, onOk, dataFormat })

  const formItems = useMemo(() => {
    return formList.map((item) => {
      let { id, content, template, options, colProps, childProps, ...others } = item
      const initValue = originData || {}
      let itemOptions = options
      if (id in initValue) {
        itemOptions = {
          initialValue: initValue[id],
          ...options
        }
      }
      const itemChildProps = { disabled, ...childProps}
      const formItemContent = (
        <FormItem key={id} {...others}>
          {
            template ? React.cloneElement((typeof template === 'function' ? template(item, { form, list: formList }) : template), itemChildProps) :
              getFieldDecorator(id, itemOptions)(React.cloneElement(typeof content === 'function' ? content(item, { form, list: formList }) : content, itemChildProps))
          }
        </FormItem>
      )
      if (useRow) {
        return <Col key={id} span={24} {...colCommonProps} {...colProps}>{formItemContent}</Col>
      }
      return formItemContent
    })
  }, [formList, form, useRow, colCommonProps, getFieldDecorator, originData, disabled])

  const footerContent = useMemo(() => {
    if(typeof buttonRender === 'function') {
      return buttonRender({
        onOk: onOkClick,
        form,
        disabled,
        loading,
        confirmLoading,
      })
    }
    return buttonRender
  },[buttonRender, onOkClick, form, disabled, loading, confirmLoading])
  return {
    formListProps: {
      useRow,
      rowProps,
      loading,
      footerContent,
      formItems,
      formProps,
      labelColSpan,
      wrapperColSpan,
    },
    onOkClick,
    confirmLoading,
  }
}

export default useForm
