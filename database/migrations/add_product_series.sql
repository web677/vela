-- ========================================
-- Vela 产品系列表创建脚本
-- ========================================

-- 创建产品系列表
CREATE TABLE IF NOT EXISTS product_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  subtitle VARCHAR(200),
  description TEXT,
  theme_color VARCHAR(7) DEFAULT '#B8A4D4',
  hero_image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_series_active ON product_series(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_series_slug ON product_series(slug);

-- 修改 products 表，添加系列关联
ALTER TABLE products
ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES product_series(id),
ADD COLUMN IF NOT EXISTS series_sort_order INTEGER DEFAULT 0;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_series ON products(series_id, series_sort_order) WHERE series_id IS NOT NULL;

-- 插入 8 个优雅系列数据
INSERT INTO product_series (slug, name, name_en, subtitle, description, theme_color, sort_order, is_active)
VALUES
-- 1. 雾光森林
('misty-woods', '雾光森林', 'Misty Woods', '温柔探索，自然纯粹', 
 '清晨微光穿过林间薄雾，一切温柔而神秘。雾光森林系列以天然材质与柔和触感为灵感，为你带来如同漫步林间般舒适自在的体验。适合追求自然纯粹、温和舒适的你。',
 '#9BC4A3', 1, true),

-- 2. 月白时分
('moonlight-hour', '月白时分', 'Moonlight Hour', '宁静私享，月下柔情',
 '月光如水，时光静谧。月白时分系列以纯净色调与细腻质感呈现，在夜幕降临时分，为你守护一份专属的宁静与温柔。让每个夜晚都充满诗意与浪漫。',
 '#E8E4F0', 2, true),

-- 3. 琥珀余温
('amber-warmth', '琥珀余温', 'Amber Warmth', '温暖相拥，时光凝固',
 '琥珀凝固了时光的温度，也保留了最珍贵的温暖。琥珀余温系列以温润材质与舒适温度为核心，让每一次接触都如同被温柔拥抱，感受持久而温暖的陪伴。',
 '#F4E8D9', 3, true),

-- 4. 浅眠之羽
('feather-dreams', '浅眠之羽', 'Feather Dreams', '轻柔细腻，如梦似幻',
 '羽毛般轻盈，云朵般柔软，浅眠之羽系列以极致轻柔的触感设计，让每一刻都仿佛漂浮在梦境的边缘，温柔而美好。追求极致舒适与细腻体验的理想之选。',
 '#F0E4E8', 4, true),

-- 5. 晨曦低语
('dawn-whisper', '晨曦低语', 'Dawn Whisper', '清新启程，温柔唤醒',
 '晨光初现，万物苏醒。晨曦低语系列以清新纯净的设计语言，为你开启每一个充满希望的美好清晨，温柔而充满力量。让每一天都从温柔的唤醒开始。',
 '#DCE9E8', 5, true),

-- 6. 星河印记
('starry-trace', '星河印记', 'Starry Trace', '璀璨瞬间，永恒记忆',
 '星河流转，每一颗星都是独特的印记。星河印记系列以精致工艺与闪耀设计，捕捉生命中每一个璀璨的美好瞬间，让珍贵记忆永恒闪耀。',
 '#A8C8D8', 6, true),

-- 7. 薄暮微光
('twilight-glow', '薄暮微光', 'Twilight Glow', '暮色温柔，光影交织',
 '日落时分，天空呈现最丰富的色彩。薄暮微光系列融合渐变美学与柔和触感，在光影交织间感受最细腻的温柔时刻，如同暮色中的温柔拥抱。',
 '#D4C5E8', 7, true),

-- 8. 静谧花园
('silent-garden', '静谧花园', 'Silent Garden', '私密空间，芬芳守护',
 '在属于自己的花园里，一切都是静谧而美好的。静谧花园系列以植物精华与温和配方，守护你最私密的舒适与安心，让身心在自然芬芳中得到温柔呵护。',
 '#E8C89C', 8, true)

ON CONFLICT (slug) DO NOTHING;

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_series_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_series_timestamp
BEFORE UPDATE ON product_series
FOR EACH ROW
EXECUTE FUNCTION update_series_timestamp();

-- 添加注释
COMMENT ON TABLE product_series IS '产品系列表 - 存储优雅的产品系列信息';
COMMENT ON COLUMN product_series.slug IS 'URL友好的系列标识符';
COMMENT ON COLUMN product_series.name IS '系列中文名称';
COMMENT ON COLUMN product_series.name_en IS '系列英文名称';
COMMENT ON COLUMN product_series.subtitle IS '系列副标题';
COMMENT ON COLUMN product_series.description IS '系列描述';
COMMENT ON COLUMN product_series.theme_color IS '系列主题色 HEX';
COMMENT ON COLUMN product_series.hero_image_url IS '系列头图URL';
COMMENT ON COLUMN product_series.sort_order IS '排序权重';
COMMENT ON COLUMN product_series.is_active IS '是否启用';
