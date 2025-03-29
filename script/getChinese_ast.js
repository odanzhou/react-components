import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import recast from "recast"
import t from "@babel/types"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fileCounters = new Map()

/**
 * 配置的地方，需要修改的地方，目录位置 后期可以从控制台输入，不需要改文件了
 * 配置的时候，防止其他页面共用，上次翻译完成之后需要删除一下
 */
const LOCALE_FILE = path.resolve(__dirname, "./temp/currentLocal.json") // 存储的位置
// 需要修改的文件的位置
const TARGET_DIR = path.resolve(__dirname, "../src/pages/Operations/TaskCenter")
const KEY_PREFIX = "taskCenter." // 当前的修改的想要生成的前缀，可以采用code来判断 防止和其他的冲突

const ALLOWED_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"])

// 初始化数据
let keyCounter = 1
// const existingTranslations = JSON.parse(fs.readFileSync(LOCALE_FILE, "utf-8"))
// 不复用之前文件的国际化
const existingTranslations = {}
const textToKeyMap = new Map(
  Object.entries(existingTranslations).map(([k, v]) => [v, k]),
)

// 主处理函数
async function processFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      await processFiles(fullPath)
    } else if (
      entry.isFile() &&
      !entry.name.endsWith(".less") &&
      ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      // console.log(`处理文件: ${fullPath}`)
      await processSingleFile(fullPath)
    } else {
      console.log(`跳过文件: ${fullPath}`)
    }
  }

  // 最后写入更新后的翻译文件
  fs.writeFileSync(LOCALE_FILE, JSON.stringify(existingTranslations, null, 2))
}

// 处理单个文件（优化版本）
async function processSingleFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf-8")
    const ast = recast.parse(code, {
      parser: {
        parse(source) {
          return parse(source, {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
            tokens: true, // 关键！保留token信息
            attachComment: true, // 保留注释
          })
        },
      },
    })

    // console.log("\n=== 解析后的原始AST ===\n", recast.print(ast).code)

    let modified = false

    traverse.default(ast, {
      // 处理所有字符串类型
      StringLiteral(path) {
        if (path.parentPath.isImportDeclaration()) return // 跳过 import 语句
        processTextNode({
          path,
          text: path.node.value,
          context: "string",
          filePath,
        }) && (modified = true)
      },

      // 处理模板字符串 - 暂时不处理, 交给使用者处理
      TemplateLiteral(path) {
        path.node.quasis.forEach(templateElement => {
          const text = templateElement.value.raw
          if (containsChinese(text)) {
            console.warn(
              `发现未处理的模板字符串中文内容: ${text} (${filePath})`,
            )
          }
        })
      },

      // 处理 JSX 文本
      JSXText(path) {
        const text = path.node.value.trim()
        if (text) {
          processTextNode({
            path,
            text,
            context: "jsx",
            filePath,
          }) && (modified = true)
        }
      },

      // 处理 JSX 属性
      JSXAttribute(path) {
        if (
          path.node.value?.type === "StringLiteral" &&
          containsChinese(path.node.value.value)
        ) {
          processTextNode({
            path: path.get("value"),
            text: path.node.value.value,
            context: "jsxAttr",
            filePath,
          }) && (modified = true)
        }
      },
    })

    if (modified) {
      const output = recast.print(ast, {
        quote: "auto", // 保持原有引号风格
        trailingComma: true, // 保持逗号风格
        lineTerminator: "\n", // 保持换行符
        comment: true, // 强制保留所有注释
      })

      // console.log("\n=== 修改后的AST ===\n", recast.print(ast).code)
      const regex = /(\/\*[\s\S]*?\*\/)\s*\n\s*(_t\(".*?"\))/g
      const replacedCode = `${output}`?.replace(regex, "$1 $2")
      fs.writeFileSync(filePath, replacedCode)
      // console.log(`文件已更新: ${filePath}`)
    } else {
      // console.log(`无修改: ${filePath}`)
    }
  } catch (e) {
    console.error(`处理文件失败 ${filePath}:`, e.message)
  }
}

// 增强处理
function processTextNode({ path, text, context, filePath }) {
  if (!containsChinese(text) || isAlreadyTranslated(path)) return false

  // 过滤数字和特殊符号
  if (
    /^\d+$/.test(text) ||
    /^[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?]+$/.test(text)
  ) {
    return false
  }

  const existingKey = textToKeyMap.get(text)
  const newKey = existingKey || generateNewKey(filePath, text)

  if (!existingKey) {
    existingTranslations[newKey] = text
    textToKeyMap.set(text, newKey)
  }

  replaceNode({ path, newKey, context, originText: text })
  return true
}

// 增强版 AST 替换逻辑
function replaceNode({ path, newKey, context, originText }) {
  const tCall = t.callExpression(t.identifier("_t"), [t.stringLiteral(newKey)])

  // 根据上下文处理注释
  const comments = [
    {
      type: "CommentBlock",
      value: ` ${originText} `,
      leading: true,
      trailing: false,
    },
  ]

  switch (context) {
    case "jsx":
      tCall.comments = comments
      path.replaceWith(t.jsxExpressionContainer(tCall))
      break

    case "jsxAttr":
      tCall.comments = comments
      path.replaceWith(t.jsxExpressionContainer(tCall))
      break

    default:
      tCall.comments = comments
      path.replaceWith(tCall)
  }
}

// 增强版工具函数
function containsChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text)
}

// 去除已经翻译过的
function isAlreadyTranslated(path) {
  return path.findParent(
    p => p.isCallExpression() && p.node.callee.name === "_t",
  )
}

function generateNewKey(filePath) {
  // 获取路径最后两级目录
  const pathSegments = filePath.split(path.sep)
  const relevantSegments = pathSegments
    .slice(-2) // 取最后两个路径段
    .map(segment => {
      // 清洗路径段
      const cleanSegment = path
        .parse(segment)
        .name.replace(/[^a-zA-Z0-9]/g, "_") // 非字母数字转下划线
        .replace(/_+/g, "_") // 合并连续下划线
        .toLowerCase()
      return cleanSegment || "index" // 处理空路径段
    })

  // 组合路径标识（示例：create.index）
  const pathIdentifier = relevantSegments.join(".")

  // 初始化或获取文件计数器
  if (!fileCounters.has(filePath)) {
    fileCounters.set(filePath, 0)
  }
  const currentIndex = fileCounters.get(filePath)

  // 生成最终key
  const newKey = `${KEY_PREFIX}${pathIdentifier}.${currentIndex}`

  // 更新计数器
  fileCounters.set(filePath, currentIndex + 1)
  keyCounter++
  return newKey
}

// 启动处理
processFiles(TARGET_DIR).then(() => {
  console.log("国际化处理完成")
  console.log(`更新条目数: ${keyCounter - 1}`)
})
