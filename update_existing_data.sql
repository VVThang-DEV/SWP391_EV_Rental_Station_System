-- Cập nhật dữ liệu hiện có thay vì xóa và tạo lại
-- Bổ sung các trường còn thiếu từ vehicles.ts

-- ============================================
-- BƯỚC 1: CẬP NHẬT VEHICLE_MODELS VỚI DỮ LIỆU TỪ FRONTEND
-- ============================================

-- VF3 Model
UPDATE vehicle_models SET 
    image = 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png',
    price_per_hour = 8.00,
    price_per_day = 60.00,
    max_range_km = 210
WHERE model_id = 'VF3';

-- VF5 Model  
UPDATE vehicle_models SET 
    image = 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png',
    price_per_hour = 12.00,
    price_per_day = 95.00,
    max_range_km = 285
WHERE model_id = 'VF5';

-- VF6 Model
UPDATE vehicle_models SET 
    image = 'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-trang-1-1110x1032-600x600-1.jpg',
    price_per_hour = 15.00,
    price_per_day = 120.00,
    max_range_km = 365
WHERE model_id = 'VF6';

-- VF7 Model
UPDATE vehicle_models SET 
    image = 'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png',
    price_per_hour = 18.00,
    price_per_day = 145.00,
    max_range_km = 390
WHERE model_id = 'VF7';

-- VF8 Model
UPDATE vehicle_models SET 
    image = 'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VINFAST%20VFE35/5F1DF5B0-B8ED-45F8-993B-755D9D014FBC.jpeg',
    price_per_hour = 22.00,
    price_per_day = 175.00,
    max_range_km = 425
WHERE model_id = 'VF8';

-- VF9 Model
UPDATE vehicle_models SET 
    image = 'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp',
    price_per_hour = 28.00,
    price_per_day = 220.00,
    max_range_km = 485
WHERE model_id = 'VF9';

-- EVO200 Model
UPDATE vehicle_models SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png',
    price_per_hour = 6.00,
    price_per_day = 35.00,
    max_range_km = 90
WHERE model_id = 'EVO200';

-- EVO200LITE Model
UPDATE vehicle_models SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png',
    price_per_hour = 5.00,
    price_per_day = 30.00,
    max_range_km = 75
WHERE model_id = 'EVO200LITE';

-- EVOGRAND Model
UPDATE vehicle_models SET 
    image = 'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg',
    price_per_hour = 7.00,
    price_per_day = 40.00,
    max_range_km = 110
WHERE model_id = 'EVOGRAND';

-- EVOGRANDLITE Model
UPDATE vehicle_models SET 
    image = 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png',
    price_per_hour = 6.00,
    price_per_day = 35.00,
    max_range_km = 95
WHERE model_id = 'EVOGRANDLITE';

-- EVONEO Model
UPDATE vehicle_models SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp',
    price_per_hour = 5.00,
    price_per_day = 28.00,
    max_range_km = 78
WHERE model_id = 'EVONEO';

-- FELIZS Model
UPDATE vehicle_models SET 
    image = 'https://xedientruonghien.com/thumbs/575x575x2/upload/product/baq-8655.png',
    price_per_hour = 4.00,
    price_per_day = 25.00,
    max_range_km = 65
WHERE model_id = 'FELIZS';

-- FELIZLITE Model
UPDATE vehicle_models SET 
    image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp',
    price_per_hour = 3.00,
    price_per_day = 20.00,
    max_range_km = 55
WHERE model_id = 'FELIZLITE';

-- ============================================
-- BƯỚC 2: CẬP NHẬT VEHICLES VỚI DỮ LIỆU CHI TIẾT
-- ============================================

-- Cập nhật tất cả xe VF3
UPDATE vehicles SET 
    image = CASE 
        WHEN unique_vehicle_id = 'VN1VF3001A0001001' THEN 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png'
        WHEN unique_vehicle_id = 'VN1VF3001A0001002' THEN 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf3-do.png'
        WHEN unique_vehicle_id = 'VN1VF3001A0001003' THEN 'https://vinfast-tphochiminh.com/OTO3602300549/files/mau_xe/VF3/vang.webp'
        WHEN unique_vehicle_id = 'VN1VF3001A0001004' THEN 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xanh-Noc-trang-min.png'
        ELSE image
    END,
    license_plate = CASE 
        WHEN unique_vehicle_id = 'VN1VF3001A0001001' THEN '50A-001'
        WHEN unique_vehicle_id = 'VN1VF3001A0001002' THEN '50A-002'
        WHEN unique_vehicle_id = 'VN1VF3001A0001003' THEN '50A-003'
        WHEN unique_vehicle_id = 'VN1VF3001A0001004' THEN '50A-004'
        ELSE license_plate
    END,
    fuel_efficiency = '110 kWh/100km',
    location = CASE 
        WHEN station_id = 1 THEN 'District 1 Station'
        WHEN station_id = 3 THEN 'Airport Station'
        WHEN station_id = 5 THEN 'District 5 Station'
        WHEN station_id = 7 THEN 'Thu Duc Station'
        ELSE location
    END
