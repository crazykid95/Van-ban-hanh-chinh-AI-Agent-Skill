# Communist Party Document Standards
# Per Hướng dẫn 36-HD/VPTW dated April 3, 2018

## Table of Contents

1. [Page Setup](#1-page-setup)
2. [Document Components](#2-document-components)
3. [Component Details](#3-component-details)
4. [Party Document Types](#4-party-document-types)
5. [Page Layout Diagram](#5-page-layout-diagram)
6. [Key Differences from Government Documents](#6-key-differences-from-government-documents)
7. [docx-js Technical Parameters](#7-docx-js-technical-parameters)

---

## 1. Page Setup

| Parameter | Value | DXA (docx-js) |
|-----------|-------|---------------|
| Paper size | A4 (210 × 297mm) | width: 11906, height: 16838 |
| Top margin | 20mm (fixed) | 1134 |
| Bottom margin | 20mm (fixed) | 1134 |
| Left margin | 30mm (fixed) | 1701 |
| Right margin | 15mm (fixed) | 850 |
| Font | Times New Roman | "Times New Roman" |
| Encoding | TCVN 6909:2001 (Unicode) | — |
| Text color | Black | "000000" |
| Body text size | 13–14pt | 26–28 (half-point) |

**Important**: Party document margins are fixed values (not ranges), unlike government documents which allow a range.

---

## 2. Document Components

Party documents must include these mandatory components in order:

1. **Tiêu đề Đảng**: "ĐẢNG CỘNG SẢN VIỆT NAM" (top right)
2. **Tên tổ chức Đảng ban hành** (Party organization name — top left)
3. **Dấu sao (*)** — Asterisk separator below the organization name
4. **Số và ký hiệu văn bản** (Document number and code — below asterisk, left side)
5. **Địa danh và ngày tháng ban hành** (Place and date — below Party header, right side)
6. **Tên loại văn bản và trích yếu nội dung** (Document type and summary — centered)
7. **Nội dung văn bản** (Document body)
8. **Quyền hạn, chức vụ, họ tên và chữ ký** (Authority, title, name, signature — bottom right)
9. **Dấu cơ quan ban hành** (Organizational seal)
10. **Nơi nhận văn bản** (Recipients — bottom left)

### Optional components (when needed):
- Dấu chỉ độ mật, mức độ khẩn (Confidentiality and urgency marks)
- Chỉ dẫn về phạm vi lưu hành (Circulation scope)
- Địa chỉ cơ quan, điện thoại (Organization address, phone)
- Số bản phát hành (Number of copies issued)
- Phụ lục (Appendices)

---

## 3. Component Details

### 3.1. TIÊU ĐỀ ĐẢNG (Party header — top right)

```
                                    ĐẢNG CỘNG SẢN VIỆT NAM
                                    ─────────────────────────
```

| Element | Specification |
|---------|--------------|
| Content | "ĐẢNG CỘNG SẢN VIỆT NAM" |
| Font size | 15–16pt |
| Style | ALL CAPS, **bold**, upright |
| Position | Centered on the right half of the page |
| Underline | Horizontal rule below, same width as the text |

**CRITICAL**: This is the biggest difference from government documents. Party documents do NOT have the Quốc hiệu and Tiêu ngữ. Instead, they use "ĐẢNG CỘNG SẢN VIỆT NAM" as the header.

### 3.2. TÊN TỔ CHỨC ĐẢNG BAN HÀNH (Party organization name — top left)

```
ĐẢNG BỘ/TỔ CHỨC ĐẢNG CẤP TRÊN (nếu có)
TÊN TỔ CHỨC ĐẢNG BAN HÀNH
              *
```

| Element | Specification |
|---------|--------------|
| Line 1 — Superior organization | Name of the directly superior Party organization (if any) |
| Font size | 13–14pt |
| Style | ALL CAPS, upright, NOT bold |
| Line 2 — Issuing organization | Name of the Party organization directly issuing the document |
| Font size | 13–14pt |
| Style | ALL CAPS, **bold**, upright |
| Asterisk (*) | Centered below the issuing organization name |
| Position | Centered on the left half of the page |

**Example**:
```
TỈNH ỦY QUẢNG NINH                        ĐẢNG CỘNG SẢN VIỆT NAM
BAN TUYÊN GIÁO                             ─────────────────────────
         *
Số: 15-HD/BTGTU                      Quảng Ninh, ngày 15 tháng 03 năm 2024
```

### 3.3. SỐ VÀ KÝ HIỆU VĂN BẢN ĐẢNG (Document number and code)

| Element | Specification |
|---------|--------------|
| Position | Below the asterisk (*), centered on the left half |
| Font size | 13pt |
| Style | Upright, regular |
| Format | `Số: XX-[Viết tắt loại VB]/[Viết tắt cơ quan]` |

**Important**: Party documents use a **hyphen (-)** between the number and document type abbreviation, UNLIKE government documents which use a **slash (/)**.

**Party document type abbreviations**:
| Loại văn bản | Viết tắt | English |
|-------------|----------|---------|
| Nghị quyết | NQ | Resolution |
| Chỉ thị | CT | Directive |
| Quy định | QĐi | Regulation/Rule |
| Quy chế | QC | Charter/Rules |
| Kết luận | KL | Conclusion |
| Thông báo | TB | Notice |
| Hướng dẫn | HD | Guideline |
| Công văn | CV | Official letter |
| Báo cáo | BC | Report |
| Quyết định | QĐ | Decision |
| Kế hoạch | KH | Plan |
| Chương trình | CTr | Program |
| Thông tri | TT | Circular |
| Quy trình | QTr | Procedure |

**Code examples**:
- `Số: 36-HD/VPTW` (Hướng dẫn số 36 của Văn phòng Trung ương)
- `Số: 66-QĐ/TW` (Quy định số 66 của Trung ương)
- `Số: 15-NQ/TU` (Nghị quyết số 15 của Tỉnh ủy)
- `Số: 234-CV/BTGTU` (Công văn số 234 của Ban Tuyên giáo Tỉnh ủy)

### 3.4. ĐỊA DANH VÀ NGÀY THÁNG BAN HÀNH (Place and date)

| Element | Specification |
|---------|--------------|
| Position | Below "ĐẢNG CỘNG SẢN VIỆT NAM" and its rule, centered on the right half |
| Font size | 13–14pt |
| Style | *Italic*, upright |
| Format | "Địa danh, ngày ... tháng ... năm ..." |

Same date rules as government documents:
- Days 1–9: leading zero (01–09)
- Months 1–2: leading zero (01, 02)

### 3.5. TÊN LOẠI VĂN BẢN VÀ TRÍCH YẾU (Document type and summary)

**Document type name**:
| Element | Specification |
|---------|--------------|
| Position | Centered on the page, below the header section |
| Font size | 15–16pt |
| Style | ALL CAPS, **bold**, upright |

**Content summary (Trích yếu)**:
| Element | Specification |
|---------|--------------|
| Position | Centered, below document type |
| Font size | 13–14pt |
| Style | **Bold**, upright (NOT all caps) |
| Underline | Short horizontal rule below |

### 3.6. NỘI DUNG VĂN BẢN (Document body)

Same as government documents:
| Element | Specification |
|---------|--------------|
| Font size | 13–14pt |
| Style | Upright, regular |
| Alignment | Justified both margins |
| First line indent | 1cm – 1.27cm |
| Line spacing | Single to 1.5 |

### 3.7. QUYỀN HẠN, CHỨC VỤ, CHỮ KÝ VÀ HỌ TÊN (Signatory block)

| Element | Specification |
|---------|--------------|
| Position | Bottom right |
| Authority prefix | "T/M" (Thay mặt), "K/T" (Ký thay), "T/L" (Thừa lệnh), "Q." (Quyền) |
| Font size | 13–14pt |
| Style | ALL CAPS, **bold** for title |

**Important**: Party documents use a **slash (/)** in authority prefixes (T/M, K/T, T/L), UNLIKE government documents which use a **period** (TM., KT., TL.).

### 3.8. NƠI NHẬN (Recipients)

| Element | Specification |
|---------|--------------|
| Position | Bottom left |
| Label | "Nơi nhận:" — **bold**, *italic*, 12pt |
| List | 11pt, upright, regular |
| Format | Same as government documents |

---

## 4. Party Document Types

### Leadership/directive documents (văn bản chỉ đạo):
Nghị quyết, Chỉ thị, Quy định, Quy chế, Kết luận, Thông báo, Hướng dẫn, Thông tri

### Internal/administrative documents (văn bản điều hành):
Quyết định, Chương trình, Kế hoạch, Quy trình, Báo cáo, Thông báo, Công văn

### Meeting documents (văn bản hội nghị):
Biên bản, Nghị quyết (hội nghị)

### Other documents:
Giấy giới thiệu, Giấy đi đường, Giấy mời, Phương án, Đề án

---

## 5. Page Layout Diagram

### Standard Party document (Nghị quyết, Chỉ thị, etc.)

```
|<── 30mm ──>|<─────────── Content area ─────────────>|<─ 15mm ─>|
|            |                                         |          |
|   20mm     | ĐẢNG BỘ/TỔ CHỨC CẤP TRÊN  ĐẢNG CỘNG  |          |
|   (top)    | TÊN TỔ CHỨC BAN HÀNH      SẢN VIỆT NAM|          |
|            |          *                ───────────── |          |
|            | Số: XX-YY/ZZZ      Đ.danh, ngày...     |          |
|            |                                         |          |
|            |           TÊN LOẠI VĂN BẢN             |          |
|            |           Trích yếu nội dung            |          |
|            |              ─────────                   |          |
|            |                                         |          |
|            |    Nội dung văn bản...                   |          |
|            |    (thụt đầu dòng 1.27cm)               |          |
|            |    ...                                  |          |
|            |                                         |          |
|            |  Nơi nhận:           T/M [TỔ CHỨC]      |          |
|            |  - ...;                 [CHỨC VỤ]       |          |
|            |  - Lưu: VT.            (Chữ ký, dấu)   |          |
|            |                        Nguyễn Văn A     |          |
|            |                                         |          |
|   20mm     |                                         |          |
|  (bottom)  |                                         |          |
```

### Party công văn (official letter)

```
|            | ĐẢNG BỘ/TỔ CHỨC CẤP TRÊN  ĐẢNG CỘNG  |          |
|            | TÊN TỔ CHỨC BAN HÀNH      SẢN VIỆT NAM|          |
|            |          *                ───────────── |          |
|            | Số: XX-CV/ZZZ      Đ.danh, ngày...     |          |
|            |                                         |          |
|            |    Kính gửi: [Nơi nhận]                 |          |
|            |                                         |          |
|            |    Nội dung công văn...                  |          |
|            |    ...                                  |          |
|            |                                         |          |
|            |  Nơi nhận:           K/T [CHỨC VỤ]      |          |
|            |  - ...;              [PHÓ CHỨC VỤ]      |          |
|            |  - Lưu: VT.            (Chữ ký)        |          |
|            |                        Trần Văn B       |          |
```

---

## 6. Key Differences from Government Documents

| Aspect | Government (NĐ 30) | Party (HD 36) |
|--------|-------------------|---------------|
| Right header | Quốc hiệu + Tiêu ngữ | "ĐẢNG CỘNG SẢN VIỆT NAM" |
| Left header | Government authority name | Party organization name |
| Separator | Horizontal rule below org name | Asterisk (*) |
| Code separator | Slash (/): `Số: 30/2020/NĐ-CP` | Hyphen (-): `Số: 36-HD/VPTW` |
| Authority prefix | Dot: TM., KT., TL. | Slash: T/M, K/T, T/L |
| Top margin | 20–25mm (range) | 20mm (fixed) |
| Bottom margin | 20–25mm (range) | 20mm (fixed) |
| Left margin | 30–35mm (range) | 30mm (fixed) |
| Right margin | 15–20mm (range) | 15mm (fixed) |
| Document type font | 13–14pt | 15–16pt |

---

## 7. docx-js Technical Parameters

### Page configuration for Party documents

```javascript
const DANG_PAGE_CONFIG = {
  size: {
    width: 11906,   // 210mm (A4)
    height: 16838   // 297mm (A4)
  },
  margin: {
    top: 1134,      // 20mm (fixed)
    bottom: 1134,   // 20mm (fixed)
    left: 1701,     // 30mm (fixed)
    right: 850      // 15mm (fixed)
  }
};
```

### Font sizes for Party documents

```javascript
const DANG_FONT_SIZES = {
  tieuDeDang: 32,       // 16pt — "ĐẢNG CỘNG SẢN VIỆT NAM" (ALL CAPS, bold)
  toChucCapTren: 28,    // 14pt — Superior Party organization (ALL CAPS)
  toChucBanHanh: 28,    // 14pt — Issuing Party organization (ALL CAPS, bold)
  dauSao: 28,           // 14pt — Asterisk (*)
  soKyHieu: 26,         // 13pt — Document number/code
  diaDanhNgay: 28,      // 14pt — Place and date (italic)
  tenLoaiVB: 32,        // 16pt — Document type name (ALL CAPS, bold)
  trichYeu: 28,         // 14pt — Summary (bold)
  noiDung: 28,          // 14pt — Body text
  chucVu: 28,           // 14pt — Signatory title (ALL CAPS, bold)
  hoTen: 28,            // 14pt — Signatory name (bold)
  noiNhanLabel: 24,     // 12pt — "Nơi nhận:" label (bold, italic)
  noiNhanList: 22,      // 11pt — Recipient list items
};
```
