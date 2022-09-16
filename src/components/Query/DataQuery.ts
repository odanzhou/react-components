import React, { memo, useCallback, useMemo, useState } from 'react'
import { Input, Button } from 'antd'
import { useParams } from 'hooks'
import { _t } from 'utils/i18n';
import KForm from 'src/KComponents/KForm'

/**
 * 展示数据查询结果
 * @param {{
 *  children: React.ReactNode | (props: { onOk: Function, params: Record<string, any>, isFormat: boolean}) => React.ReactNode,
 *  paramsKey?: string, // 针对只需要一个Input的情况
 *  showBtn?: boolean,
 *  useFormate?: boolean,
 *  initFormat?: boolean,
 *  initParams?: Parameters<useParams>[0],
 *  paramsConf?: Parameters<useParams>[1],
 *  loading?: boolean,
 *  useFormateBtn?: boolean,
 * } & Parameters<KForm>[0]} props
 */
const DataQuery = (props) => {
  const {
    children, paramsKey, list, showBtn = true, useFormateBtn = false,
    initFormat = true, initParams, paramsConf, loading = false,
    ...others
  } = props
  const [isFormat, setIsFormat] = useState(initFormat);

  const { searchParams, onResetSeach } = useParams(initParams, paramsConf)

  const formList = useCallback((form, conf, ...args) => {
    const { onOk } = conf
    let listData = list
    if (!listData && paramsKey) {
      listData = [{
        id: paramsKey,
        content: <Input onPressEnter={onOk} />,
        required: true
      }]
    }
    if (showBtn) {
      listData = [
        ...(typeof listData === 'function' ? listData(form, conf, ...args) : listData),
        {
          id: '__$$confirm',
          template: <div>
            <Button type="primary" className='ml-30' loading={loading} onClick={onOk}>{_t('admin.trade.common.search')}</Button>
            { useFormateBtn  && <Button className='ml-10' onClick={() => setIsFormat(!isFormat)}>{ isFormat ? '收缩' : '展开'}</Button>}
          </div>,
        },
      ]
    }
    return listData
  }, [list, paramsKey, showBtn, isFormat, useFormateBtn, loading])

  const formProps = useMemo(() => {
    return {
      formConf: {
        labelColSpan: 0,
      },
      list: formList,
      confirmLoading: loading,
      onOk: onResetSeach,
      useRow: true,
      colProps: {
        span: 6
      }
    }
  }, [formList, loading, onResetSeach])

  const childrenContent = useMemo(() => {
    const conf = {
      params: searchParams,
      onOk: onResetSeach,
      isFormat
    }
    return typeof children === 'function' ? children(conf) : React.cloneElement(children, conf)
  }, [children, searchParams, onResetSeach, isFormat])

  return <div>
    <div>
      <KForm {...formProps} {...others} />
    </div>
    <div>
      {childrenContent}
    </div>
  </div>
}

export default memo(DataQuery)
