-- Insert test categories
INSERT INTO "Category" ("id", "slug", "name_en", "name_ar", "icon") VALUES
('cat-1', 'electronics', 'Electronics', 'الإلكترونيات', '📱'),
('cat-2', 'fashion', 'Fashion', 'الأزياء', '👕'),
('cat-3', 'home', 'Home & Kitchen', 'المنزل والمطبخ', '🏠');

-- Insert test products
INSERT INTO "Product" ("id", "slug", "name_en", "name_ar", "description_en", "description_ar", "image", "price", "categoryId", "inStock", "rating", "reviews") VALUES
('prod-1', 'wireless-headphones', 'Wireless Headphones', 'سماعات لاسلكية', 'High-quality wireless headphones with noise cancellation', 'سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء', '/images/products/headphones.jpg', 99.99, 'cat-1', true, 4.5, 128),
('prod-2', 'smart-watch', 'Smart Watch', 'ساعة ذكية', 'Feature-rich smartwatch with health tracking', 'ساعة ذكية غنية بالميزات مع تتبع الصحة', '/images/products/smartwatch.jpg', 199.99, 'cat-1', false, 4.3, 89),
('prod-3', 'coffee-maker', 'Coffee Maker', 'صانعة القهوة', 'Programmable coffee maker with timer', 'صانعة قهوة قابلة للبرمجة مع مؤقت', '/images/products/coffee-maker.jpg', 79.99, 'cat-3', true, 4.7, 203),
('prod-4', 'running-shoes', 'Running Shoes', 'أحذية الجري', 'Lightweight running shoes with superior comfort', 'أحذية جري خفيفة الوزن مع راحة فائقة', '/images/products/running-shoes.jpg', 129.99, 'cat-2', true, 4.2, 156);

-- Insert initial inventory data
INSERT INTO "Inventory" ("id", "productId", "stock", "stockThreshold", "createdAt", "updatedAt") VALUES
('inv-1', 'prod-1', 25, 10, NOW(), NOW()),
('inv-2', 'prod-2', 3, 5, NOW(), NOW()),
('inv-3', 'prod-3', 50, 15, NOW(), NOW()),
('inv-4', 'prod-4', 8, 20, NOW(), NOW());

-- Insert some stock history entries
INSERT INTO "StockHistory" ("id", "productId", "change", "reason", "createdAt") VALUES
('hist-1', 'prod-1', 25, 'Initial stock', NOW() - INTERVAL '7 days'),
('hist-2', 'prod-2', 10, 'Initial stock', NOW() - INTERVAL '7 days'),
('hist-3', 'prod-2', -7, 'Sales', NOW() - INTERVAL '3 days'),
('hist-4', 'prod-3', 50, 'Initial stock', NOW() - INTERVAL '7 days'),
('hist-5', 'prod-4', 30, 'Initial stock', NOW() - INTERVAL '7 days'),
('hist-6', 'prod-4', -22, 'Sales', NOW() - INTERVAL '2 days');
