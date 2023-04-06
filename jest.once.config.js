
const Jest  = require('jest')

// 测试路径
const TestPath = [
  'src'
]

/**
 * 获取测试地址
 * @param {string} filePath 
 * @returns 
 */
const getTestFilePath = (filePath) => {
  return `**/${filePath}/**/?(*.)+(spec|test).[jt]s?(x)`
}

/**
 * 配置信息
 * @type { Parameters<typeof Jest.runCLI>[0] }
 */
const config = {
  testMatch: TestPath.map(str => getTestFilePath(str)),
  testPathIgnorePatterns: ["node_modules"],
}

module.exports = config
