-- ===========================================
-- 创建运费规则表
-- ===========================================

-- 创建运费规则表
CREATE TABLE IF NOT EXISTS shipping_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,           -- 规则名称，如"包邮区"、"偏远地区"
  provinces TEXT[] NOT NULL,            -- 适用省份列表
  base_fee DECIMAL(10,2) DEFAULT 0,     -- 基础运费
  free_threshold DECIMAL(10,2),         -- 包邮门槛，NULL 表示不包邮
  additional_fee DECIMAL(10,2) DEFAULT 0, -- 附加费用（偏远地区加收）
  priority INTEGER DEFAULT 0,           -- 优先级，数字越大优先级越高
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_shipping_rules_active ON shipping_rules(is_active, priority DESC);

-- 创建触发器更新 updated_at
CREATE OR REPLACE FUNCTION update_shipping_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_shipping_rules_updated_at ON shipping_rules;
CREATE TRIGGER trigger_shipping_rules_updated_at
  BEFORE UPDATE ON shipping_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_shipping_rules_updated_at();

-- 添加表注释
COMMENT ON TABLE shipping_rules IS '运费规则表';
COMMENT ON COLUMN shipping_rules.name IS '规则名称';
COMMENT ON COLUMN shipping_rules.provinces IS '适用省份列表';
COMMENT ON COLUMN shipping_rules.base_fee IS '基础运费';
COMMENT ON COLUMN shipping_rules.free_threshold IS '包邮门槛，NULL表示不包邮';
COMMENT ON COLUMN shipping_rules.additional_fee IS '附加费用';
COMMENT ON COLUMN shipping_rules.priority IS '优先级，越大越优先';
COMMENT ON COLUMN shipping_rules.is_active IS '是否启用';

-- ===========================================
-- 插入默认运费规则
-- ===========================================

-- 1. 包邮区（大部分省份）
INSERT INTO shipping_rules (name, provinces, base_fee, free_threshold, additional_fee, priority, is_active)
VALUES (
  '包邮区',
  ARRAY['北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江', 
        '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', 
        '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '宁夏', '广西'],
  10.00,  -- 基础运费
  99.00,  -- 满99包邮
  0,
  1,
  true
) ON CONFLICT DO NOTHING;

-- 2. 偏远地区
INSERT INTO shipping_rules (name, provinces, base_fee, free_threshold, additional_fee, priority, is_active)
VALUES (
  '偏远地区',
  ARRAY['西藏', '新疆', '内蒙古'],
  15.00,  -- 基础运费
  NULL,   -- 不包邮
  10.00,  -- 额外加收10元
  10,     -- 高优先级
  true
) ON CONFLICT DO NOTHING;

-- 3. 港澳台（不配送）
INSERT INTO shipping_rules (name, provinces, base_fee, free_threshold, additional_fee, priority, is_active)
VALUES (
  '不配送区',
  ARRAY['香港', '澳门', '台湾'],
  0,
  NULL,
  0,
  100,
  false  -- 禁用 = 不支持配送
) ON CONFLICT DO NOTHING;

-- ===========================================
-- 订单表添加运费字段（如果不存在）
-- ===========================================

-- 添加运费字段到订单表
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN orders.shipping_fee IS '订单运费';