WHERE model_id = 'VF3';

-- Cập nhật tất cả xe VF5
UPDATE vehicles SET 
    image = CASE 
        WHEN unique_vehicle_id = 'VN1VF5001A0002001' THEN 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png'
        WHEN unique_vehicle_id = 'VN1VF5001A0002002' THEN 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf5-trang.png'
        WHEN unique_vehicle_id = 'VN1VF5001A0002003' THEN 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey-white.png'
        WHEN unique_vehicle_id = 'VN1VF5001A0002004' THEN 'https://vinfastdienchau.com/wp-content/uploads/2014/08/vinfast-vf5-orange.png'
        ELSE image
    END,
    license_plate = CASE 
        WHEN unique_vehicle_id = 'VN1VF5001A0002001' THEN '51B-001'
        WHEN unique_vehicle_id = 'VN1VF5001A0002002' THEN '51B-002'
        WHEN unique_vehicle_id = 'VN1VF5001A0002003' THEN '51B-003'
        WHEN unique_vehicle_id = 'VN1VF5001A0002004' THEN '51B-004'
        ELSE license_plate
    END,
    fuel_efficiency = '125 kWh/100km',
    location = CASE 
        WHEN station_id = 2 THEN 'District 7 Station'
        WHEN station_id = 4 THEN 'District 3 Station'
        WHEN station_id = 6 THEN 'Binh Thanh Station'
        WHEN station_id = 8 THEN 'Phu Nhuan Station'
        ELSE location
    END
WHERE model_id = 'VF5';

-- Cập nhật tất cả xe VF6
UPDATE vehicles SET 
    image = CASE 
        WHEN unique_vehicle_id = 'VN1VF6001A0003001' THEN 'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-trang-1-1110x1032-600x600-1.jpg'
        WHEN unique_vehicle_id = 'VN1VF6001A0003002' THEN 'https://vfxanh.vn/wp-content/uploads/2024/08/9.png'
        WHEN unique_vehicle_id = 'VN1VF6001A0003003' THEN 'https://vinfastthanhhoa.net/wp-content/uploads/2024/03/vinfast-vf6-2.jpg'
        WHEN unique_vehicle_id = 'VN1VF6001A0003004' THEN 'https://vinfast3sthanhhoa.com/wp-content/uploads/2023/09/vf6-mau-xam-1-1110x1032-600x600-1.jpg'
        ELSE image
    END,
    license_plate = CASE 
        WHEN unique_vehicle_id = 'VN1VF6001A0003001' THEN '51C-001'
        WHEN unique_vehicle_id = 'VN1VF6001A0003002' THEN '51C-002'
        WHEN unique_vehicle_id = 'VN1VF6001A0003003' THEN '51C-003'
        WHEN unique_vehicle_id = 'VN1VF6001A0003004' THEN '51C-004'
        ELSE license_plate
    END,
    fuel_efficiency = '140 kWh/100km',
    location = CASE 
        WHEN station_id = 1 THEN 'District 1 Station'
        WHEN station_id = 3 THEN 'Airport Station'
        WHEN station_id = 5 THEN 'District 5 Station'
        WHEN station_id = 7 THEN 'Thu Duc Station'
        ELSE location
    END
WHERE model_id = 'VF6';

