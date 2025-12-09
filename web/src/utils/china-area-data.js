import pcaCode from './pca-code.json'

// 递归转换数据格式
const transformData = (data) => {
  return data.map(item => ({
    value: item.name, // 使用名称作为值，方便后端存储
    label: item.name,
    children: item.children ? transformData(item.children) : undefined
  }))
}

export const chinaAreaData = transformData(pcaCode)
