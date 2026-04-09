*Tiếng Việt | [English](README.md)*

# Văn Bản Hành Chính — Skill Tạo Văn Bản Hành Chính Việt Nam

Một AI Agent skill giúp tạo văn bản hành chính Việt Nam tuân thủ chặt chẽ các quy chuẩn trình bày chính thức của Nhà nước và Đảng.

## Tiêu Chuẩn Hỗ Trợ

| Tiêu chuẩn | Phạm vi | Đặc điểm chính |
|------------|---------|----------------|
| **Nghị định 30/2020/NĐ-CP** | Văn bản hành chính nhà nước | 29 loại văn bản, header Quốc hiệu & Tiêu ngữ |
| **Hướng dẫn 36-HD/VPTW** | Văn bản của Đảng Cộng sản Việt Nam | 33 loại văn bản, header "ĐẢNG CỘNG SẢN VIỆT NAM" |
| **Quyết định 4114/QĐ-BTC** | Văn bản Bộ Tài chính (bổ sung NĐ 30) | Quy chuẩn bổ sung cho văn bản tài chính |

## Skill Này Làm Gì

Khi người dùng yêu cầu AI agent tạo văn bản hành chính Việt Nam, skill này cung cấp cho agent:

- Thông số trình bày chính xác (căn lề, font, cỡ chữ, vị trí) cho từng thành phần văn bản
- Mã nguồn docx-js sẵn dùng cho các loại văn bản phổ biến nhất
- Script dòng lệnh để tự động tạo văn bản
- Quy tắc rõ ràng về sự khác biệt giữa tiêu chuẩn văn bản nhà nước và văn bản Đảng

File `.docx` được tạo ra sẵn sàng sử dụng — đúng theo định dạng chính thức mà các cơ quan nhà nước và tổ chức Đảng Việt Nam đang dùng trong thực tế.

## Các Loại Văn Bản Hỗ Trợ

### Văn bản nhà nước (29 loại theo NĐ 30/2020)

Công văn, Quyết định, Nghị quyết, Chỉ thị, Thông báo, Báo cáo, Tờ trình, Kế hoạch, Chương trình, Quy chế, Quy định, Hướng dẫn, Biên bản, Hợp đồng, Giấy mời, Giấy giới thiệu, Giấy ủy quyền, Giấy nghỉ phép, Thông cáo, Bản ghi nhớ, Bản thỏa thuận, Phương án, Đề án, Dự án, Công điện, Phiếu gửi, Phiếu chuyển, Phiếu báo, Thư công.

### Văn bản Đảng (33 loại theo HD 36)

Nghị quyết, Chỉ thị, Quy định, Quy chế, Kết luận, Thông báo, Hướng dẫn, Công văn, Báo cáo, Quyết định, Kế hoạch, Chương trình, Thông tri, Quy trình và các loại khác.

## Cấu Trúc Skill

```
van-ban-hanh-chinh/
├── SKILL.md                              # Hướng dẫn chính cho AI agent (tiếng Anh)
├── README.md                             # Giới thiệu tiếng Anh
├── README.vi.md                          # Giới thiệu tiếng Việt (file này)
├── references/
│   ├── nghi-dinh-30.md                   # Quy chuẩn NĐ 30/2020 đầy đủ
│   ├── huong-dan-36.md                   # Quy chuẩn HD 36 văn bản Đảng đầy đủ
│   └── mau-van-ban.md                    # Mã nguồn docx-js mẫu cho từng loại VB
├── scripts/
│   └── create_vbhc.js                    # Script tự động tạo văn bản
└── assets/
    ├── sample-cong-van.json              # Cấu hình mẫu: công văn nhà nước
    ├── sample-quyet-dinh.json            # Cấu hình mẫu: quyết định nhà nước
    └── sample-nghi-quyet-dang.json       # Cấu hình mẫu: nghị quyết Đảng
```

## Cách Sử Dụng

### Với AI Agent (Claude Code, Cowork, v.v.)

Chỉ cần nói bằng tiếng Việt:

- "Tạo công văn gửi Sở Giáo dục về việc triển khai kế hoạch năm học mới"
- "Soạn quyết định bổ nhiệm phó giám đốc"
- "Viết nghị quyết Đảng bộ về tăng cường công tác xây dựng Đảng"
- "Làm báo cáo kết quả thực hiện nhiệm vụ quý I"
- "Soạn tờ trình xin kinh phí tổ chức hội nghị"

Agent sẽ đọc các file tham chiếu tương ứng, thu thập thông tin cần thiết từ bạn, và tạo file `.docx` đúng chuẩn.

### Với Script Dòng Lệnh

```bash
# Cài đặt thư viện
npm install docx

# Tạo văn bản từ file cấu hình
node scripts/create_vbhc.js --config assets/sample-cong-van.json --output cong-van.docx
```

Xem thư mục `assets/` để tham khảo các file cấu hình mẫu.

## So Sánh Nhanh Hai Hệ Tiêu Chuẩn

| | Nhà nước (NĐ 30) | Đảng (HD 36) |
|---|---|---|
| Header phải | CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM | ĐẢNG CỘNG SẢN VIỆT NAM |
| Header trái | Tên cơ quan nhà nước | Tên tổ chức Đảng |
| Ngăn cách | Đường kẻ ngang | Dấu sao (*) |
| Ký hiệu | Số: 30/2020/NĐ-CP (dấu gạch chéo) | Số: 36-HD/VPTW (dấu gạch ngang) |
| Quyền hạn | TM., KT., TL. (dấu chấm) | T/M, K/T, T/L (dấu gạch chéo) |
| Căn lề | 20–25 / 30–35 / 15–20mm (khoảng) | 20 / 30 / 15mm (cố định) |

## Thông Số Kỹ Thuật

Tất cả văn bản sử dụng:

- **Giấy**: A4 (210 × 297mm)
- **Font**: Times New Roman (duy nhất)
- **Bảng mã**: TCVN 6909:2001 (Unicode)
- **Cỡ chữ nội dung**: 13–14pt, căn đều hai bên, thụt đầu dòng 1,27cm
- **Tiếng Việt**: Toàn bộ văn bản sử dụng đầy đủ dấu tiếng Việt

Các thông số trình bày trong file tham chiếu bao gồm cả đơn vị đo thông thường (mm, pt) và giá trị DXA tương ứng để dùng trực tiếp trong mã docx-js.

## Tham Chiếu Pháp Lý

- [Nghị định 30/2020/NĐ-CP](https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=199378) — Về công tác văn thư
- [Hướng dẫn 36-HD/VPTW](https://tulieuvankien.dangcongsan.vn/) — Hướng dẫn thể thức và kỹ thuật trình bày văn bản của Đảng
- [Quy định 66-QĐ/TW](https://tulieuvankien.dangcongsan.vn/) — Về thể loại, thẩm quyền ban hành và thể thức văn bản của Đảng
