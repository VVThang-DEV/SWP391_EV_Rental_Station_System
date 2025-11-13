-- ============================================
-- Script cập nhật URL ảnh cho các xe trong database
-- ============================================

USE EV_Rental;
GO

-- ============================================
-- BƯỚC 1: CẬP NHẬT URL ẢNH CHO vehicle_models TRƯỚC
-- ============================================

-- VF3 (VinFast VF3 - Hatchback)
UPDATE vehicle_models 
SET image = 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png'
WHERE model_id = 'VF3' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF5 (VinFast VF5 - SUV)
UPDATE vehicle_models 
SET image = 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png'
WHERE model_id = 'VF5' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF6 (VinFast VF6 - Compact)
UPDATE vehicle_models 
SET image = 'https://oto-vinfastsaigon.com/wp-content/uploads/2024/11/mau-xe-vinfast-vf6-bang-mau-xe-vinfast-vf6-cap-nhat-chinh-hang-4fvtET.jpg.webp'
WHERE model_id = 'VF6' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF7 (VinFast VF7 - C-SUV)
UPDATE vehicle_models 
SET image = 'https://img.autocarindia.com/Features/VF7%20Rivals%20Web.jpg?w=700&c=1'
WHERE model_id = 'VF7' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF8 (VinFast VF8 - D-SUV)
UPDATE vehicle_models 
SET image = 'https://vinfastquangtri.vn/wp-content/uploads/2023/02/8-mau-VF8-scaled.jpg'
WHERE model_id = 'VF8' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF9 (VinFast VF9 - SUV)
UPDATE vehicle_models 
SET image = 'https://vinfast-timescity.com.vn/wp-content/uploads/2022/12/cap-nhat-bang-mau-xe-vinfast-vf9-2023-1_optimized.jpeg'
WHERE model_id = 'VF9' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVO200 (VinFast Evo200 - Scooter)
UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png'
WHERE model_id = 'EVO200' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVO200LITE (VinFast Evo200 Lite - Scooter)
UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png'
WHERE model_id = 'EVO200LITE' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVOGRAND (VinFast Evo Grand - Scooter)
UPDATE vehicle_models 
SET image = 'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg'
WHERE model_id = 'EVOGRAND' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVOGRANDLITE (VinFast Evo Grand Lite - Scooter)
UPDATE vehicle_models 
SET image = 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png'
WHERE model_id = 'EVOGRANDLITE' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVONEO (VinFast Evo Neo - Scooter)
UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp'
WHERE model_id = 'EVONEO' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- FELIZS (VinFast Feliz S - Scooter)
UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELIZS' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- FELIZLITE (VinFast Feliz Lite - Scooter)
UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELIZLITE' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- FELLIZS (Có thể có typo trong database)
UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELLIZS' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- FELLIZLITE (Có thể có typo trong database)
UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELLIZLITE' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- ============================================
-- BƯỚC 2: CẬP NHẬT URL ẢNH CHO vehicles
-- ============================================

-- VF3 (VinFast VF3 - Hatchback)
UPDATE vehicles 
SET image = 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png'
WHERE model_id = 'VF3' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF5 (VinFast VF5 - SUV)
UPDATE vehicles 
SET image = 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png'
WHERE model_id = 'VF5' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF6 (VinFast VF6 - Compact)
UPDATE vehicles 
SET image = 'https://oto-vinfastsaigon.com/wp-content/uploads/2024/11/mau-xe-vinfast-vf6-bang-mau-xe-vinfast-vf6-cap-nhat-chinh-hang-4fvtET.jpg.webp'
WHERE model_id = 'VF6' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF7 (VinFast VF7 - C-SUV)
UPDATE vehicles 
SET image = 'https://img.autocarindia.com/Features/VF7%20Rivals%20Web.jpg?w=700&c=1'
WHERE model_id = 'VF7' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF8 (VinFast VF8 - D-SUV)
UPDATE vehicles 
SET image = 'https://vinfastquangtri.vn/wp-content/uploads/2023/02/8-mau-VF8-scaled.jpg'
WHERE model_id = 'VF8' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- VF9 (VinFast VF9 - SUV)
UPDATE vehicles 
SET image = 'https://vinfast-timescity.com.vn/wp-content/uploads/2022/12/cap-nhat-bang-mau-xe-vinfast-vf9-2023-1_optimized.jpeg'
WHERE model_id = 'VF9' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVO200 (VinFast Evo200 - Scooter)
UPDATE vehicles 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png'
WHERE model_id = 'EVO200' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVO200LITE (VinFast Evo200 Lite - Scooter)
UPDATE vehicles 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png'
WHERE model_id = 'EVO200LITE' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVOGRAND (VinFast Evo Grand - Scooter)
UPDATE vehicles 
SET image = 'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg'
WHERE model_id = 'EVOGRAND' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVOGRANDLITE (VinFast Evo Grand Lite - Scooter)
UPDATE vehicles 
SET image = 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png'
WHERE model_id = 'EVOGRANDLITE' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- EVONEO (VinFast Evo Neo - Scooter)
UPDATE vehicles 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp'
WHERE model_id = 'EVONEO' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- FELIZS (VinFast Feliz S - Scooter)
UPDATE vehicles 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELIZS' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- FELIZLITE (VinFast Feliz Lite - Scooter)
UPDATE vehicles 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELIZLITE' AND (image IS NULL OR image = '' OR image LIKE '%...%' OR image LIKE '%://...%');

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================

-- Xem số lượng xe đã được cập nhật
SELECT 
    model_id,
    COUNT(*) as total_vehicles,
    SUM(CASE WHEN image IS NOT NULL AND image != '' AND image NOT LIKE '%...%' THEN 1 ELSE 0 END) as vehicles_with_valid_image,
    SUM(CASE WHEN image IS NULL OR image = '' OR image LIKE '%...%' THEN 1 ELSE 0 END) as vehicles_with_invalid_image
FROM vehicles
GROUP BY model_id
ORDER BY model_id;

-- Xem các xe còn thiếu ảnh hoặc có URL không hợp lệ
SELECT 
    vehicle_id,
    model_id,
    unique_vehicle_id,
    image,
    CASE 
        WHEN image IS NULL OR image = '' THEN 'Empty'
        WHEN image LIKE '%...%' THEN 'Invalid URL (contains ...)'
        ELSE 'Valid'
    END as image_status
FROM vehicles
WHERE image IS NULL OR image = '' OR image LIKE '%...%'
ORDER BY model_id, vehicle_id;

-- Kiểm tra vehicle_models
SELECT 
    model_id,
    image,
    CASE 
        WHEN image IS NULL OR image = '' THEN 'Empty'
        WHEN image LIKE '%...%' THEN 'Invalid URL (contains ...)'
        ELSE 'Valid'
    END as image_status
FROM vehicle_models
ORDER BY model_id;

GO

