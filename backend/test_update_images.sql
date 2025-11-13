-- ============================================
-- Script TEST - Kiểm tra và cập nhật URL ảnh
-- ============================================

USE EVRentalDB;
GO

-- Kiểm tra URL hiện tại trong vehicle_models
PRINT '=== URL HIỆN TẠI TRONG vehicle_models ===';
SELECT model_id, image 
FROM vehicle_models 
ORDER BY model_id;

-- Test UPDATE một model trước
PRINT '';
PRINT '=== TEST UPDATE VF3 ===';
UPDATE vehicle_models 
SET image = 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png'
WHERE model_id = 'VF3';

-- Kiểm tra kết quả
SELECT model_id, image 
FROM vehicle_models 
WHERE model_id = 'VF3';

-- Nếu VF3 đã update thành công, tiếp tục update các model khác
PRINT '';
PRINT '=== UPDATE TẤT CẢ vehicle_models ===';

UPDATE vehicle_models 
SET image = 'https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png'
WHERE model_id = 'VF3';

UPDATE vehicle_models 
SET image = 'https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png'
WHERE model_id = 'VF5';

UPDATE vehicle_models 
SET image = 'https://oto-vinfastsaigon.com/wp-content/uploads/2024/11/mau-xe-vinfast-vf6-bang-mau-xe-vinfast-vf6-cap-nhat-chinh-hang-4fvtET.jpg.webp'
WHERE model_id = 'VF6';

UPDATE vehicle_models 
SET image = 'https://img.autocarindia.com/Features/VF7%20Rivals%20Web.jpg?w=700&c=1'
WHERE model_id = 'VF7';

UPDATE vehicle_models 
SET image = 'https://vinfastquangtri.vn/wp-content/uploads/2023/02/8-mau-VF8-scaled.jpg'
WHERE model_id = 'VF8';

UPDATE vehicle_models 
SET image = 'https://vinfast-timescity.com.vn/wp-content/uploads/2022/12/cap-nhat-bang-mau-xe-vinfast-vf9-2023-1_optimized.jpeg'
WHERE model_id = 'VF9';

UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png'
WHERE model_id = 'EVO200';

UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png'
WHERE model_id = 'EVO200LITE';

UPDATE vehicle_models 
SET image = 'https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg'
WHERE model_id = 'EVOGRAND';

UPDATE vehicle_models 
SET image = 'https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png'
WHERE model_id = 'EVOGRANDLITE';

UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp'
WHERE model_id = 'EVONEO';

UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELIZS';

UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELIZLITE';

UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELLIZS';

UPDATE vehicle_models 
SET image = 'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp'
WHERE model_id = 'FELLIZLITE';

-- Kiểm tra kết quả sau khi update
PRINT '';
PRINT '=== URL SAU KHI UPDATE ===';
SELECT model_id, image 
FROM vehicle_models 
ORDER BY model_id;

-- Cập nhật vehicles dựa trên vehicle_models
PRINT '';
PRINT '=== CẬP NHẬT vehicles TỪ vehicle_models ===';
UPDATE v
SET v.image = vm.image
FROM vehicles v
INNER JOIN vehicle_models vm ON v.model_id = vm.model_id
WHERE v.image IS NULL 
   OR v.image = '' 
   OR v.image LIKE '%...%'
   OR v.image NOT LIKE 'http%://%';

PRINT 'Đã cập nhật ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' xe';

GO

