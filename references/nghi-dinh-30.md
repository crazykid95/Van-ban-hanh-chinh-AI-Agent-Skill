# Government Administrative Document Standards
# Per Nghị định 30/2020/NĐ-CP and Quyết định 4114/QĐ-BTC

## Table of Contents

1. [Page Setup](#1-page-setup)
2. [Document Components](#2-document-components)
3. [Component Details](#3-component-details)
4. [Numbering and Coding Conventions](#4-numbering-and-coding-conventions)
5. [Capitalization Rules](#5-capitalization-rules)
6. [Page Layout Diagram](#6-page-layout-diagram)
7. [docx-js Technical Parameters](#7-docx-js-technical-parameters)

---

## 1. Page Setup

| Parameter | Value | DXA (docx-js) |
|-----------|-------|---------------|
| Paper size | A4 (210 × 297mm) | width: 11906, height: 16838 |
| Top margin | 20mm (standard) – 25mm (max) | 1134 – 1417 |
| Bottom margin | 20mm – 25mm | 1134 – 1417 |
| Left margin | 30mm (standard) – 35mm (max) | 1701 – 1984 |
| Right margin | 15mm (standard) – 20mm (max) | 850 – 1134 |
| Font | Times New Roman | "Times New Roman" |
| Encoding | TCVN 6909:2001 (Unicode) | — |
| Text color | Black | "000000" |
| Line spacing | Min single, max 1.5 lines | line: 276 (1.15) |
| Paragraph spacing | Min 6pt before each paragraph | before: 120, after: 0 |
| First line indent | 1cm or 1.27cm | indent: { firstLine: 567 } or 720 |
| Alignment | Justified both margins | AlignmentType.JUSTIFIED |

**Unit conversion**: 1mm = 56.7 DXA; 1cm = 567 DXA; 1 inch = 1440 DXA; 1pt = 20 twip (half-point)

**Recommended standard values**:
- Top margin: 20mm (1134 DXA)
- Bottom margin: 20mm (1134 DXA)
- Left margin: 30mm (1701 DXA)
- Right margin: 15mm (850 DXA)
- Body text size: 13pt

---

## 2. Document Components

Per Article 8 of Nghị định 30/2020, an administrative document consists of these components (top to bottom):

### Mandatory components:
1. Quốc hiệu và Tiêu ngữ (National emblem and motto)
2. Tên cơ quan, tổ chức ban hành (Issuing authority name)
3. Số và ký hiệu văn bản (Document number and code)
4. Địa danh và thời gian ban hành (Place and date of issue)
5. Tên loại và trích yếu nội dung (Document type and summary)
6. Nội dung văn bản (Document content/body)
7. Chức vụ, họ tên người ký (Signatory title and name)
8. Dấu, chữ ký số của cơ quan (Seal and digital signature)
9. Nơi nhận (Recipients)

### Optional components (when needed):
10. Dấu chỉ độ mật (Confidentiality mark)
11. Dấu chỉ mức độ khẩn (Urgency mark)
12. Chỉ dẫn về phạm vi lưu hành (Circulation scope)
13. Ký hiệu người soạn thảo và số lượng bản (Drafter code and copy count)
14. Địa chỉ cơ quan, điện thoại, fax, email, website (Organization contact info)
15. Phụ lục (Appendices)

---

## 3. Component Details

### 3.1. QUỐC HIỆU VÀ TIÊU NGỮ (National emblem and motto — top right)

```
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                        Độc lập - Tự do - Hạnh phúc
                        ─────────────────────────────
```

| Element | Specification |
|---------|--------------|
| Line 1 — Quốc hiệu | "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" |
| Font size | 12–13pt |
| Style | ALL CAPS, bold, upright |
| Position | Centered on the right half |
| Line 2 — Tiêu ngữ | "Độc lập - Tự do - Hạnh phúc" |
| Font size | 13–14pt |
| Style | Title case (capitalize first letter of each phrase), bold, upright |
| Hyphens | Hyphen (-) between phrases |
| Underline | Horizontal rule below, same width as the motto text |
| Gap | NO blank line between Quốc hiệu and Tiêu ngữ |

### 3.2. TÊN CƠ QUAN BAN HÀNH (Issuing authority — top left)

```
CƠ QUAN CHỦ QUẢN (nếu có)
TÊN CƠ QUAN BAN HÀNH
        ────
```

| Element | Specification |
|---------|--------------|
| Line 1 — Parent authority | Name of the direct superior authority (if any) |
| Font size | 12–13pt |
| Style | ALL CAPS, upright, NOT bold |
| Line 2 — Issuing authority | Name of the authority directly issuing the document |
| Font size | 12–13pt |
| Style | ALL CAPS, **bold**, upright |
| Underline | Horizontal rule below, 1/3 to 1/2 of the authority name width |
| Position | Centered on the left half |
| Gap | NO blank line between parent and issuing authority |

### 3.3. SỐ VÀ KÝ HIỆU VĂN BẢN (Document number and code)

| Element | Specification |
|---------|--------------|
| Position | Below the issuing authority name, centered on the left half |
| Font size | 13pt |
| Style | Upright, regular |
| Format | `Số: .../[Abbreviation of doc type]-[Abbreviation of authority]` |

**Code formula by document category**:
- Regulatory documents: `Số: XX/YYYY/[Loại VB]-[Cơ quan]`
  Example: `Số: 30/2020/NĐ-CP` (Nghị định số 30 năm 2020 của Chính phủ)
- Administrative documents: `Số: XX/[Loại VB]-[Cơ quan]`
  Example: `Số: 156/QĐ-UBND` (Quyết định số 156 của UBND)
- Official letters (công văn): `Số: XX/[Cơ quan]-[Đơn vị soạn thảo]`
  Example: `Số: 1234/BGDĐT-VP` (Công văn số 1234 của Bộ GD&ĐT, Văn phòng soạn)

**Document type abbreviations**:
| Loại văn bản | Viết tắt | English |
|-------------|----------|---------|
| Nghị quyết | NQ | Resolution |
| Quyết định | QĐ | Decision |
| Chỉ thị | CT | Directive |
| Quy chế | QCh | Regulation/Charter |
| Quy định | QyĐ | Rule/Provision |
| Thông báo | TB | Notice |
| Hướng dẫn | HD | Guideline |
| Chương trình | CTr | Program |
| Kế hoạch | KH | Plan |
| Phương án | PA | Proposal |
| Đề án | ĐA | Scheme |
| Dự án | DAn | Project |
| Báo cáo | BC | Report |
| Biên bản | BB | Minutes |
| Tờ trình | TTr | Submission/Petition |
| Hợp đồng | HĐ | Contract |
| Công văn | *(none)* | Official letter |
| Công điện | CĐ | Telegram |
| Giấy ủy quyền | GUQ | Power of attorney |
| Giấy mời | GM | Invitation |
| Giấy giới thiệu | GGT | Introduction letter |
| Giấy nghỉ phép | GNP | Leave certificate |
| Phiếu gửi | PG | Transmittal slip |
| Phiếu chuyển | PC | Transfer slip |
| Thông cáo | TC | Communiqué |
| Bản ghi nhớ | BGN | Memorandum |
| Bản thỏa thuận | BTT | Agreement |
| Thư công | *(none)* | Official letter (formal) |

### 3.4. ĐỊA DANH VÀ THỜI GIAN BAN HÀNH (Place and date of issue)

| Element | Specification |
|---------|--------------|
| Position | Below the Quốc hiệu and Tiêu ngữ, centered on the right half |
| Font size | 13–14pt |
| Style | *Italic*, upright |
| Format | "Địa danh, ngày ... tháng ... năm ..." |

**Place name rules (Địa danh)**:
- Central level: "Hà Nội" (not "Thành phố Hà Nội")
- Directly-governed cities: City name (e.g., "Hà Nội", "TP. Hồ Chí Minh")
- Provinces: Province name (e.g., "Nghệ An", "Quảng Ninh")
- Districts: Include province/city (e.g., "Quận 1, TP. Hồ Chí Minh")

**Date formatting rules**:
- Days 1–9: add leading zero (01, 02, ..., 09)
- Months 1–2: add leading zero (01, 02)
- Months 3–12: write normally
- Year: full 4 digits
- Example: *Hà Nội, ngày 05 tháng 03 năm 2024*

### 3.5. TÊN LOẠI VĂN BẢN VÀ TRÍCH YẾU (Document type and summary)

**Document type name (Tên loại văn bản)**:
| Element | Specification |
|---------|--------------|
| Position | Centered on the page, below the date line |
| Font size | 13–14pt |
| Style | ALL CAPS, **bold**, upright |
| Examples | "QUYẾT ĐỊNH", "BÁO CÁO", "TỜ TRÌNH" |

**Content summary (Trích yếu nội dung)**:
| Element | Specification |
|---------|--------------|
| Position | Centered, immediately below the document type |
| Font size | 13–14pt |
| Style | **Bold**, upright |
| Underline | Horizontal rule below, 1/3 to 1/2 of the summary width |

**Exception for Công văn**: The summary appears on the same line as the document number:
```
Số: 1234/BGDĐT-VP                    Hà Nội, ngày 05 tháng 03 năm 2024
V/v triển khai kế hoạch năm học mới
```

| Element | Specification |
|---------|--------------|
| Prefix | "V/v" (Về việc — Regarding) |
| Font size | 12–13pt |
| Style | Upright, NOT bold |
| Position | Below the document number, centered on the left half |

### 3.6. NỘI DUNG VĂN BẢN (Document body)

| Element | Specification |
|---------|--------------|
| Font size | 13–14pt (standard: 13pt) |
| Style | Upright, NOT bold |
| Alignment | Justified both margins |
| First line indent | 1cm – 1.27cm for every new paragraph |
| Line spacing | Min single, max 1.5 |
| Paragraph spacing | Min 6pt before |

**Outline numbering for structured documents**:

Documents with Parts, Chapters, Sections, Articles:
```
Phần I
TIÊU ĐỀ PHẦN

Chương I
TIÊU ĐỀ CHƯƠNG

Mục 1. Tiêu đề mục

Điều 1. Tiêu đề điều
1. Nội dung khoản
a) Nội dung điểm
- Nội dung tiết
```

Documents with major/minor headings:
```
I. TIÊU ĐỀ MỤC I (ALL CAPS, bold)
1. Nội dung mục 1 (lowercase, bold)
a) Nội dung điểm a (lowercase, regular)
- Nội dung gạch đầu dòng (lowercase, regular)
```

### 3.7. CHỨC VỤ, HỌ TÊN NGƯỜI KÝ VÀ CHỮ KÝ (Signatory block — bottom right)

| Element | Specification |
|---------|--------------|
| Position | Bottom right corner, below document body |
| Authority prefix | "TM." (Thay mặt), "KT." (Ký thay), "TL." (Thừa lệnh), "Q." (Quyền) |
| Font size (prefix) | 13–14pt, ALL CAPS, bold |
| Position title | Below the authority prefix |
| Font size (title) | 13–14pt, ALL CAPS, bold |
| Full name | Below the signature space |
| Font size (name) | 13–14pt, bold |
| Spacing | Blank space between title and name for the handwritten signature |

**Examples**:
```
                                        TM. ỦY BAN NHÂN DÂN
                                              CHỦ TỊCH
                                           (Chữ ký, dấu)
                                          Nguyễn Văn A
```

```
                                        KT. GIÁM ĐỐC
                                        PHÓ GIÁM ĐỐC
                                           (Chữ ký)
                                         Trần Văn B
```

### 3.8. NƠI NHẬN (Recipients — bottom left)

| Element | Specification |
|---------|--------------|
| Position | Bottom left corner, same row as the signatory block |
| Label "Nơi nhận:" | 12pt, **bold**, *italic* |
| Recipient list | 11pt, upright, regular |
| Line prefix | Hyphen (-) before each recipient |
| Final line | "- Lưu: VT, [đơn vị soạn thảo]. [Số bản]" |

**Example**:
```
Nơi nhận:
- Như trên;
- UBND tỉnh (để báo cáo);
- Các đơn vị trực thuộc;
- Lưu: VT, VP. 20b.
```

**Exception for Công văn** — "Kính gửi:" replaces the in-body recipient section:

| Element | Specification |
|---------|--------------|
| Position | Above the body text, centered |
| Font size | 13pt |
| Style | Upright |
| Single recipient | On the same line as "Kính gửi:" |
| Multiple recipients | New line for each, with hyphen prefix |

### 3.9. DẤU CHỈ ĐỘ MẬT VÀ MỨC ĐỘ KHẨN (Confidentiality and urgency marks)

**Confidentiality** (top left, below document number):
- "MẬT" — ALL CAPS, bold, 13–14pt, enclosed in a border
- "TỐI MẬT" — same formatting
- "TUYỆT MẬT" — same formatting

**Urgency** (top left, below confidentiality mark or document number):
- "KHẨN" — ALL CAPS, bold, 13–14pt, enclosed in a border
- "THƯỢNG KHẨN" — same formatting
- "HỎA TỐC" — same formatting

### 3.10. SỐ TRANG (Page numbering)

| Element | Specification |
|---------|--------------|
| Position | Centered, in the top margin |
| Font size | 13–14pt |
| Style | Regular, upright |
| Start | From page 2 onwards (page 1 has no number) |
| Format | Arabic numerals (2, 3, 4...) |

### 3.11. PHỤ LỤC (Appendices)

| Element | Specification |
|---------|--------------|
| Heading | "PHỤ LỤC" + ordinal number (if multiple appendices) |
| Font size (heading) | 13–14pt, ALL CAPS, bold |
| Appendix title | Below heading, 13–14pt, bold |
| Cross-reference | "(Kèm theo [Loại VB] số .../... ngày ... tháng ... năm ... của [Cơ quan])" |
| Font size (reference) | 13pt, *italic* |

---

## 4. Numbering and Coding Conventions

### Document numbering
- Numbered sequentially per document type
- Resets to 01 each year (January 1)
- Continues through the year (to December 31)
- Arabic numerals only

### Document code formulas
| Category | Formula | Example |
|----------|---------|---------|
| Regulatory | Số/Năm/Loại VB-Cơ quan | 30/2020/NĐ-CP |
| Administrative | Số/Loại VB-Cơ quan | 156/QĐ-UBND |
| Official letter | Số/Cơ quan-Đơn vị | 1234/BGDĐT-VP |

---

## 5. Capitalization Rules

### Capitalize the first letter of a sentence
- After a period (.)
- At the start of a new paragraph

### Capitalize proper nouns
- Personal names, place names, organization names
- Example: Nguyễn Văn A, Hà Nội, Bộ Giáo dục và Đào tạo

### Capitalize organization names
- Capitalize the first letter of the proper noun and the first word
- Example: Ủy ban nhân dân thành phố Hà Nội, Sở Giáo dục và Đào tạo

### Capitalize document type names when citing
- "... theo Nghị định số 30/2020/NĐ-CP..."
- "... căn cứ Quyết định số 156/QĐ-UBND..."

---

## 6. Page Layout Diagram

### First page — Standard document

```
|<── 30mm ──>|<─────────── Content area ─────────────>|<─ 15mm ─>|
|            |                                         |          |
|   20mm     |  TÊN CƠ QUAN CHỦ QUẢN    CỘNG HÒA XÃ |          |
|   (top)    |  TÊN CƠ QUAN BAN HÀNH    HỘI CHỦ NGHĨ|          |
|            |       ────                 A VIỆT NAM   |          |
|            |                           Độc lập - Tự |          |
|            |                           do - Hạnh phúc|          |
|            |                           ──────────────|          |
|            |  Số: .../...-...    Đ.danh, ngày...     |          |
|            |                                         |          |
|            |            TÊN LOẠI VĂN BẢN            |          |
|            |          Trích yếu nội dung             |          |
|            |             ──────────                   |          |
|            |                                         |          |
|            |    Nội dung văn bản...                   |          |
|            |    (thụt đầu dòng 1.27cm)               |          |
|            |    ...                                  |          |
|            |                                         |          |
|            |  Nơi nhận:          CHỨC VỤ NGƯỜI KÝ    |          |
|            |  - Như trên;           (Chữ ký, dấu)    |          |
|            |  - Lưu: VT, VP.      Nguyễn Văn A       |          |
|            |                                         |          |
|   20mm     |                                         |          |
|  (bottom)  |                                         |          |
```

### First page — Công văn (Official letter)

```
|            |  TÊN CƠ QUAN CHỦ QUẢN    CỘNG HÒA XÃ..|          |
|            |  TÊN CƠ QUAN BAN HÀNH    Độc lập - ... |          |
|            |       ────                ──────────────|          |
|            |  Số: .../...-...    Đ.danh, ngày...     |          |
|            |  V/v ................                    |          |
|            |                                         |          |
|            |           Kính gửi: [Nơi nhận]          |          |
|            |                                         |          |
|            |    Nội dung công văn...                  |          |
|            |    (thụt đầu dòng 1.27cm)               |          |
|            |    ...                                  |          |
|            |                                         |          |
|            |  Nơi nhận:          CHỨC VỤ NGƯỜI KÝ    |          |
|            |  - Như trên;           (Chữ ký)         |          |
|            |  - Lưu: VT, VP.      Nguyễn Văn A       |          |
```

---

## 7. docx-js Technical Parameters

### Standard page configuration

```javascript
const PAGE_CONFIG = {
  // A4 paper
  size: {
    width: 11906,   // 210mm
    height: 16838   // 297mm
  },
  margin: {
    top: 1134,      // 20mm
    bottom: 1134,   // 20mm
    left: 1701,     // 30mm
    right: 850      // 15mm
  }
};

// Content area width: 11906 - 1701 - 850 = 9355 DXA (~165mm)
const CONTENT_WIDTH = 9355;

// Two-column split for header layout (left-right):
const LEFT_COL = 4677;   // ~50%
const RIGHT_COL = 4678;  // ~50%
```

### Font sizes (pt → half-point for docx-js `size` property)

```javascript
const FONT_SIZES = {
  quocHieu: 26,       // 13pt — "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" (ALL CAPS, bold)
  tieuNgu: 28,        // 14pt — "Độc lập - Tự do - Hạnh phúc" (bold)
  coQuanChuQuan: 26,  // 13pt — Parent authority (ALL CAPS, NOT bold)
  coQuanBanHanh: 26,  // 13pt — Issuing authority (ALL CAPS, bold)
  soKyHieu: 26,       // 13pt — Document number/code
  diaDanhNgay: 28,    // 14pt — Place and date (italic)
  tenLoaiVB: 28,      // 14pt — Document type (ALL CAPS, bold)
  trichYeu: 28,       // 14pt — Summary (bold)
  noiDung: 26,        // 13pt — Body text
  chucVu: 28,         // 14pt — Signatory title (ALL CAPS, bold)
  hoTen: 28,          // 14pt — Signatory name (bold)
  noiNhanLabel: 24,   // 12pt — "Nơi nhận:" label (bold, italic)
  noiNhanList: 22,    // 11pt — Recipient list items
  soTrang: 26,        // 13pt — Page numbers
  trichYeuCV: 24,     // 12pt — Công văn "V/v" summary
};
```

### Standard spacing values

```javascript
const SPACING = {
  // Between major sections
  afterQuocHieu: 0,         // No gap between Quốc hiệu and Tiêu ngữ
  afterTieuNgu: 120,        // 6pt after Tiêu ngữ (before date line)
  afterHeader: 240,         // 12pt after header section (before document type)
  afterTenLoaiVB: 0,        // No gap before Trích yếu
  afterTrichYeu: 240,       // 12pt after summary (before body)
  // Body paragraph spacing
  bodyParagraph: {
    before: 120,             // 6pt before each paragraph
    after: 0,
    line: 276               // 1.15 line spacing
  },
  // First line indent
  firstLineIndent: 720      // 1.27cm
};
```
