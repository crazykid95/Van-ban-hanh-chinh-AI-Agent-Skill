*Tiếng Việt | [English](README.md)*

# Văn Bản Hành Chính AI Agent Skill

AI agent skill giúp soạn văn bản hành chính Việt Nam đúng chuẩn Nghị định 30/2020/NĐ-CP (nhà nước), Hướng dẫn 36-HD/VPTW (Đảng), và Quyết định 4114/QĐ-BTC (Bộ Tài chính).

File `.docx` đầu ra được trình bày đúng cách một chuyên viên văn phòng sẽ tạo thủ công trong Microsoft Word — bố cục bằng bảng ẩn viền, heading đúng chức năng, gạch chân bằng border có thể chỉnh độ dài, đánh số đúng kiểu — nên người nhận có thể mở file trong Word và chỉnh sửa tiếp mà không bị vỡ format.


## Yêu cầu

### Cài gói docx

Dùng NPM để cài đặt gói thư viện docx. Các AI Agent như Claude sẽ dùng docx để làm việc với các file docx:

```bash
npm install docx
```


## Cài Đặt

### Claude Desktop (Cowork)

Mở **Customize** ở thanh bên trái, bấm **"+"**, chọn file zip `van-ban-hanh-chinh` (Download repo này về dưới dạng file zip). Skill sẽ xuất hiện trong danh sách và có thể bật/tắt tùy ý.


### Claude Code

Copy thư mục skill vào một trong hai vị trí:

```bash
# Dùng được cho mọi project
cp -r van-ban-hanh-chinh ~/.claude/skills/

# Hoặc gắn với một project cụ thể
cp -r van-ban-hanh-chinh .claude/skills/
```

### Cursor / Windsurf / Agent khác

Hầu hết các agent hỗ trợ chuẩn [Agent Skills](https://agentskills.io) đều đọc được. Đặt thư mục vào nơi agent tìm custom instructions — thường là `~/.one-skills/skills/` hoặc tương đương. Yêu cầu duy nhất là `SKILL.md` nằm ở gốc thư mục.

## Skill Này Làm Gì

Bạn yêu cầu bằng tiếng Việt — "Tạo công văn gửi Sở Giáo dục về việc triển khai kế hoạch năm học mới" — agent sẽ tạo file `.docx` với:

- Đúng khổ A4, căn lề, font Times New Roman toàn bộ
- Header bố cục 2 cột bằng bảng ẩn viền (tên cơ quan bên trái, quốc hiệu bên phải)
- Gạch chân dưới tiêu ngữ và tên cơ quan bằng bottom border đúng kích thước, chỉnh được trong Word
- Nội dung căn đều hai bên, thụt đầu dòng 1,27cm, giãn dòng đúng quy cách
- Khối chữ ký và nơi nhận bố cục bằng bảng 2 cột ở cuối văn bản

Hỗ trợ 29 loại văn bản nhà nước (công văn, quyết định, tờ trình, báo cáo, thông báo, kế hoạch, biên bản, giấy mời, v.v.) và 33 loại văn bản Đảng (nghị quyết, chỉ thị, kết luận, thông báo, hướng dẫn, v.v.).

## Dùng Độc Lập (Không Cần AI Agent)

Script `scripts/create_vbhc.js` có thể được chạy riêng trực tiếp:

```bash
npm install docx
node scripts/create_vbhc.js --config assets/sample-cong-van.json --output cong-van.docx
```

Thư mục `assets/` có sẵn file cấu hình mẫu cho công văn, quyết định, và nghị quyết Đảng.

## So Sánh Nhanh Văn Bản Nhà Nước và Đảng

| | Nhà nước (NĐ 30) | Đảng (HD 36) |
|---|---|---|
| Header phải | CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM | ĐẢNG CỘNG SẢN VIỆT NAM |
| Ngăn cách | Gạch chân dưới tên cơ quan | Dấu sao (*) |
| Ký hiệu | `Số: 30/2020/NĐ-CP` (gạch chéo) | `Số: 36-HD/VPTW` (gạch ngang) |
| Quyền hạn | TM., KT., TL. | T/M, K/T, T/L |
| Căn lề | 20–25 / 30–35 / 15–20mm | 20 / 30 / 15mm (cố định) |

## Cấu Trúc Dự Án

```
van-ban-hanh-chinh/
├── SKILL.md                    # Hướng dẫn cho agent (tiếng Anh)
├── README.md                   # Giới thiệu tiếng Anh
├── README.vi.md                # Giới thiệu tiếng Việt (file này)
├── references/
│   ├── nghi-dinh-30.md         # Quy chuẩn NĐ 30/2020
│   ├── huong-dan-36.md         # Quy chuẩn HD 36 văn bản Đảng
│   └── mau-van-ban.md          # Mẫu code docx-js cho từng loại văn bản
├── scripts/
│   └── create_vbhc.js          # Script tạo văn bản qua dòng lệnh
└── assets/
    ├── sample-cong-van.json
    ├── sample-quyet-dinh.json
    └── sample-nghi-quyet-dang.json
```

## Tham Chiếu Pháp Lý

- [Nghị định 30/2020/NĐ-CP](https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=199378) — Về công tác văn thư
- [Hướng dẫn 36-HD/VPTW](https://tulieuvankien.dangcongsan.vn/) — Thể thức và kỹ thuật trình bày văn bản của Đảng
- [Quy định 66-QĐ/TW](https://tulieuvankien.dangcongsan.vn/) — Thể loại, thẩm quyền ban hành và thể thức văn bản của Đảng
