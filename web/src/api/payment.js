import client from './client';

export const paymentAPI = {
  /**
   * 创建支付订单
   */
  createCharge: (data) => {
    return client.post('/payments/create', data);
  },

  /**
   * 查询支付状态
   */
  verifyPayment: (orderId) => {
    return client.get(`/payments/verify/${orderId}`);
  },

  /**
   * 通过订单号查询支付状态（用于支付回跳页面）
   */
  verifyPaymentByOrderNumber: (orderNumber) => {
    return client.get(`/payments/verify-by-order/${orderNumber}`);
  },
};

export const refundAPI = {
  /**
   * 创建退款
   */
  create: (data) => {
    return client.post('/payments/refunds/create', data);
  },

  /**
   * 查询退款状态
   */
  query: (refundId) => {
    return client.get(`/refunds/${refundId}`);
  },
};
