-- Đồng bộ dữ liệu hình ảnh từ frontend vào database
-- Dựa trên dữ liệu trong vehicles.ts

-- ============================================
-- CẬP NHẬT HÌNH ẢNH CHO VEHICLE_MODELS
-- ============================================

-- VF3 Model
UPDATE vehicle_models SET 
    image = 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png',
    price_per_hour = 8,
    price_per_day = 60,
    max_range_km = 210
WHERE model_id = 'VF3';

-- VF5 Model  
UPDATE vehicle_models SET 
    image = 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png',
    price_per_hour = 12,
    price_per_day = 95,
    max_range_km = 285
WHERE model_id = 'VF5';

-- VF6 Model
UPDATE vehicle_models SET 
    image = 'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-trang-1-1110x1032-600x600-1.jpg',
    price_per_hour = 15,
    price_per_day = 120,
    max_range_km = 365
WHERE model_id = 'VF6';

-- VF7 Model
UPDATE vehicle_models SET 
    image = 'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png',
    price_per_hour = 18,
    price_per_day = 145,
    max_range_km = 390
WHERE model_id = 'VF7';

-- VF8 Model
UPDATE vehicle_models SET 
    image = 'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VINFAST%20VFE35/5F1DF5B0-B8ED-45F8-993B-755D9D014FBC.jpeg',
    price_per_hour = 22,
    price_per_day = 175,
    max_range_km = 425
WHERE model_id = 'VF8';

-- VF9 Model
UPDATE vehicle_models SET 
    image = 'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp',
    price_per_hour = 28,
    price_per_day = 220,
    max_range_km = 485
WHERE model_id = 'VF9';

-- EVO200 Model
UPDATE vehicle_models SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png',
    price_per_hour = 6,
    price_per_day = 35,
    max_range_km = 90
WHERE model_id = 'EVO200';

-- EVO200LITE Model
UPDATE vehicle_models SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png',
    price_per_hour = 5,
    price_per_day = 30,
    max_range_km = 75
WHERE model_id = 'EVO200LITE';

-- EVOGRAND Model
UPDATE vehicle_models SET 
    image = 'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg',
    price_per_hour = 7,
    price_per_day = 40,
    max_range_km = 110
WHERE model_id = 'EVOGRAND';

-- EVOGRANDLITE Model
UPDATE vehicle_models SET 
    image = 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png',
    price_per_hour = 6,
    price_per_day = 35,
    max_range_km = 95
WHERE model_id = 'EVOGRANDLITE';

-- EVONEO Model
UPDATE vehicle_models SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp',
    price_per_hour = 5,
    price_per_day = 28,
    max_range_km = 78
WHERE model_id = 'EVONEO';

-- FELIZS Model
UPDATE vehicle_models SET 
    image = 'https://xedientruonghien.com/thumbs/575x575x2/upload/product/baq-8655.png',
    price_per_hour = 4,
    price_per_day = 25,
    max_range_km = 65
WHERE model_id = 'FELIZS';

-- FELIZLITE Model
UPDATE vehicle_models SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp',
    price_per_hour = 3,
    price_per_day = 20,
    max_range_km = 55
WHERE model_id = 'FELIZLITE';

-- ============================================
-- CẬP NHẬT HÌNH ẢNH CHO VEHICLES (Một số ví dụ)
-- ============================================

-- VF3 Vehicles
UPDATE vehicles SET 
    image = 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png',
    license_plate = '50A-001',
    fuel_efficiency = '110 kWh/100km',
    location = 'District 1 Station'
WHERE unique_vehicle_id = 'VN1VF3001A0001001';

UPDATE vehicles SET 
    image = 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf3-do.png',
    license_plate = '50A-002',
    fuel_efficiency = '110 kWh/100km',
    location = 'Airport Station'
WHERE unique_vehicle_id = 'VN1VF3001A0001002';

UPDATE vehicles SET 
    image = 'https://vinfast-tphochiminh.com/OTO3602300549/files/mau_xe/VF3/vang.webp',
    license_plate = '50A-003',
    fuel_efficiency = '110 kWh/100km',
    location = 'District 5 Station'
WHERE unique_vehicle_id = 'VN1VF3001A0001003';

UPDATE vehicles SET 
    image = 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xanh-Noc-trang-min.png',
    license_plate = '50A-004',
    fuel_efficiency = '110 kWh/100km',
    location = 'Thu Duc Station'
