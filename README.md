*[Tiếng Việt](README.vi.md) | English*

# Văn Bản Hành Chính — Vietnamese Administrative Document Skill

An AI Agent skill that generates Vietnamese administrative documents (văn bản hành chính) in strict compliance with official government and Party formatting standards.

## Supported Standards

| Standard | Scope | Key Features |
|----------|-------|-------------|
| **Nghị định 30/2020/NĐ-CP** | Government administrative documents | 29 document types, Quốc hiệu & Tiêu ngữ header |
| **Hướng dẫn 36-HD/VPTW** | Communist Party of Vietnam documents | 33 document types, "ĐẢNG CỘNG SẢN VIỆT NAM" header |
| **Quyết định 4114/QĐ-BTC** | Ministry of Finance supplements | Additional formatting for financial documents |

## What This Skill Does

When a user asks an AI agent to create a Vietnamese administrative document, this skill provides the agent with:

- Exact formatting specifications (margins, fonts, sizes, positions) for every document component
- Ready-to-use docx-js code templates for the most common document types
- A command-line script for automated document generation
- Clear rules for the differences between government and Party document standards

The generated `.docx` files are production-ready — they match the official formatting that Vietnamese government agencies and Party organizations use in practice.

## Supported Document Types

### Government Documents (Văn bản nhà nước)

Công văn, Quyết định, Nghị quyết, Chỉ thị, Thông báo, Báo cáo, Tờ trình, Kế hoạch, Chương trình, Quy chế, Quy định, Hướng dẫn, Biên bản, Hợp đồng, Giấy mời, Giấy giới thiệu, Giấy ủy quyền, Giấy nghỉ phép, Thông cáo, Bản ghi nhớ, Bản thỏa thuận, Phương án, Đề án, Dự án, Công điện, Phiếu gửi, Phiếu chuyển, Phiếu báo, Thư công.

### Party Documents (Văn bản Đảng)

Nghị quyết, Chỉ thị, Quy định, Quy chế, Kết luận, Thông báo, Hướng dẫn, Công văn, Báo cáo, Quyết định, Kế hoạch, Chương trình, Thông tri, Quy trình, and others.

## Skill Structure

```
van-ban-hanh-chinh/
├── SKILL.md                              # Main instructions for the AI agent (English)
├── README.md                             # This file
├── references/
│   ├── nghi-dinh-30.md                   # Full NĐ 30/2020 formatting specs
│   ├── huong-dan-36.md                   # Full HD 36 Party document specs
│   └── mau-van-ban.md                    # docx-js code templates for each doc type
├── scripts/
│   └── create_vbhc.js                    # Automated document generator script
└── assets/
    ├── sample-cong-van.json              # Sample config: government công văn
    ├── sample-quyet-dinh.json            # Sample config: government quyết định
    └── sample-nghi-quyet-dang.json       # Sample config: Party nghị quyết
```

## How to Use

### With an AI Agent (Claude Code, Cowork, etc.)

Simply ask in Vietnamese:

- "Tạo công văn gửi Sở Giáo dục về việc triển khai kế hoạch năm học mới"
- "Soạn quyết định bổ nhiệm phó giám đốc"
- "Viết nghị quyết Đảng bộ về tăng cường công tác xây dựng Đảng"
- "Làm báo cáo kết quả thực hiện nhiệm vụ quý I"
- "Soạn tờ trình xin kinh phí tổ chức hội nghị"

The agent will read the relevant reference files, collect the necessary information from you, and generate a properly formatted `.docx` file.

### With the Command-Line Script

```bash
# Install dependency
npm install docx

# Generate a document from a config file
node scripts/create_vbhc.js --config assets/sample-cong-van.json --output cong-van.docx
```

See the `assets/` folder for sample configuration files.

## Key Formatting Differences at a Glance

| | Government (NĐ 30) | Party (HD 36) |
|---|---|---|
| Right header | CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM | ĐẢNG CỘNG SẢN VIỆT NAM |
| Left header | Tên cơ quan nhà nước | Tên tổ chức Đảng |
| Separator | Đường kẻ ngang | Dấu sao (*) |
| Code format | Số: 30/2020/NĐ-CP (slash) | Số: 36-HD/VPTW (hyphen) |
| Authority prefix | TM., KT., TL. (dot) | T/M, K/T, T/L (slash) |
| Margins | 20–25 / 30–35 / 15–20mm (ranges) | 20 / 30 / 15mm (fixed) |

## Technical Details

All documents use:
- **Paper**: A4 (210 × 297mm)
- **Font**: Times New Roman exclusively
- **Encoding**: TCVN 6909:2001 (Unicode)
- **Body text**: 13–14pt, justified, with 1.27cm first-line indent
- **Vietnamese diacritics**: All text uses proper dấu tiếng Việt

The formatting specifications in the reference files include both human-readable measurements (mm, pt) and the corresponding DXA values for direct use in docx-js code.

## Legal References

- [Nghị định 30/2020/NĐ-CP](https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=199378) — Về công tác văn thư (On clerical work)
- [Hướng dẫn 36-HD/VPTW](https://tulieuvankien.dangcongsan.vn/) — Hướng dẫn thể thức và kỹ thuật trình bày văn bản của Đảng (Guidelines on format and technical presentation of Party documents)
- [Quy định 66-QĐ/TW](https://tulieuvankien.dangcongsan.vn/) — Về thể loại, thẩm quyền ban hành và thể thức văn bản của Đảng (On document types, issuing authority, and format of Party documents)
