# Danh sách URL ảnh cho các model xe

## Xe Ô tô (Cars)

### VF3 (Hatchback)
```
https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Xam-min.png
```

### VF5 (SUV)
```
https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf5-grey.png
```

### VF6 (Compact)
```
https://oto-vinfastsaigon.com/wp-content/uploads/2024/11/mau-xe-vinfast-vf6-bang-mau-xe-vinfast-vf6-cap-nhat-chinh-hang-4fvtET.jpg.webp
```

### VF7 (C-SUV)
```
https://img.autocarindia.com/Features/VF7%20Rivals%20Web.jpg?w=700&c=1
```

### VF8 (D-SUV)
```
https://vinfastquangtri.vn/wp-content/uploads/2023/02/8-mau-VF8-scaled.jpg
```

### VF9 (SUV)
```
https://vinfast-timescity.com.vn/wp-content/uploads/2022/12/cap-nhat-bang-mau-xe-vinfast-vf9-2023-1_optimized.jpeg
```

## Xe Máy Điện (Scooters)

### EVO200
```
https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dwb91ce4b4/images/PDP-XMD/evo200/img-evo-black.png
```

### EVO200LITE
```
https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw5be43aa7/images/PDP-XMD/evo200-lite/img-evo-black.png
```

### EVOGRAND
```
https://cmu-cdn.vinfast.vn/2025/07/d01a1048-evogrand2.jpg
```

### EVOGRANDLITE
```
https://vfxanh.vn/wp-content/uploads/2025/07/evo-grand-lite-4.png
```

### EVONEO
```
https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0e183635/images/PDP-XMD/evoliteneo/img-top-evoliteneo-red-sp.webp
```

### FELIZS
```
https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp
```

### FELIZLITE
```
https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw4afac7d9/images/PDP-XMD/felizs/img-top-felizs-white-sp.webp
```

## Cách sử dụng

1. **Chạy script SQL tự động:**
   ```sql
   -- Chạy file: backend/update_vehicle_image_urls.sql
   ```

2. **Hoặc cập nhật thủ công từng xe:**
   ```sql
   UPDATE vehicles 
   SET image = 'URL_ẢNH_Ở_ĐÂY'
   WHERE vehicle_id = ID_XE;
   ```

3. **Kiểm tra kết quả:**
   ```sql
   SELECT vehicle_id, model_id, image 
   FROM vehicles 
   WHERE image IS NOT NULL AND image != '';
   ```

