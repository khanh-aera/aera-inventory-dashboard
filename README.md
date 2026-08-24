# AERA Inventory Dashboard

Dashboard kho hàng AERA — brand guideline: Persian Blue #0038BC × Platinum #EEEEEE, Montserrat.

**Live:** https://khanh-aera.github.io/aera-inventory-dashboard/

## Trang
- `index.html` — Tổng quan: stats, charts, **linh kiện theo từng dòng đèn đang bán** (FLORIA / FLORIA PRO / STRATA), bảng toàn kho (không hiện alert level).
- `filaments.html` — Trang riêng cho Filament: swatch đúng màu thương hiệu (Bambu Lab / Tinmorry / R3D) + card tồn kho + chart kg.
- `inventory.json` — DUY NHẤT file cập nhật khi kho đổi.
- `update_dashboard.py` (local) — CSV → JSON → push. Zero-token.

## Màu filament (tham khảo hãng)
Bambu Lab: Milky #EAE6DC · Persian Blue #274FD0 · Desert Tan #C7A57B · Dark Blue #1F2A44
Tinmorry: Olive Green #626846 · Navy Blue #394157
R3D: Clear #CFE3EE · Burnt Orange #D46C34 · Matte Red #B03A3A