-- Cập nhật tất cả xe VF7
UPDATE vehicles SET 
    image = CASE 
        WHEN unique_vehicle_id = 'VN1VF7001A0004001' THEN 'https://vinfastdongthap.vn/wp-content/uploads/2023/09/mau-xe-vinfast-vf7-6.png'
        WHEN unique_vehicle_id = 'VN1VF7001A0004002' THEN 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf7-do.png'
        WHEN unique_vehicle_id = 'VN1VF7001A0004003' THEN 'https://vinfastvietnam.com.vn/wp-content/uploads/2022/11/Xam-Xi-Mang-min.png'
        WHEN unique_vehicle_id = 'VN1VF7001A0004004' THEN 'https://vinfast-chevrolet.net/upload/sanpham/tai-xuong-0293.png'
        ELSE image
    END,
    license_plate = CASE 
        WHEN unique_vehicle_id = 'VN1VF7001A0004001' THEN '51D-001'
        WHEN unique_vehicle_id = 'VN1VF7001A0004002' THEN '51D-002'
        WHEN unique_vehicle_id = 'VN1VF7001A0004003' THEN '51D-003'
        WHEN unique_vehicle_id = 'VN1VF7001A0004004' THEN '51D-004'
        ELSE license_plate
    END,
    fuel_efficiency = '155 kWh/100km',
    location = CASE 
        WHEN station_id = 2 THEN 'District 7 Station'
        WHEN station_id = 4 THEN 'District 3 Station'
        WHEN station_id = 6 THEN 'Binh Thanh Station'
        WHEN station_id = 8 THEN 'Phu Nhuan Station'
        ELSE location
    END
WHERE model_id = 'VF7';

-- Cập nhật tất cả xe VF8
UPDATE vehicles SET 
    image = CASE 
        WHEN unique_vehicle_id = 'VN1VF8001A0005001' THEN 'https://vinfastvietnam.net.vn/uploads/data/3097/files/files/VINFAST%20VFE35/5F1DF5B0-B8ED-45F8-993B-755D9D014FBC.jpeg'
        WHEN unique_vehicle_id = 'VN1VF8001A0005002' THEN 'https://vinfast-auto-vn.net/wp-content/uploads/2022/08/VinFast-VF-8-mau-Xanh-Luc.png'
        WHEN unique_vehicle_id = 'VN1VF8001A0005003' THEN 'https://vinfastphantrongtue.com/wp-content/uploads/2023/09/11.png'
        WHEN unique_vehicle_id = 'VN1VF8001A0005004' THEN 'https://vinfastvietnam.com.vn/wp-content/uploads/2022/08/Bac-PLUS-min.png'
        ELSE image
    END,
    license_plate = CASE 
        WHEN unique_vehicle_id = 'VN1VF8001A0005001' THEN '51E-001'
        WHEN unique_vehicle_id = 'VN1VF8001A0005002' THEN '51E-002'
        WHEN unique_vehicle_id = 'VN1VF8001A0005003' THEN '51E-003'
        WHEN unique_vehicle_id = 'VN1VF8001A0005004' THEN '51E-004'
        ELSE license_plate
    END,
    fuel_efficiency = '165 kWh/100km',
    location = CASE 
        WHEN station_id = 1 THEN 'District 1 Station'
        WHEN station_id = 3 THEN 'Airport Station'
        WHEN station_id = 5 THEN 'District 5 Station'
        WHEN station_id = 7 THEN 'Thu Duc Station'
        ELSE location
    END
WHERE model_id = 'VF8';

-- Cập nhật tất cả xe VF9
UPDATE vehicles SET 
    image = CASE 
        WHEN unique_vehicle_id = 'VN1VF9001A0006001' THEN 'https://vnvinfast.com/data/upload/media/img-ce1h-1699328361.webp'
        WHEN unique_vehicle_id = 'VN1VF9001A0006002' THEN 'https://vinfastductronglamdong.vn/images/thumbs/2025/03/vinfast-vf-9.png'
        WHEN unique_vehicle_id = 'VN1VF9001A0006003' THEN 'https://vinfast-cars.vn/wp-content/uploads/2024/10/vinfast-vf9-xam.png'
        WHEN unique_vehicle_id = 'VN1VF9001A0006004' THEN 'https://vinfasthadong.com.vn/wp-content/uploads/2023/10/vinfast-vf9-blue.jpg'
        ELSE image
    END,
    license_plate = CASE 
        WHEN unique_vehicle_id = 'VN1VF9001A0006001' THEN '51F-001'
        WHEN unique_vehicle_id = 'VN1VF9001A0006002' THEN '51F-002'
        WHEN unique_vehicle_id = 'VN1VF9001A0006003' THEN '51F-003'
        WHEN unique_vehicle_id = 'VN1VF9001A0006004' THEN '51F-004'
        ELSE license_plate
    END,
    fuel_efficiency = '180 kWh/100km',
    location = CASE 
        WHEN station_id = 2 THEN 'District 7 Station'
        WHEN station_id = 4 THEN 'District 3 Station'
        WHEN station_id = 6 THEN 'Binh Thanh Station'
        WHEN station_id = 8 THEN 'Phu Nhuan Station'
        ELSE location
    END
