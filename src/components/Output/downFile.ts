import React, { useMemo, memo, forwardRef } from 'react'
import { getApiHost } from 'helper';
import { Button } from 'antd'
import { _t } from 'utils/i18n';
import { ButtonProps } from 'antd/lib/button'

/**
 * 文件下载
 * @param {{
 *  href?: string
 *  onlyPath?: boolean,
 *  name?: string,
 *  btnProps?: ButtonProps,
 *  style?: React.CSSProperties,
 *  showBtn?: boolean,
 *  allowDown?: boolean,
 * }} props onlyPath 只有路径部分，默认true,会去校验url是不是以http开头的
 */
const DownFile = forwardRef((props, ref) => {
  const { onlyPath = true, href, name = _t('admin.common.export'), allowDown = true, showBtn = true, btnProps, style, ...others } = props
  const url = useMemo(() => {
    if (!onlyPath || String(href).startsWith('http')) return href
    return `https://${getApiHost()}${href}`
  }, [onlyPath, href])
  return (
    <a
      target="_blank"
      download
      {...others}
      href={url}
      rel="noopener noreferrer"
      style={style}
      ref={ref}
      disabled={!allowDown}
    >
      { showBtn ? <Button type="link" disabled={!allowDown} {...btnProps}>{name}</Button> : name }
    </a>
  )
})

/**
 * 模版文件下载（放在前端的文件）
 * @param {Parameters<DownFile>[0]} props
 */
export const DownTemplateFile = forwardRef((props, ref) => {
  return <DownFile {...props} onlyPath={false} ref={ref} />
})

export default memo(DownFile)
