import React, { memo, useMemo } from 'react'
import { Form, Row, Spin  } from 'antd'
import cls from 'classnames';
import { each } from 'lodash'
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
 *  rowIndexList?: number[],
 *  formProps?: FormProps,
 *  labelColSpan?: number,
 *  wrapperColSpan?: number,
 *  compact?: boolean,
 * }} props 
 */
const FormList = (props) => {
  const { useRow = DefUseRow, rowProps, loading = DefLoading, footerContent,
    formItems, rowIndexList, formProps, labelColSpan = DefLabelColSpan, wrapperColSpan, compact,
  } = props
  const spinObj = useMemo(() => {
    return typeof loading === 'boolean' ? { spinning: loading } : (loading || {})
  }, [loading])
  const rowList = useMemo(() => {
    let count = 0
    const arr =[[]]
    if(!rowIndexList?.length) {
      arr[0] = formItems
    } else {
      each(formItems, (value, index) => {
        if(index !== 0 && rowIndexList.includes(index)) {
          count += 1
        }
        if(!Array.isArray(arr[count])) {
          arr[count] = [value]
        } else {
          arr[count].push(value)
        }
      })
    }
    return arr
  }, [useRow, rowIndexList, formItems])

  return (
    <Spin {...spinObj}>
      <div className={cls({[styles.compact]: compact})}>
        <Form labelCol={{ span: labelColSpan }} wrapperCol={{ span: wrapperColSpan || 24 - labelColSpan }} {...formProps}>
          {
            useRow ? <>
              { rowList.map((items, index) => <Row gutter={24} {...rowProps} key={String(index)}>{items}</Row>)}
            </> : formItems
          }
        </Form>
        { footerContent }
      </div>
    </Spin>
  )
}

export default memo(FormList)
