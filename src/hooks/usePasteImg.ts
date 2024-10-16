import { useEffect } from 'react'
import { useNewRef } from '@/hooks'

// 粘贴图片
export interface PasteImgProps {
  onPaste:(config: { file: File}) => Promise<any>,
  pasteId?: string,
  pasteClassName?: string,
  delay?: number,
}
const usePasteImg = (props: PasteImgProps) => {
  const { pasteId, pasteClassName, delay, onPaste } = props
  const onPasteRef = useNewRef(onPaste)
  useEffect(() => {
    let timer: any = null
    let pasteDom: Element | null = null

    const handlePaste = (event: any) => {  
      const items = event?.clipboardData?.items;
      if (items?.length) {
        // 搜索剪切板items
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            onPasteRef.current?.({ file })
            break;
          }
        }
      }
    }
    const handle = () => {
      if(pasteId) {
        pasteDom = document.getElementById(pasteId)
      }
      if(!pasteDom && pasteClassName) {
        pasteDom = document.getElementsByClassName(pasteClassName)?.[0] || null
      }
      if(pasteDom) {
        pasteDom.addEventListener('paste', handlePaste, false)
      }
    }

    if(!!pasteId || !!pasteClassName) {
      if(delay && delay > 0) {
        timer(handle, delay)
      } else {
        handle()
      }
    }
    return () => {
      clearTimeout(timer)
      if(pasteDom) {
        pasteDom.removeEventListener('paste', handlePaste)
      }
    }
  }, [pasteId, pasteClassName, delay, onPasteRef])
}

export default usePasteImg
