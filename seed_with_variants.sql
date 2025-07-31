-- Clear existing data
DELETE FROM "StockHistory";
DELETE FROM "Inventory";
DELETE FROM "AttributeValue";
DELETE FROM "ProductAttribute";
DELETE FROM "ProductVariant";
DELETE FROM "Product";
DELETE FROM "Category";

-- Insert categories
INSERT INTO "Category" ("id", "slug", "name_en", "name_ar", "icon") VALUES
('cat-1', 'electronics', 'Electronics', 'الإلكترونيات', '📱'),
('cat-2', 'fashion', 'Fashion', 'الأزياء', '👕'),
('cat-3', 'home', 'Home & Kitchen', 'المنزل والمطبخ', '🏠');

-- Insert products
INSERT INTO "Product" ("id", "slug", "name_en", "name_ar", "description_en", "description_ar", "image", "price", "categoryId", "inStock", "rating", "reviews") VALUES
('prod-1', 'wireless-headphones', 'Wireless Headphones', 'سماعات لاسلكية', 'High-quality wireless headphones with noise cancellation', 'سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء', '/images/products/headphones.jpg', 99.99, 'cat-1', true, 4.5, 128),
('prod-2', 'running-shoes', 'Running Shoes', 'أحذية الجري', 'Lightweight running shoes with superior comfort', 'أحذية جري خفيفة الوزن مع راحة فائقة', '/images/products/running-shoes.jpg', 129.99, 'cat-2', true, 4.2, 156),
('prod-3', 'coffee-maker', 'Coffee Maker', 'صانعة القهوة', 'Programmable coffee maker with timer', 'صانعة قهوة قابلة للبرمجة مع مؤقت', '/images/products/coffee-maker.jpg', 79.99, 'cat-3', true, 4.7, 203),
('prod-4', 'demo-t-shirt', 'Demo T-Shirt', 'تيشيرت تجريبي', 'A demo t-shirt with multiple variants', 'تيشيرت تجريبي مع عدة خيارات', '/images/products/tshirt.jpg', 25.99, 'cat-2', true, 4.0, 45);

-- Insert product attributes for products with variants
INSERT INTO "ProductAttribute" ("id", "productId", "name", "type") VALUES
('attr-1', 'prod-1', 'Color', 'color'),
('attr-2', 'prod-2', 'Size', 'size'),
('attr-3', 'prod-2', 'Color', 'color'),
('attr-4', 'prod-4', 'Size', 'size'),
('attr-5', 'prod-4', 'Color', 'color');

-- Insert attribute values
INSERT INTO "AttributeValue" ("id", "attributeId", "value", "label", "hexColor", "priceModifier", "inStock", "imageUrl") VALUES
-- Headphones colors
('val-1', 'attr-1', 'black', 'Black', '#000000', 0, true, NULL),
('val-2', 'attr-1', 'white', 'White', '#FFFFFF', 0, true, NULL),
('val-3', 'attr-1', 'silver', 'Silver', '#C0C0C0', 5, true, NULL),

-- Running shoes sizes
('val-4', 'attr-2', 'us7', 'US 7', NULL, 0, true, NULL),
('val-5', 'attr-2', 'us8', 'US 8', NULL, 0, true, NULL),
('val-6', 'attr-2', 'us9', 'US 9', NULL, 0, true, NULL),
('val-7', 'attr-2', 'us10', 'US 10', NULL, 0, false, NULL),

-- Running shoes colors
('val-8', 'attr-3', 'black', 'Black', '#000000', 0, true, NULL),
('val-9', 'attr-3', 'white', 'White', '#FFFFFF', 0, true, NULL),
('val-10', 'attr-3', 'red', 'Red', '#FF0000', 0, true, NULL),

-- T-shirt sizes
('val-11', 'attr-4', 's', 'Small', NULL, 0, true, NULL),
('val-12', 'attr-4', 'm', 'Medium', NULL, 0, true, NULL),
('val-13', 'attr-4', 'l', 'Large', NULL, 2, true, NULL),
('val-14', 'attr-4', 'xl', 'Extra Large', NULL, 4, true, NULL),

-- T-shirt colors
('val-15', 'attr-5', 'blue', 'Blue', '#0000FF', 0, true, NULL),
('val-16', 'attr-5', 'red', 'Red', '#FF0000', 0, true, NULL),
('val-17', 'attr-5', 'green', 'Green', '#008000', 0, true, NULL);

