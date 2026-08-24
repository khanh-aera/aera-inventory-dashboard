# AERA Inventory Dashboard

Dashboard trực quan cho kho hàng AERA — bảng + biểu đồ theo brand guideline (Persian Blue #0038BC × Platinum #EEEEEE, font Montserrat).

**Live:** https://khanh-aera.github.io/aera-inventory-dashboard/

## Tính năng
- Thẻ tổng quan: tổng vật tư / đủ kho / sắp hết / nguy cấp
- Biểu đồ doughnut: stock theo category + tình trạng kho (OK/LOW/CRITICAL/UNUSED)
- Biểu đồ bar ngang: Stock vs Alert level (Filament & Component)
- Bảng chi tiết 37 vật tư với filter theo category, thanh mức độ, badge trạng thái
- Sort theo cột (click header), responsive mobile-first

## Cập nhật dữ liệu
Dữ liệu nhúng trực tiếp trong `index.html` (const DATA). Khi kho thay đổi, cập nhật lại mảng DATA này từ `inventory.csv`.

---
AERA · Organic Modernism