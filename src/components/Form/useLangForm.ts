// 处理语言选择框
import { useMemo, useRef, useCallback, forwardRef } from 'react'
import { useSelector } from 'dva'
import { flatMap } from 'lodash'
import { Select } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
import { useNewRef } from 'src/hooks'
import { valIsEmpty } from 'utils/utils'
import { DefaultLang, LangSuffix, LangTextSuffix, LangOriginUsedId, getLangTextId, LangRequiredRuleFlag } from './constants'
import styles from './styles/index.less'

const { Option } = Select
const EmptyObj = Object.freeze({})

/**
 * 语言选择
 * @param {Record<string, any>} props
 */
const SelectLang = forwardRef((props, ref) => {
  const { value, onChange, onLangChange, disabled } = props
  const langs = useSelector(state => state?.langs?.langWithLocal || EmptyList) || []
  const onSelectChang = (...args) => {
    onChange?.(...args)
    onLangChange?.(...args)
  }
  const usedVal = langs.length ? value : undefined
  return (
    <Select
      ref={ref}
      value={usedVal}
      optionFilterProp="children"
      showSearch
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      disabled={disabled}
      onChange={onSelectChang}
    >
      {langs.map(lang => (
        <Option value={lang.default_locale} key={lang.default_locale}>
          {lang.name}
        </Option>
      ))}
    </Select>
  )
})

/**
 * 处理多语言文本输入的情况
 * @template T
 * @param {T[]} list 
 * @param {{
 *  form: WrappedFormUtils,
 *  labelColSpan: number
 *  originData?: Record<string, any>,
 *  trim?: boolean,
 * }} conf
 */
const useLangForm = (list, conf) => {
  const { originData = EmptyObj, form, labelColSpan, trim } = conf
  const { setFieldsValue } = form
  const langTextObjRef = useNewRef(originData)
  const hasLangRef = useRef(false)
  const langObjRef = useRef({})
  const langs = useSelector(state => state?.langs?.langWithLocal || EmptyList)
  const getLangVal = useMemo(() => {
    const hash = langs.reduce(((res, item) => {
      res[item.default_locale] = item
      return res
    }), {})
    return (lang) => {
      return hash[lang]?.name || lang
    }
  }, [langs])

  /**
   * 获取初始化语言的值
   */
  const getInitLangVal = useCallback((id, showLang) => {
    const item = langTextObjRef.current[id]
    if(!item) return [DefaultLang, '']
    if(!showLang) return [DefaultLang, item[DefaultLang]]
    const langKeys = Object.keys(item).filter(lang => !!lang)
    const usedLang = langKeys.includes(DefaultLang) ? DefaultLang : langKeys[0]
    return [usedLang, item[usedLang]]
  }, [])

  const formList = useMemo(() => {
    const langList = list.map(item => {
      // langRequired: boolean | string | string[], langConf
      const { id, useLang, showLang = true, options, langRequired: langRequiredVal, langConf, required, getChangeVal, ...others } = item
      let langRequired = langRequiredVal
      if(!useLang) {
        return item
      }
      hasLangRef.current = true
      if(langRequired == null) {
        langRequired = required
      }
      if(langRequired === true) {
        langRequired = DefaultLang // 默认用英文
      }
      if(typeof langRequired === 'string') {
        langRequired = [langRequired]
      }
      const langId = `${id}${LangSuffix}`
      const langTextId = getLangTextId(id)
      const itemOptions = options || {}
      let langRules = []
      const isLangRequired = !!(langRequired && langRequired.length)
      if(showLang && isLangRequired) {
        langRules.push({
          [LangRequiredRuleFlag]: true,
          validator: async() => {
            const val = langTextObjRef.current[id]
            let msg = langRequired || []
            if(val) {
              msg = msg.filter(lang => !val[lang])
            }
            if(msg.length) {
              throw new Error( showLang ? msg.map(lang => `${getLangVal(lang)}必填`).join('; ') : `${others.label || ''}必填`);
            }
          }
        })
      }

      const onLangChange = (val) => {
        langObjRef.current[id] = val
        setFieldsValue({
          [langTextId]: langTextObjRef.current[id]?.[val] || ''
        })
      }

      const onLangTextChange = (e, ...args) => {
        let langKey = langObjRef.current[id]
        if(!langKey && !langTextObjRef.current[id]?.[DefaultLang]) {
          langKey = DefaultLang
        }
        if(langKey) {
          let val = e?.target ? e?.target?.value : e
          if(typeof getChangeVal === 'function') {
            val = getChangeVal(e, ...args)
          }
          langTextObjRef.current = {
            ...langTextObjRef.current,
            [id]: {
              ...langTextObjRef.current[id],
              [langKey]: trim && typeof val === 'string' ? val.trim() : val
            }
          }
        }
      }
      const [initLang, initVal] = getInitLangVal(id, showLang)
      // 设置当前语言
      langObjRef.current[id] = initLang
      // 语言
      const langItem = {
        ...others,
        ...langConf,
        id: langId,
        content: <SelectLang onLangChange={onLangChange} />,
        required: isLangRequired,
        options: {
          initialValue: initLang
        },
        [LangOriginUsedId]: id,
      }
      langItem.className = `${langItem.className || ''} ${styles.lang_sel}`
      // 输入框
      const langTextItem = {
        ...others,
        id: langTextId,
        options: {
          ...itemOptions,
          initialValue: initVal,
          rules: [...(itemOptions?.rules || []), ...langRules],
          onChange: onLangTextChange
        },
        [LangOriginUsedId]: id,
      }
      // 是否展示语言选择框
      if(!showLang) {
        Object.assign(langTextItem, {
          required: Array.isArray(langRequired) && !!langRequired.length
        })
        return langTextItem
      }
      Object.assign(langTextItem, {
        wrapperCol: { offset: labelColSpan, ...langConf?.wrapperCol },
      })
      // 语言有label，文本没label
      delete langTextItem.label
      return [
        langItem,
        langTextItem
      ]
    })
    return flatMap(langList)
  }, [list, originData, getLangVal, setFieldsValue, getInitLangVal, labelColSpan, trim])

  const dataFormat = useCallback((data) => {
    if(!data || typeof data !== 'object' || !hasLangRef.current) return data
    return Object.entries(data).reduce((res, [key, value]) => {
      if(key.endsWith(LangTextSuffix)) {
        const actualKey = key.replace(LangTextSuffix, '')
        let langValue = langTextObjRef.current[actualKey]
        if(langValue && typeof langValue === 'object') {
          langValue = Object.entries(langValue).reduce((res, [key, val]) => {
            if(!valIsEmpty(val)) {
              res[key] = val
            }
            return res
          }, {})
          if(JSON.stringify(langValue) === '{}') {
            langValue = undefined
          }
        }
        res[actualKey] = langValue
      } else if(!key.endsWith(LangSuffix)) { // 将 LangSuffix的值忽略
        res[key] = value
      }
      return res
    }, {})
  }, [])

  return {
    list: formList,
    langTextObjRef,
    dataFormat
  }
}

export default useLangForm