-- Insert product variants
INSERT INTO "ProductVariant" ("id", "productId", "sku", "price", "image", "inStock", "stockQuantity", "attributeValues") VALUES
-- Wireless Headphones variants
('var-1', 'prod-1', 'WH-BLACK', NULL, NULL, true, 20, '{"attr-1": "val-1"}'),
('var-2', 'prod-1', 'WH-WHITE', NULL, NULL, true, 15, '{"attr-1": "val-2"}'),
('var-3', 'prod-1', 'WH-SILVER', 104.99, NULL, true, 8, '{"attr-1": "val-3"}'),

-- Running Shoes variants (size + color combinations)
('var-4', 'prod-2', 'RS-US7-BLACK', NULL, NULL, true, 5, '{"attr-2": "val-4", "attr-3": "val-8"}'),
('var-5', 'prod-2', 'RS-US7-WHITE', NULL, NULL, true, 3, '{"attr-2": "val-4", "attr-3": "val-9"}'),
('var-6', 'prod-2', 'RS-US8-BLACK', NULL, NULL, true, 8, '{"attr-2": "val-5", "attr-3": "val-8"}'),
('var-7', 'prod-2', 'RS-US8-WHITE', NULL, NULL, true, 6, '{"attr-2": "val-5", "attr-3": "val-9"}'),
('var-8', 'prod-2', 'RS-US8-RED', NULL, NULL, true, 4, '{"attr-2": "val-5", "attr-3": "val-10"}'),
('var-9', 'prod-2', 'RS-US9-BLACK', NULL, NULL, true, 10, '{"attr-2": "val-6", "attr-3": "val-8"}'),
('var-10', 'prod-2', 'RS-US9-WHITE', NULL, NULL, true, 7, '{"attr-2": "val-6", "attr-3": "val-9"}'),

-- T-shirt variants (size + color combinations)
('var-11', 'prod-4', 'TS-S-BLUE', NULL, NULL, true, 12, '{"attr-4": "val-11", "attr-5": "val-15"}'),
('var-12', 'prod-4', 'TS-S-RED', NULL, NULL, true, 10, '{"attr-4": "val-11", "attr-5": "val-16"}'),
('var-13', 'prod-4', 'TS-M-BLUE', NULL, NULL, true, 15, '{"attr-4": "val-12", "attr-5": "val-15"}'),
('var-14', 'prod-4', 'TS-M-RED', NULL, NULL, true, 8, '{"attr-4": "val-12", "attr-5": "val-16"}'),
('var-15', 'prod-4', 'TS-M-GREEN', NULL, NULL, true, 6, '{"attr-4": "val-12", "attr-5": "val-17"}'),
('var-16', 'prod-4', 'TS-L-BLUE', 27.99, NULL, true, 5, '{"attr-4": "val-13", "attr-5": "val-15"}'),
('var-17', 'prod-4', 'TS-L-RED', 27.99, NULL, true, 3, '{"attr-4": "val-13", "attr-5": "val-16"}'),
('var-18', 'prod-4', 'TS-XL-BLUE', 29.99, NULL, true, 2, '{"attr-4": "val-14", "attr-5": "val-15"}');

-- Insert initial inventory data
INSERT INTO "Inventory" ("id", "productId", "stock", "stockThreshold", "createdAt", "updatedAt") VALUES
('inv-1', 'prod-1', 43, 10, NOW(), NOW()), -- Total of all headphone variants: 20+15+8=43
('inv-2', 'prod-2', 43, 15, NOW(), NOW()), -- Total of all shoe variants: 5+3+8+6+4+10+7=43
('inv-3', 'prod-3', 50, 15, NOW(), NOW()), -- Coffee maker (no variants)
('inv-4', 'prod-4', 61, 20, NOW(), NOW()); -- Total of all t-shirt variants: 12+10+15+8+6+5+3+2=61

-- Insert stock history entries
INSERT INTO "StockHistory" ("id", "productId", "change", "reason", "createdAt") VALUES
('hist-1', 'prod-1', 43, 'Initial stock with variants', NOW() - INTERVAL '7 days'),
('hist-2', 'prod-2', 50, 'Initial stock', NOW() - INTERVAL '7 days'),
('hist-3', 'prod-2', -7, 'Sales', NOW() - INTERVAL '3 days'),
('hist-4', 'prod-3', 50, 'Initial stock', NOW() - INTERVAL '7 days'),
('hist-5', 'prod-4', 70, 'Initial stock', NOW() - INTERVAL '7 days'),
('hist-6', 'prod-4', -9, 'Sales', NOW() - INTERVAL '2 days');
