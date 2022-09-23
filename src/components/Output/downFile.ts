import React, { useMemo, memo } from 'react'
import { getApiHost } from 'helper';
import { Button } from 'antd'
import { _t } from 'utils/i18n';

/**
 * 文件下载
 * @param {{
 *  href?: string
 *  onlyPath?: boolean,
 *  name?: string,
 * }} props onlyPath 只有路径部分，默认true,会去校验url是不是以http开头的
 */
const DownFile = (props) => {
  const { onlyPath = true, href, name = _t('admin.common.export') } = props
  const url = useMemo(() => {
    if (!onlyPath || String(href).startsWith('http')) return href
    return `https://${getApiHost()}${href}`
  }, [onlyPath, href])
  return (
    <a
      href={url}
      download
      rel="noopener noreferrer"
      target="_blank"
    >
      <Button type="link">{name}</Button>
    </a>)
}

export default memo(DownFile)
