-- 修复 payment_logs 表，添加缺失的列
-- 检查并添加 charge_data 列
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_logs' AND column_name = 'charge_data'
    ) THEN
        ALTER TABLE payment_logs ADD COLUMN charge_data JSONB;
        COMMENT ON COLUMN payment_logs.charge_data IS 'Ping++ Charge对象完整数据';
    END IF;
END $$;

-- 检查并添加 ping_event_id 列
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_logs' AND column_name = 'ping_event_id'
    ) THEN
        ALTER TABLE payment_logs ADD COLUMN ping_event_id VARCHAR(64);
        COMMENT ON COLUMN payment_logs.ping_event_id IS 'Ping++ webhook事件ID，用于防重放攻击';
    END IF;
END $$;

-- 检查并添加 paid_at 列
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_logs' AND column_name = 'paid_at'
    ) THEN
        ALTER TABLE payment_logs ADD COLUMN paid_at TIMESTAMPTZ;
        COMMENT ON COLUMN payment_logs.paid_at IS '实际支付完成时间';
    END IF;
END $$;

-- 为 refund_logs 添加缺失的列
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'refund_logs' AND column_name = 'refund_data'
    ) THEN
        ALTER TABLE refund_logs ADD COLUMN refund_data JSONB;
        COMMENT ON COLUMN refund_logs.refund_data IS 'Ping++ Refund对象完整数据';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'refund_logs' AND column_name = 'succeeded_at'
    ) THEN
        ALTER TABLE refund_logs ADD COLUMN succeeded_at TIMESTAMPTZ;
        COMMENT ON COLUMN refund_logs.succeeded_at IS '退款成功时间';
    END IF;
END $$;

-- 创建索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_payment_logs_ping_event ON payment_logs(ping_event_id);
CREATE INDEX IF NOT EXISTS idx_refund_logs_refund_id ON refund_logs(refund_id);
CREATE INDEX IF NOT EXISTS idx_refund_logs_charge_id ON refund_logs(charge_id);

-- 显示完成消息
DO $$
BEGIN
    RAISE NOTICE '✅ Payment tables migration fix completed successfully!';
END $$;
