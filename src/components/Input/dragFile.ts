import React, { useCallback, forwardRef } from 'react';
import { valIsEmpty } from 'utils/utils';
import { Upload, Icon } from 'antd';
import { useMemo } from 'react';

const { Dragger } = Upload;

/**
 * 拖拽上传文件
 * @param {{
 *  value: any,
 *  onChange(value): void,
 *  multiple?: boolean,
 *  accept?: string,
 *  children?: React.ReactNode,
 *  isTop?: boolean,
 *  emptyContent?: React.ReactNode,
 *  wrapClassName?: string,
 * }} props
 */
const DragFile = forwardRef((props, ref) => {
  const { value, onChange, multiple = false, accept = '.xlsx,.csv', wrapClassName='', children, isTop = true, emptyContent , ...others } = props
  const fileList = useMemo(() => {
    return Array.isArray(value) ? value : valIsEmpty(value) ? [] : [value]
  }, [value])
  const onFileChange = useCallback((file, fileList) => {
    onChange?.(multiple ? [...fileList] : file)
  }, [onChange, multiple])
  const beforeUpload = useCallback((file, fileList) => {
    onFileChange(file, fileList)
    return false;
  }, [onChange, multiple])
  const onRemove = useCallback((file) => {
    const list = fileList.filter(item => item !== file)
    onFileChange(list[list.length - 1], list)
  }, [fileList, onChange, onFileChange])
  return (
    <div className={wrapClassName}>
      { !!children && !!isTop && children}
      <Dragger
        multiple={multiple}
        accept={accept}
        beforeUpload={beforeUpload}
        {...others}
        fileList={fileList}
        onRemove={onRemove}
        ref={ref}
      >
        {
          emptyContent || <>
            <Icon type="inbox" />
            <p>点击或者拖拽文件到此处</p>
          </>
        }
      </Dragger>
      { !!children && !isTop && children}
    </div>
  )
})

export default DragFile
