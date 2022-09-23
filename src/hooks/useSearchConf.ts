import React, { useMemo, useCallback } from 'react'
import { Input, Button } from 'antd'
import { _t } from 'utils/i18n';

/**
 * 表格搜索表单配置
 * @param {{
 *  onResetClick(): void,
 *  list?: any[] | (form, conf) => any[],
 *  addHandle?: (e: React.MouseEventHandler<HTMLElement>): void,
 *  paramsKey?: string, // 针对只需要一个Input的情况
 *  content?: string,
 *  placeholder?: string,
 *  className?: string,
 *  style?: React.CSSProperties,
 * }} props
 * @param {Record<string, any>} [confObj]
 */
const useSearchConf = (props, confObj) => {
  const { onResetClick, addHandle, list, paramsKey, className, style, placeholder = '请输入', content } = props
  const searchList = useCallback((form, conf, ...args) => {
    const { onOk, loading } = conf
    let listData = list
    if (!listData && paramsKey) {
      listData = [{
        id: paramsKey,
        content: content || <Input onPressEnter={onOk} placeholder={placeholder} />,
      }]
    } else {
      listData = (typeof listData === 'function' ? listData(form, conf, ...args) : listData) || []
    }
    return [
      ...listData,
      {
        id: '__button',
        template: <div className={className || 'flex_end'} style={style} >
          <Button type="primary" className='ml-30' onClick={onOk} loading={loading}>{_t('admin.trade.common.filter')}</Button>
          {!!addHandle && <Button type="primary" className='ml-10' onClick={addHandle}>{_t('admin.trade.common.add')}</Button>}
          <Button className='ml-10' loading={loading} onClick={() => onResetClick()}>{_t('admin.trade.common.refresh')}</Button>
        </div>,
      }
    ]
  }, [addHandle, onResetClick, list, paramsKey, content, placeholder, className, style,])

  return useMemo(() => {
    return {
      searchConf: {
        ...confObj,
        list: searchList,
        showBtn: false,
      }
    }
  }, [searchList, confObj])
}

export default useSearchConf
