// 验证邮箱
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// 验证手机号
export const isValidPhone = (phone) => {
  const re = /^1[3-9]\d{9}$/
  return re.test(phone)
}

// 验证密码强度（至少6位）
export const isValidPassword = (password) => {
  return password.length >= 6
}
