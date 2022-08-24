/**
 * TextArea 默认只显示一行
 */
export const AutoSize = { min: 1 }

/**
 * width 100%
 */
export const WidthFull = { width: '100%' }

/**
  * 时间选择器配置
  */
export const TimeConf = {
  style: WidthFull,
  showTime: true,
  format: "YYYY-MM-DD HH:mm:ss",
  getCalendarContainer: node => node.parentNode,
}

/**
 * Checkbox 参数配置
 */
export const CheckboxOptions = {
  valuePropName: 'checked',
}

/**
 * 使用多语言
 */
export const UseLangConf = {
  useLang: true,
}

/**
 * 使用多语言但不展示多语言选择
 */
export const NotShowLang = {
  ...UseLangConf,
  showLang: false,
}
