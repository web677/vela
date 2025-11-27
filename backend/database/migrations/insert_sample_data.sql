-- ============================================
-- 完整数据插入脚本 (基于最新 data.json)
-- 执行前请先运行: add_gender_fields.sql
-- ============================================

-- 清空现有数据 (可选,谨慎使用)
-- TRUNCATE TABLE products CASCADE;
-- TRUNCATE TABLE product_series CASCADE;
-- TRUNCATE TABLE categories CASCADE;

-- ============================================
-- 1. 插入产品系列 (product_series)
-- ============================================

INSERT INTO product_series (slug, name, name_en, subtitle, description, theme_color, sort_order, target_gender, is_active)
VALUES
  ('soft-bloom', '初绽柔光', 'Soft Bloom', '轻柔入门，温和绽放', 
   '如花朵初绽般的轻柔与温顺，专为第一次探索、或偏好温和体验的她打造。触感细腻、使用友好，让每一次靠近都安心而自在。', 
   '#F7E9ED', 1, 'female', true),
   
  ('sense-flow', '灵感深流', 'Sense Flow', '智能感知，随心而动', 
   '灵感如流，随触而至。智能科技与柔美设计结合，带来更加细腻、深度的体验。适合追求创新、节奏变化与高品质感官的她。', 
   '#DCDFF8', 2, 'female', true),
   
  ('velvet-night', '绮夜余温', 'Velvet Night', '沉浸深层，温柔更深', 
   '属于进阶体验的浓郁氛围，如丝绒般深邃、绵延。适合熟悉自身节奏、追求更深层触感、探索更丰富体验的她。', 
   '#C9B2CE', 3, 'female', true),
   
  ('gentle-start', '初启轻行', 'Gentle Start', '轻松入门，自在掌控', 
   '以轻量级体验为核心，让初次探索变得轻松自然。亲肤、易操作、节奏友好，适合刚接触的他稳稳迈出第一步。', 
   '#E6EEF4', 4, 'male', true),
   
  ('tech-pulse', '智域脉动', 'Tech Pulse', '智能节奏，感官升级', 
   '将科技的力量调和为精准而灵动的节奏。智能模式、灵活变化、性能优越，适合追求科技与多维体验的他。', 
   '#C8D4E2', 5, 'male', true),
   
  ('dark-tide', '黎影深潮', 'Dark Tide', '强劲深层，沉浸不息', 
   '为追求深度感官与强力体验的他所设计。节奏更深、力量更稳，沉浸如暗潮涌动，是熟悉自我节奏后的进阶之选。', 
   '#A5A8B5', 6, 'male', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  theme_color = EXCLUDED.theme_color,
  sort_order = EXCLUDED.sort_order,
  target_gender = EXCLUDED.target_gender,
  is_active = EXCLUDED.is_active;

-- ============================================
-- 2. 插入分类 (categories)
-- ============================================

INSERT INTO categories (slug, name, target_gender, is_active, sort_order)
VALUES
  ('lubes', '润滑与护理', 'all', true, 1),
  ('couples-sets', '情侣互动', 'all', true, 2),
  ('solo-pleasure', '独享乐趣', 'all', true, 3)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  target_gender = EXCLUDED.target_gender,
  is_active = EXCLUDED.is_active;

-- ============================================
-- 3. 插入产品 (products)
-- ============================================

INSERT INTO products (
  name, 
  slug,
  description, 
  short_description,
  category_id, 
  series_id, 
  price, 
  stock, 
  is_active, 
  series_sort_order
)
SELECT 
  p.name,
  lower(replace(replace(p.name_en, ' ', '-'), '''', '')) as slug,
  p.description,
  p.subtitle as short_description,
  c.id as category_id,
  s.id as series_id,
  p.price,
  100 as stock,
  true as is_active,
  row_number() OVER (PARTITION BY s.id ORDER BY p.name) as series_sort_order
FROM (
  VALUES
    ('轻羽初触震动棒', 'Feather Touch Vibrator', '柔和震动，初次友好', '专为初次体验设计的轻柔震动棒，小巧精致，静音舒适', 'solo-pleasure', 'soft-bloom', 198.00),
    ('丝滑水溶性润滑液', 'Silky Water-Based Lube', '天然温和，清洁方便', '高品质水溶性配方，温和不刺激，易清洗', 'lubes', 'soft-bloom', 68.00),
    ('智能遥控跳蛋', 'Smart Remote Egg', 'APP远程，随心掌控', '支持手机APP控制，多种震动模式，静音设计', 'solo-pleasure', 'sense-flow', 328.00),
    ('情侣共振环', 'Couples Sync Ring', '双重震动，共享愉悦', '可充电震动环，增强双方体验，防水设计', 'couples-sets', 'sense-flow', 268.00),
    ('深度按摩棒', 'Deep Massage Wand', '强力深层，多档调节', '进阶级按摩棒，10档强度，USB充电', 'solo-pleasure', 'velvet-night', 458.00),
    ('绮夜奢华润滑油', 'Velvet Luxury Lube', '丝绒质感，持久滋润', '高端硅基润滑油，丝滑持久，防水配方', 'lubes', 'velvet-night', 138.00),
    ('情侣探索套装', 'Couples Discovery Kit', '丰富组合，一次满足', '包含震动环、润滑液、羽毛等多件套装', 'couples-sets', 'soft-bloom', 428.00),
    ('男士入门飞机杯', 'Beginner Male Masturbator', '柔软舒适，新手适用', '医用硅胶材质，柔软贴合，适合初次尝试', 'solo-pleasure', 'gentle-start', 268.00),
    ('智能震动环', 'Smart Vibrating Ring', '科技加持，精准刺激', '内置智能芯片，多种震动模式，增强持久力', 'solo-pleasure', 'tech-pulse', 388.00),
    ('强力震动棒', 'Power Vibrator', '澎湃动力，深度体验', '高强度震动，适合追求深度感官的进阶用户', 'solo-pleasure', 'dark-tide', 528.00),
    ('清新花香润滑液', 'Fresh Floral Lube', '淡雅花香，温柔呵护', '添加天然花卉精华，温和亲肤配方', 'lubes', 'soft-bloom', 88.00),
    ('智能感应按摩器', 'Smart Sensor Massager', '智能感知，精准调节', '内置传感器，根据反馈自动调节强度', 'solo-pleasure', 'sense-flow', 688.00),
    ('情侣双头震动器', 'Couples Double Vibrator', '双端设计，同步快乐', '创新双头设计，可同时刺激双方敏感部位', 'couples-sets', 'velvet-night', 598.00),
    ('迷你便携跳蛋', 'Mini Portable Egg', '小巧隐蔽，随身携带', '口红大小，超静音设计，USB充电', 'solo-pleasure', 'soft-bloom', 158.00),
    ('高端硅基润滑凝胶', 'Premium Silicone Gel', '医用硅胶，长效润滑', '医疗级硅基配方，超长持久，防水不沾', 'lubes', 'dark-tide', 168.00),
    ('G点精准刺激器', 'G-Spot Stimulator', '精准定位，深度愉悦', '符合人体工学弯曲设计，精准刺激G点', 'solo-pleasure', 'velvet-night', 398.00),
    ('情侣按摩蜡烛', 'Couples Massage Candle', '浪漫香氛，温热按摩', '点燃后融化为按摩油，香氛+按摩双重享受', 'couples-sets', 'sense-flow', 188.00),
    ('多频震动环', 'Multi-Frequency Ring', '多种模式，随心切换', '7种震动模式，可充电，柔软舒适', 'couples-sets', 'gentle-start', 218.00),
    ('智能APP飞机杯', 'Smart APP Masturbator', '远程互动，科技升级', '支持APP远程控制，多种模式可定制', 'solo-pleasure', 'tech-pulse', 758.00),
    ('温感润滑液', 'Warming Lube', '微温热感，舒适体验', '接触体温后产生温热感，增强愉悦体验', 'lubes', 'velvet-night', 98.00),
    ('智能震动内裤', 'Smart Vibrating Panty', '隐蔽穿戴，远程控制', '可穿戴震动器，支持远程APP控制', 'solo-pleasure', 'sense-flow', 428.00),
    ('情侣趣味骰子', 'Couples Fun Dice', '随机惊喜，增添情趣', '创意情趣骰子套装，增加互动乐趣', 'couples-sets', 'soft-bloom', 58.00),
    ('前列腺按摩器', 'Prostate Massager', '精准刺激，男士专属', '符合男性生理设计，震动+按压双重体验', 'solo-pleasure', 'dark-tide', 658.00),
    ('延时喷雾', 'Delay Spray', '温和配方，有效延时', '植物萃取配方，安全有效，无麻木感', 'lubes', 'gentle-start', 148.00),
    ('七彩变色震动棒', 'Rainbow LED Vibrator', '炫彩灯光，视觉盛宴', '内置LED灯效，7色变换，增加视觉趣味', 'solo-pleasure', 'sense-flow', 368.00),
    ('情侣互动游戏卡', 'Couples Game Cards', '趣味挑战，增进默契', '50张创意任务卡，增加情侣互动乐趣', 'couples-sets', 'tech-pulse', 88.00),
    ('自动伸缩飞机杯', 'Auto Thrusting Masturbator', '自动律动，解放双手', '电动伸缩设计，模拟真实体验，USB充电', 'solo-pleasure', 'dark-tide', 888.00),
    ('冰感润滑凝胶', 'Cooling Gel', '清凉舒爽，提神醒脑', '清凉薄荷配方，带来独特冰爽体验', 'lubes', 'tech-pulse', 78.00),
    ('吸吮式震动器', 'Suction Vibrator', '空气吸吮，独特快感', '创新吸吮技术，非接触式刺激', 'solo-pleasure', 'velvet-night', 568.00),
    ('情侣羽毛套装', 'Couples Feather Kit', '轻柔试探，温柔唤醒', '天然羽毛+眼罩组合，初学者友好', 'couples-sets', 'soft-bloom', 128.00)
) AS p(name, name_en, subtitle, description, category_slug, series_slug, price)
LEFT JOIN categories c ON c.slug = p.category_slug
LEFT JOIN product_series s ON s.slug = p.series_slug
WHERE c.id IS NOT NULL AND s.id IS NOT NULL;

-- ============================================
-- 4. 验证插入结果
-- ============================================

-- 查看插入的系列数量
SELECT '系列总数' as 项目, COUNT(*) as 数量 FROM product_series
UNION ALL
SELECT '分类总数', COUNT(*) FROM categories
UNION ALL
SELECT '产品总数', COUNT(*) FROM products;

-- 查看按系列分组的产品数量
SELECT 
  s.name as 系列名称, 
  s.target_gender as 适用性别,
  COUNT(p.id) as 产品数量
FROM product_series s
LEFT JOIN products p ON p.series_id = s.id
GROUP BY s.id, s.name, s.target_gender, s.sort_order
ORDER BY s.sort_order;

-- 查看按分类分组的产品数量
SELECT 
  c.name as 分类名称,
  c.target_gender as 适用性别,
  COUNT(p.id) as 产品数量
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name, c.target_gender
ORDER BY c.sort_order;
