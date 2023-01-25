import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { each } from 'lodash';
import { useRefWrapper, useNewRef, useIsUpdate } from 'hooks'

export const RepeatIndex = '__RepeatIndex__'
export const RepeatKey = '__RepeatKey__'

export const useRepeatFormItemClick = () => {
  const conf = useMemo(() => ({ fns: ['addItem', 'removeItem', 'getExtraData'] }), [])
  // const { setRefVal, objWrapper } = useRefWrapper(undefined, conf)
  return useRefWrapper(undefined, conf)
}

const useRepeatFormItem = (list, conf = {}) => {
  const { splitSymbol = '_$Repeat_', data: resData, onSaveFn, inEffect = false, dataId, dataFormat } = conf
  const dataList = resData?.[dataId]
  const isUpdateRef = useIsUpdate()
  const keys = useMemo(() => {
    return list.map(item => item.id)
  }, [list])
  const keyLength = keys.length
  const indexRefs = useRef([])
  const countRef = useRef(0)
  const extraItemDataRef = useRef({})

  // 生成Key
  const genRepeatKey = useCallback((index) => {
    const repeatKey = `${splitSymbol}${index}`
    const genRepeatId = (id) => `${id}${repeatKey}`
    return { repeatIndex: index, genRepeatId, repeatKey }
  }, [splitSymbol])
  // 生成重新的表单配置信息
  const genListItem = useCallback((data={}) => {
    const index = countRef.current
    const { repeatIndex, genRepeatId, repeatKey } = genRepeatKey(index)
    indexRefs.current.push(index)
    countRef.current +=1
    return list.map(item => {
      const { id } = item
      return {
        ...item,
        id: genRepeatId(id),
        extraProps: {
          // getLen: () => indexRefs.current.length,
          // getIndexList: () => indexRefs.current,
          // getIndex: () => indexRefs.current.findIndex(i => i === index),
          isLast: () => indexRefs.current[indexRefs.current.length - 1] === index,
          isFirst: () => indexRefs.current[0] === index,
          [RepeatIndex]: repeatIndex,
          [RepeatKey]: repeatKey,
          data,
        },
        [RepeatIndex]: repeatIndex
      }
    })
  }, [list, genRepeatKey])
  // 初始化表单配置信息
  const initRepeatList = useCallback(() => {
    countRef.current = 0
    indexRefs.current = []
    const index = dataList?.length || 1
    let res = []
    for(let i = 0; i < index; i++) {
      res = [...res, ...genListItem(dataList?.[i])]
    }
    return res
  }, [dataList, genListItem])

  const [repeatList, setRepeatList] = useState(initRepeatList)

  useEffect(() => {
    if(!isUpdateRef.current) return
    countRef.current = dataList?.length || 0
    setRepeatList(initRepeatList())
  }, [initRepeatList, isUpdateRef]);
  // 增加表单配置信息
  const addItem = useCallback(() => {
    setRepeatList(list => [...list, ...genListItem()])
  }, [])
  // 删除表单配置信息
  const removeItem = useCallback((repeatIndex) => {
    delete extraItemDataRef.current[repeatIndex]
    setRepeatList(list => {
      if((list.length / keyLength) <= 1) return list
      indexRefs.current = indexRefs.current.filter(index => index !== repeatIndex)
      return list.filter(item => item[RepeatIndex] !== repeatIndex)
    })
  }, [keyLength])

  const repeatFormData = useMemo(() => {
    const { [dataId]: list, ...others } = resData || {}
    if(!Array.isArray(list)) return others
    extraItemDataRef.current = {}
    return {
      ...others,
      ...list.reduce((res, item, index) => {
        const { genRepeatId } = genRepeatKey(index)
        each(item, (value, id) => {
          if(keys.includes(id)) {
            res[genRepeatId(id)] = value
          }
        })
        extraItemDataRef.current[index] = item
        return res
      }, {})
    }
  }, [genRepeatKey, resData, dataId, keys])
  // 解析表单数据
  const onResolveFormData = useCallback((formData = {}) => {
    const dataList = {...formData}
    const repeatData = indexRefs.current.reduce((res, index) => {
      const { genRepeatId } = genRepeatKey(index)
      const dataItem = keys.reduce((resItem, id) => {
        const repeatId = genRepeatId(id)
        resItem[id] = dataList[repeatId]
        delete dataList[repeatId]
        return resItem
      }, {}) || {}
      res.push({ ...extraItemDataRef.current[index], ...dataItem})
      return res
    }, []) || []

    return {
      ...dataList,
      [dataId]: typeof dataFormat === 'function' ? dataFormat(repeatData) : repeatData
    }
  }, [keys, genRepeatKey, dataId, dataFormat])

  const repeatListRef = useNewRef(repeatList)

  const getList = useCallback(() => {
    return repeatListRef.current
  }, [repeatListRef])

  const getExtraData = useCallback(() => {
    return extraItemDataRef.current
  }, [])

  useMemo(() => {
    if(!inEffect && typeof onSaveFn === 'function') {
      onSaveFn({
        addItem,
        removeItem,
        getExtraData,
      })
    }
  }, [inEffect, onSaveFn, addItem, removeItem, getList, getExtraData])

  useEffect(() => {
    if(inEffect && typeof onSaveFn === 'function') {
      onSaveFn({
        addItem,
        removeItem,
        getExtraData,
      })
    }
  }, [inEffect, onSaveFn, addItem, removeItem, getList, getExtraData])

  return {
    list: repeatList,
    addItem,
    removeItem,
    repeatFormData,
    onResolveFormData,
    getList
  }
}

export default useRepeatFormItem
