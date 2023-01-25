import React,{ forwardRef } from 'react'
import { Parser } from 'json2csv';
import { DownTemplateFile } from './downFile'

/**
 * 获取CSV下载地址
 * @param {{
 *   fields: string[],
 *   data?: Record<string, any>[],
 * }} conf
 */
const getJson2CsvUrl = (conf) => {
  const { data = [], fields = [] } = conf
  const haveFields = fields && fields.length > 0;
  const haveData = data && data.length > 0;
  if (!haveData) {
    return null;
  }
  const newOpts = haveFields ? fields : (haveData ? Object.keys(data?.[0] || {}) : []);
  if (!newOpts || newOpts.length < 1) {
    return null;
  }
  const parser = new Parser({ fields: newOpts });
  const csvResult = parser.parse(data);
  const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csvResult);
  return dataUrl;
}

/**
 * JSON 数据转化为csv文件
 * @param {Parameters<DownTemplateFile>[0] & Parameters<getJson2CsvUrl>[0]} props
 */
const JsonToCsv = forwardRef((props, ref) => {
  const { data, fields, allowDown = true, ...others } = props
  const url = getJson2CsvUrl(props)
  const isAllowDown = allowDown && !!url
  return <DownTemplateFile {...others} href={url} ref={ref} allowDown={isAllowDown} />
})

export default JsonToCsv;
