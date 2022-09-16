import React, { memo, useMemo } from 'react'
import { Empty, Spin } from 'antd'
import { _t } from 'utils/i18n';
import { useRequest } from 'hooks'
import DataQuery from './DataQuery'

const showData = (data, isFormat) => {
  if (data && (Array.isArray(data) || typeof data === 'object')) {
    const str = JSON.stringify(data, null, '\t')
    return isFormat ? <pre>{str}</pre> : str
  }
  return data
}

/**
 * 展示数据查询结果
 * @param {{
 *  fetchApi: Promise<any>,
 *  dataRender?: (data: any) => React.ReactNode,
 *  showBtn?: boolean,
 *  useFormate?: boolean,
 *  initFormat?: boolean,
 * } && Parameters<DataQuery>[0]} props
 */
const SimpleQuery = (props) => {
  const {
    dataRender = showData, fetchApi, showBtn = true, useFormate = true,
    ...others
  } = props
  const useFormateBtn = useMemo(() => {
    return typeof useFormate === 'boolean' ? useFormate : dataRender === showData
  }, [useFormate, dataRender])
  const { data, loading, onFetch } = useRequest(fetchApi, { manual: true })

  const queryConf = useMemo(() => {
    return {
      useFormateBtn,
      loading,
      showBtn,
      useFormate,
      paramsConf: {
        onOk: onFetch
      }
    }
  }, [useFormateBtn, loading, showBtn, useFormate])
  return (
    <DataQuery {...queryConf} {...others}>
      {
        ({ isFormat }) => (
          <Spin spinning={loading}>
            <div>
              {data != null ? dataRender(data, isFormat) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </div>
          </Spin>
        )
      }
    </DataQuery>
  )
}

export default memo(SimpleQuery)
