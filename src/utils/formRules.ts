import { WrappedFormUtils } from 'antd/lib/form/Form'
import { getLangTextId } from 'src/KComponents/KForm/constants'
import { valIsEmpty } from './utils'

/**
 * 判断值是否为空值或者false
 * @param {*} val
 */
const valIsEmptyOrFalse = val => val === false || valIsEmpty(val);

/**
 * 最大值规则
 * @param {number} max 
 * @param {stirng} [title] 
 */
export const maxRules = (max, title='') => [{
  max,
  message: `${title ? title + ' ' : ''}cannot be longer than ${max} characters`,
}]


/**
 * 多字段依赖规则
 * @param {WrappedFormUtils} form 
 * @param {string} field 
 * @param {{
 *  msg?: string,
 *  useLang?: boolean,
 *  show?: bolean,
 *  showRely?: boolean,
 * }} [conf] useLang 依赖字段是否使用多语言
 * @param { (value, relyVal, msg) => void } errHandle
 */
const relyRulesHandle = (form, field, { msg, useLang = false, show = true, showRely, relyMsg } = {}, errHandle) => {
  const getRelyVal = () => form?.getFieldValue(getLangTextId(field, useLang))
  if(typeof showRely !== 'boolean') {
    showRely = !!relyMsg
  }
  return [
    {
      validator: async (rule, value) => {
        const relyVal = getRelyVal()
        if(show) {
          errHandle?.(value, relyVal, msg)
        }
        if(showRely) {
          errHandle?.(relyVal, value, relyMsg)
        }
      }
    }
  ]
}

const ruleErrorHandle = (value, relyVal, msg) => {
  if(valIsEmptyOrFalse(value) && !valIsEmptyOrFalse(relyVal)) {
    throw new Error(msg || `${ value === false ? '必选' : '不能为空'}`);
  }
}

/**
 * 依赖规则，当依赖的字段不为空时，当前字段不能为空
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const relyRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, ruleErrorHandle)
}

const requiredOneErrorHandle = (value, relyVal, msg) => {
  if(valIsEmptyOrFalse(value) && valIsEmptyOrFalse(relyVal) ) {
    throw new Error(msg || `${ value === false ? '必选' : '不能为空'}`);
  }
}

/**
 * 选一规则，所有字段中必须存在至少一个值
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const requiredOneRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, requiredOneErrorHandle)
}
