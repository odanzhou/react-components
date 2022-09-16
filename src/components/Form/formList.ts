import React, { memo, useMemo } from 'react'
import { Form, Row, Spin  } from 'antd'
import cls from 'classnames';
import styles from './styles/index.less'
import { DefLabelColSpan, DefLoading, DefUseRow } from './constants'

/**
 * 表单渲染内容（和状态分离）
 * @param {{
 *  useRow?: boolean,
 *  rowProps?: RowProps,
 *  loading?: boolean | SpinProps,
 *  footerContent?: React.ReactNode,
 *  formItems?: React.ReactNode,
 *  formProps?: FormProps,
 *  labelColSpan?: number,
 *  wrapperColSpan?: number,
 *  compact?: boolean,
 * }} props 
 */
const FormList = (props) => {
  const { useRow = DefUseRow, rowProps, loading = DefLoading, footerContent,
    formItems, formProps, labelColSpan = DefLabelColSpan, wrapperColSpan, compact,
  } = props

  const spinObj = useMemo(() => {
    return typeof loading === 'boolean' ? { spinning: loading } : (loading || {})
  }, [loading])

  return (
    <Spin {...spinObj}>
      <div className={cls({[styles.compact]: compact})}>
        <Form labelCol={{ span: labelColSpan }} wrapperCol={{ span: wrapperColSpan || 24 - labelColSpan }} {...formProps}>
          {
            useRow ? <Row gutter={24} {...rowProps}>{formItems}</Row> : formItems
          }
        </Form>
        { footerContent }
      </div>
    </Spin>
  )
}

export default memo(FormList)
