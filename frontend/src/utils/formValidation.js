import { isValidEmail, isValidPhone } from './validators'

// 验证收货地址
export const validateShippingAddress = (address) => {
  const errors = []

  if (!address.name || address.name.trim() === '') {
    errors.push('请填写收货人姓名')
  }

  if (!address.phone || address.phone.trim() === '') {
    errors.push('请填写联系电话')
  } else if (!isValidPhone(address.phone)) {
    errors.push('请输入正确的手机号码')
  }

  if (!address.province || address.province.trim() === '') {
    errors.push('请填写省份')
  }

  if (!address.city || address.city.trim() === '') {
    errors.push('请填写城市')
  }

  if (!address.district || address.district.trim() === '') {
    errors.push('请填写区县')
  }

  if (!address.address || address.address.trim() === '') {
    errors.push('请填写详细地址')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 验证联系信息
export const validateContactInfo = (contact) => {
  const errors = []

  if (!contact.name || contact.name.trim() === '') {
    errors.push('请填写联系人姓名')
  }

  if (!contact.phone || contact.phone.trim() === '') {
    errors.push('请填写联系电话')
  } else if (!isValidPhone(contact.phone)) {
    errors.push('请输入正确的联系电话')
  }

  if (!contact.email || contact.email.trim() === '') {
    errors.push('请填写电子邮箱')
  } else if (!isValidEmail(contact.email)) {
    errors.push('请输入正确的邮箱地址')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 验证支付方式
export const validatePaymentMethod = (method) => {
  const errors = []

  if (!method || method.trim() === '') {
    errors.push('请选择支付方式')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 验证整个订单表单
export const validateOrderForm = (form, cartItems) => {
  const allErrors = []

  // 验证购物车
  if (!cartItems || cartItems.length === 0) {
    allErrors.push('购物车不能为空')
  }

  // 验证收货地址
  const addressValidation = validateShippingAddress(form.shipping_address)
  if (!addressValidation.valid) {
    allErrors.push(...addressValidation.errors)
  }

  // 验证联系信息
  const contactValidation = validateContactInfo(form.contact_info)
  if (!contactValidation.valid) {
    allErrors.push(...contactValidation.errors)
  }

  // 验证支付方式
  const paymentValidation = validatePaymentMethod(form.payment_method)
  if (!paymentValidation.valid) {
    allErrors.push(...paymentValidation.errors)
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors
  }
}
