
/**
 * 默认 labelColSpan 值 6
 */
export const DefLabelColSpan = 6

/**
 * 默认loading状态false
 */
export const DefLoading = false

/**
 * 默认是否使用Row, false
 */
export const DefUseRow = false

/**
 * 默认去除空格 true
 */
export const DefTrim = true

/**
 * 默认禁用 false
 */
export const DefDisabled = false

/**
 * 默认语言
 */
export const DefaultLang = 'en_US'

const LangBase = '__$$lang__'

/**
 * 多语言必填校验Key
 */
export const LangRequiredRuleFlag = `${LangBase}__required__`
/**
 * 多语言语言选择后缀
 */
export const LangSuffix = `${LangBase}__lang__`
/**
 * 多语言文本输入后缀
 */
export const LangTextSuffix = `${LangBase}__text__`
/**
 * 保存多语言原始的值
 */
export const LangOriginUsedId = 'langOriginUsedId'

/**
 * 获取多语言下的ID值
 * @param {string} id 
 * @param { boolean } [useLang] 默认true
 */
export const getLangTextId = (id, useLang = true) => useLang ? `${id}${LangTextSuffix}` : id
