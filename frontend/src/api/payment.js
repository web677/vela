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
