-- ========================================
-- 物流跟踪功能数据库迁移
-- ========================================

-- 1. 为订单表添加物流单号字段
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);

-- 2. 创建索引以提高查询效率
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number) WHERE tracking_number IS NOT NULL;

-- 3. 添加注释
COMMENT ON COLUMN orders.tracking_number IS '物流单号';

-- ========================================
-- 注意事项：
-- 1. 现有订单的 status 字段应支持以下值：
--    - pending (待支付)
--    - paid (已支付)
--    - pending_shipment (待发货)
--    - shipped (已发货)
--    - delivered (已签收/已完成)
--    - cancelled (已取消)
--    - refunded (已退款)
-- 
-- 2. 如果数据库使用了 ENUM 类型限制 status 字段，
--    需要手动添加新的状态值。Supabase 通常使用 VARCHAR，
--    所以这里不需要额外操作。
-- ========================================