WHERE model_id = 'VF9';

-- Cập nhật tất cả xe Scooter (EVO200, EVO200LITE, EVOGRAND, EVOGRANDLITE, EVONEO, FELIZS, FELIZLITE)
UPDATE vehicles SET 
    image = CASE 
        WHEN model_id = 'EVO200' THEN 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png'
        WHEN model_id = 'EVO200LITE' THEN 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png'
        WHEN model_id = 'EVOGRAND' THEN 'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg'
        WHEN model_id = 'EVOGRANDLITE' THEN 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png'
        WHEN model_id = 'EVONEO' THEN 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp'
        WHEN model_id = 'FELIZS' THEN 'https://xedientruonghien.com/thumbs/575x575x2/upload/product/baq-8655.png'
        WHEN model_id = 'FELIZLITE' THEN 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
        ELSE image
    END,
    license_plate = CASE 
        WHEN model_id = 'EVO200' THEN '59A-' + CAST(vehicle_id AS VARCHAR)
        WHEN model_id = 'EVO200LITE' THEN '59B-' + CAST(vehicle_id AS VARCHAR)
        WHEN model_id = 'EVOGRAND' THEN '59C-' + CAST(vehicle_id AS VARCHAR)
        WHEN model_id = 'EVOGRANDLITE' THEN '59D-' + CAST(vehicle_id AS VARCHAR)
        WHEN model_id = 'EVONEO' THEN '59E-' + CAST(vehicle_id AS VARCHAR)
        WHEN model_id = 'FELIZS' THEN '59F-' + CAST(vehicle_id AS VARCHAR)
        WHEN model_id = 'FELIZLITE' THEN '59G-' + CAST(vehicle_id AS VARCHAR)
        ELSE license_plate
    END,
    fuel_efficiency = CASE 
        WHEN model_id = 'EVO200' THEN '35 kWh/100km'
        WHEN model_id = 'EVO200LITE' THEN '30 kWh/100km'
        WHEN model_id = 'EVOGRAND' THEN '38 kWh/100km'
        WHEN model_id = 'EVOGRANDLITE' THEN '36 kWh/100km'
        WHEN model_id = 'EVONEO' THEN '32 kWh/100km'
        WHEN model_id = 'FELIZS' THEN '28 kWh/100km'
        WHEN model_id = 'FELIZLITE' THEN '25 kWh/100km'
        ELSE fuel_efficiency
    END,
    location = CASE 
        WHEN station_id = 1 THEN 'District 1 Station'
        WHEN station_id = 2 THEN 'District 7 Station'
        WHEN station_id = 3 THEN 'Airport Station'
        WHEN station_id = 4 THEN 'District 3 Station'
        WHEN station_id = 5 THEN 'District 5 Station'
        WHEN station_id = 6 THEN 'Binh Thanh Station'
        WHEN station_id = 7 THEN 'Thu Duc Station'
        WHEN station_id = 8 THEN 'Phu Nhuan Station'
        ELSE location
    END
WHERE model_id IN ('EVO200', 'EVO200LITE', 'EVOGRAND', 'EVOGRANDLITE', 'EVONEO', 'FELIZS', 'FELIZLITE');

-- ============================================
-- BƯỚC 3: KIỂM TRA KẾT QUẢ
-- ============================================

-- Kiểm tra vehicle_models đã được cập nhật
SELECT 'VEHICLE MODELS UPDATED:' as Info;
SELECT model_id, brand, model_name, image, price_per_hour, price_per_day, max_range_km
FROM vehicle_models
WHERE image IS NOT NULL
ORDER BY model_id;

-- Kiểm tra vehicles đã được cập nhật
SELECT 'VEHICLES UPDATED:' as Info;
SELECT vehicle_id, model_id, unique_vehicle_id, license_plate, image, fuel_efficiency, location
FROM vehicles
WHERE image IS NOT NULL
ORDER BY vehicle_id;