WHERE unique_vehicle_id = 'VN1VF3001A0001004';

-- VF5 Vehicles
UPDATE vehicles SET 
    image = 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png',
    license_plate = '51B-001',
    fuel_efficiency = '125 kWh/100km',
    location = 'District 7 Station'
WHERE unique_vehicle_id = 'VN1VF5001A0002001';

UPDATE vehicles SET 
    image = 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf5-trang.png',
    license_plate = '51B-002',
    fuel_efficiency = '125 kWh/100km',
    location = 'District 3 Station'
WHERE unique_vehicle_id = 'VN1VF5001A0002002';

-- VF6 Vehicles
UPDATE vehicles SET 
    image = 'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-trang-1-1110x1032-600x600-1.jpg',
    license_plate = '51C-001',
    fuel_efficiency = '140 kWh/100km',
    location = 'District 1 Station'
WHERE unique_vehicle_id = 'VN1VF6001A0003001';

UPDATE vehicles SET 
    image = 'https://vfxanh.vn/wp-content/uploads/2024/08/9.png',
    license_plate = '51C-002',
    fuel_efficiency = '140 kWh/100km',
    location = 'Airport Station'
WHERE unique_vehicle_id = 'VN1VF6001A0003002';

-- VF7 Vehicles
UPDATE vehicles SET 
    image = 'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png',
    license_plate = '51D-001',
    fuel_efficiency = '155 kWh/100km',
    location = 'District 7 Station'
WHERE unique_vehicle_id = 'VN1VF7001A0004001';

UPDATE vehicles SET 
    image = 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf7-do.png',
    license_plate = '51D-002',
    fuel_efficiency = '155 kWh/100km',
    location = 'District 3 Station'
WHERE unique_vehicle_id = 'VN1VF7001A0004002';

-- VF8 Vehicles
UPDATE vehicles SET 
    image = 'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VINFAST%20VFE35/5F1DF5B0-B8ED-45F8-993B-755D9D014FBC.jpeg',
    license_plate = '51E-001',
    fuel_efficiency = '165 kWh/100km',
    location = 'District 1 Station'
WHERE unique_vehicle_id = 'VN1VF8001A0005001';

UPDATE vehicles SET 
    image = 'https://vinfast-auto-vn.net/wp-content/uploads/2022/08/VinFast-VF-8-mau-Xanh-Luc.png',
    license_plate = '51E-002',
    fuel_efficiency = '165 kWh/100km',
    location = 'Airport Station'
WHERE unique_vehicle_id = 'VN1VF8001A0005002';

-- VF9 Vehicles
UPDATE vehicles SET 
    image = 'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp',
    license_plate = '51F-001',
    fuel_efficiency = '180 kWh/100km',
    location = 'District 7 Station'
WHERE unique_vehicle_id = 'VN1VF9001A0006001';

UPDATE vehicles SET 
    image = 'https://vinfastductronglamdong.vn/images/thumbs/2025/03/vinfast-vf-9.png',
    license_plate = '51F-002',
    fuel_efficiency = '180 kWh/100km',
    location = 'District 3 Station'
WHERE unique_vehicle_id = 'VN1VF9001A0006002';

-- Scooters
UPDATE vehicles SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png',
    license_plate = '59A-001',
    fuel_efficiency = '35 kWh/100km',
    location = 'District 5 Station'
WHERE unique_vehicle_id = 'VN2EVO200A0007005';

UPDATE vehicles SET 
    image = 'https://xedientruonghien.com/thumbs/575x575x2/upload/product/baq-8655.png',
    license_plate = '59B-001',
    fuel_efficiency = '28 kWh/100km',
    location = 'District 1 Station'
WHERE unique_vehicle_id = 'VN2FELIZSA0013001';

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================

-- Kiểm tra vehicle_models đã có hình ảnh
SELECT 'VEHICLE MODELS WITH IMAGES:' as Info;
SELECT model_id, brand, model_name, image, price_per_hour, price_per_day, max_range_km
FROM vehicle_models
WHERE image IS NOT NULL;

-- Kiểm tra vehicles đã có hình ảnh
SELECT 'VEHICLES WITH IMAGES:' as Info;
SELECT vehicle_id, unique_vehicle_id, license_plate, image, fuel_efficiency, location
FROM vehicles
WHERE image IS NOT NULL
ORDER BY vehicle_id;
