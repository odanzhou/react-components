import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Button, Icon } from 'antd';
import style from './style.less'

/**
 * 文件上传
 * @param {{
 *  loading?: boolean,
 *  tempUrl?: string, [模版文件地址]
 *  tempBtnName?: string, [模版文件按钮名称]
 *  tempDownName?: string, [模版文件下载名称]
 *  btnName?: string, [文件上传地址]
 *  disabled?: boolean,
 *  multiple?: boolean,
 *  accept?: string,
 * }} props
 */
const FileInput = (props) => {
  const { tempUrl, tempDownName, tempBtnName = '下载模板', btnName = '上传ID文件',
    disabled, loading = false, value, onChange, multiple = false, accept = '.xlsx,.csv' } = props
  const fileRef = useRef()
  const tempDownloadName = useMemo(() => {
    let type = String(tempUrl).split('.').pop() || ''
    if(type) {
      type = `.${type}`
    }
    if (tempDownName) {
      return tempDownName.split('.').length > 1 ? tempDownName : `${tempDownName}${type}`
    }
    if (tempUrl) {
      const list = String(tempUrl).split('/')
      let name = list.length > 1 ? list[list.length - 1] : ''
      return name || `templateFile${type}`
    }
  }, [tempUrl, tempDownName])

  const fileList = useMemo(() => {
    let list
    if (!Array.isArray(value)) {
      list = value ? [value] : []
    } else {
      list = value
    }
    return list.map(item => {
      if (item && typeof item === 'object') return item
      if (typeof item === 'string') {
        return {
          uid: item,
          url: item,
          name: item,
        }
      }
    }).filter(item => !!item)
  }, [value])

  const onFileChange = useCallback((list=[]) => {
    onChange(multiple ? list : list[list.length - 1])
  }, [multiple])

  const uploadFileChange = useCallback((e) => {
    const files = e.currentTarget.files;
    if (files.length === 0) {
      return;
    }
    const targetFileList = [...fileList, ...files]
    onFileChange(targetFileList)
  }, [onFileChange, multiple, fileList])

  const uploadFileClick = useCallback(() => {
    fileRef.current.value = '';
    fileRef.current.click();
  }, [])

  const onDel = useCallback((i) => {
    if(disabled) return
    const res = [...fileList]
    res.splice(i, 1)
    onFileChange?.(res)
  }, [fileList, onFileChange, disabled])

  return (
    <div>
      <input
        ref={fileRef} type="file" hidden
        accept={accept}
        multiple={multiple}
        onChange={e => uploadFileChange(e)}
      />
      <Button loading={loading} onClick={uploadFileClick} disabled={disabled}>{btnName}</Button>
      {!!tempUrl && <a
        className='ml-10'
        href={tempUrl}
        download={tempDownloadName}
      >
        {tempBtnName}
      </a>
      }
      <div className={style.file_wrap}>
        {fileList.map((file, index) => (
          <div className={style.file_item}>
            <span>{file ? file.name : ''}</span>
            <Icon title="删除" type="delete" className="cursor" onClick={() => onDel(index)}/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileInput
