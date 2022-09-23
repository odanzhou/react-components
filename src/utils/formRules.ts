import { WrappedFormUtils } from 'antd/lib/form/Form'
import moment from 'moment'
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

/**
 * 未来时间校验
 */
export const futureDate = {
  validator: async (rule, value) => {
    const current = moment().valueOf();
    if (value && value.valueOf){
      if (value.valueOf() <= current) {
        throw new Error('必须大于当前时间')
      }
    }
  }
}

const endDateErrorHandle = (value, relyVal, msg) => {
  if(!valIsEmptyOrFalse(value) && !valIsEmptyOrFalse(relyVal) ) {
    if(value.valueOf() <= relyVal.valueOf()) {
      throw new Error(msg || `必须大于开始时间`);
    }
  }
}

/**
 * 结束时间大于开始时间
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const endDateRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, endDateErrorHandle)
}

const isUsableNum = (val, baseVal, isEqual = false) => {
  return isEqual ? val <= baseVal : val < baseVal
}

const equalMsg = (isEqual) => isEqual ? '等于' : ''

/**
 * 数值最大最小值校验
 */
export const numValidator = ({ min, minEqual = false, minMsg, max, maxEqual = false, maxMsg, errorMsg }) => ({
  validator: async (rule, value) => {
    const val = Number(value)
    if(valIsEmpty(val) || (valIsEmpty(min) && valIsEmpty(max))) return
    if(Number.isNaN(val)) throw new Error(errorMsg || '请输入正确的数值')
    if(!valIsEmpty(min) && !isUsableNum(min, val, minEqual)) {
      throw new Error(minMsg || `可输入的最小值大于${equalMsg(minEqual)}${min}`)
    }
    if(!valIsEmpty(max) && !isUsableNum(val, max, minEqual)) {
      throw new Error(maxMsg || `可输入的最大值小于${equalMsg(maxEqual)}${max}`)
    }
  }
})
