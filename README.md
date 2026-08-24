# AERA Inventory Dashboard

Dashboard kho hàng AERA — brand guideline: Persian Blue #0038BC × Platinum #EEEEEE, Montserrat.

**Live:** https://khanh-aera.github.io/aera-inventory-dashboard/

## Kiến trúc (data tách khỏi UI)
- `index.html` — UI tĩnh: stats cards, 2 doughnut charts, bar chart stock-vs-alert, bảng filter category. KHÔNG chứa dữ liệu.
- `inventory.json` — DUY NHẤT file cần cập nhật khi kho thay đổi.
- `update_dashboard.py` (chạy local) — đọc `inventory.csv` → sinh `inventory.json` → push lên repo qua GitHub API. Zero-token.
