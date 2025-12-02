-- ============================================
-- Payment and Refund Tables Migration
-- Ping++ Integration
-- ============================================

-- 1. Create payment_logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  charge_id VARCHAR(32) UNIQUE,
  channel VARCHAR(20) NOT NULL,  -- alipay_wap, wx_pub, etc.
  amount INTEGER NOT NULL,  -- 金额（分）
  currency VARCHAR(3) DEFAULT 'cny',
  status VARCHAR(20) DEFAULT 'pending',  -- pending, paid, failed, canceled
  ping_event_id VARCHAR(64),  -- webhook事件ID，防重放
  client_ip VARCHAR(45),
  extra JSONB,  -- 渠道额外参数
  metadata JSONB,  -- 商户自定义数据
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create refund_logs table
CREATE TABLE IF NOT EXISTS refund_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  refund_id VARCHAR(32) UNIQUE NOT NULL,
  charge_id VARCHAR(32) NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  amount INTEGER NOT NULL,  -- 退款金额(分)
  reason VARCHAR(500),  -- 退款原因
  status VARCHAR(20) DEFAULT 'pending',  -- pending, succeeded, failed
  ping_event_id VARCHAR(64),  -- webhook事件ID
  failure_code VARCHAR(50),
  failure_msg TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  succeeded_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_charge_id ON payment_logs(charge_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_refund_logs_order_id ON refund_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_logs_user_id ON refund_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_logs_charge_id ON refund_logs(charge_id);
CREATE INDEX IF NOT EXISTS idx_refund_logs_refund_id ON refund_logs(refund_id);
CREATE INDEX IF NOT EXISTS idx_refund_logs_status ON refund_logs(status);

-- 4. Add new order statuses for payment flow
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    -- Add payment-related statuses to orders enum if using enum
    -- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'pending_payment';
    -- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refunding';
    -- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refunded';
    
    -- Or if using VARCHAR, just add comment
    COMMENT ON COLUMN orders.status IS 'pending, pending_payment, paid, processing, shipped, delivered, completed, canceled, refunding, refunded';
  END IF;
END $$;

-- 5. Add updated_at trigger for payment_logs
CREATE OR REPLACE FUNCTION update_payment_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_logs_updated_at
BEFORE UPDATE ON payment_logs
FOR EACH ROW
EXECUTE FUNCTION update_payment_logs_updated_at();

-- 6. Add updated_at trigger for refund_logs
CREATE OR REPLACE FUNCTION update_refund_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refund_logs_updated_at
BEFORE UPDATE ON refund_logs
FOR EACH ROW
EXECUTE FUNCTION update_refund_logs_updated_at();

-- 7. Create view for payment summary
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
  p.id,
  p.order_id,
  p.charge_id,
  p.amount,
  p.status AS payment_status,
  p.channel,
  p.paid_at,
  o.status AS order_status,
  o.total_amount AS order_amount,
  COALESCE(SUM(r.amount), 0) AS refunded_amount
FROM payment_logs p
LEFT JOIN orders o ON p.order_id = o.id
LEFT JOIN refund_logs r ON r.charge_id = p.charge_id AND r.status = 'succeeded'
GROUP BY p.id, p.order_id, p.charge_id, p.amount, p.status, p.channel, p.paid_at, o.status, o.total_amount;

-- 8. Verification queries
SELECT 'Payment tables created successfully' AS status;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('payment_logs', 'refund_logs');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('payment_logs', 'refund_logs');
