// 国家名称映射，用于统一不同数据源的国家名称
export const countryMapping: Record<string, string> = {
  // 英文到中文映射
  'United States': '美国',
  'China': '中国',
  'Japan': '日本',
  'Germany': '德国',
  'United Kingdom': '英国',
  'France': '法国',
  'Italy': '意大利',
  'Brazil': '巴西',
  'Canada': '加拿大',
  'Australia': '澳大利亚',
  'India': '印度',
  'Russia': '俄罗斯',
  'South Korea': '韩国',
  'Mexico': '墨西哥',
  'Spain': '西班牙',
  'Indonesia': '印度尼西亚',
  'Netherlands': '荷兰',
  'Turkey': '土耳其',
  'Saudi Arabia': '沙特阿拉伯',
  'Switzerland': '瑞士',
  
  // 中文到英文映射
  '美国': 'United States',
  '中国': 'China',
  '日本': 'Japan',
  '德国': 'Germany',
  '英国': 'United Kingdom',
  '法国': 'France',
  '意大利': 'Italy',
  '巴西': 'Brazil',
  '加拿大': 'Canada',
  '澳大利亚': 'Australia',
  '印度': 'India',
  '俄罗斯': 'Russia',
  '韩国': 'South Korea',
  '墨西哥': 'Mexico',
  '西班牙': 'Spain',
  '印度尼西亚': 'Indonesia',
  '荷兰': 'Netherlands',
  '土耳其': 'Turkey',
  '沙特阿拉伯': 'Saudi Arabia',
  '瑞士': 'Switzerland',
  
  // 其他常见别名映射
  'US': 'United States',
  'USA': 'United States',
  'UK': 'United Kingdom',
  'CN': 'China',
  'JP': 'Japan',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'BR': 'Brazil',
  'CA': 'Canada',
  'AU': 'Australia',
  'IN': 'India',
  'RU': 'Russia',
  'KR': 'South Korea',
  'MX': 'Mexico',
  'ES': 'Spain',
  'ID': 'Indonesia',
  'NL': 'Netherlands',
  'TR': 'Turkey',
  'SA': 'Saudi Arabia',
  'CH': 'Switzerland'
}

// 标准化国家名称
export function normalizeCountryName(countryName: string): string {
  if (!countryName) return ''
  
  // 直接匹配
  if (countryMapping[countryName]) {
    return countryMapping[countryName]
  }
  
  // 不区分大小写匹配
  const lowerName = countryName.toLowerCase()
  for (const [key, value] of Object.entries(countryMapping)) {
    if (key.toLowerCase() === lowerName) {
      return value
    }
  }
  
  // 如果没有映射，返回原名称
  return countryName
}

// 获取标准英文名称（用于地图匹配）
export function getStandardEnglishName(countryName: string): string {
  if (!countryName) return ''
  
  // 如果本身就是英文名且在映射表中，直接返回
  const englishCountries = [
    'United States', 'China', 'Japan', 'Germany', 'United Kingdom', 
    'France', 'Italy', 'Brazil', 'Canada', 'Australia', 'India', 
    'Russia', 'South Korea', 'Mexico', 'Spain', 'Indonesia', 
    'Netherlands', 'Turkey', 'Saudi Arabia', 'Switzerland'
  ]
  
  if (englishCountries.includes(countryName)) {
    return countryName
  }
  
  // 从映射表中查找对应的英文名
  const normalized = normalizeCountryName(countryName)
  if (englishCountries.includes(normalized)) {
    return normalized
  }
  
  // 反向查找
  for (const [key, value] of Object.entries(countryMapping)) {
    if (value === countryName && englishCountries.includes(key)) {
      return key
    }
  }
  
  return countryName
}