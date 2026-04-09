---
name: van-ban-hanh-chinh
description: "Vietnamese administrative document generator compliant with official government standards. Use this skill whenever a user wants to draft, create, or edit Vietnamese administrative documents (văn bản hành chính) following Decree 30/2020/NĐ-CP for government documents, Guideline 36-HD/VPTW for Communist Party documents, or Decision 4114/QĐ-BTC for Ministry of Finance documents. MANDATORY TRIGGERS: văn bản hành chính, công văn, quyết định, nghị quyết, tờ trình, báo cáo, thông báo, chỉ thị, kế hoạch, biên bản, giấy mời, giấy giới thiệu, văn bản Đảng, hành chính, ký hiệu văn bản, trình bày văn bản, thể thức văn bản, quy chuẩn văn bản, mẫu văn bản, NĐ30, HD36, Vietnamese official document, Vietnamese government letter, Party document. Always use this skill when the user mentions any type of Vietnamese administrative document, even if they don't specify the exact standard."
---

# Vietnamese Administrative Document Generator

This skill creates Vietnamese administrative documents (văn bản hành chính) that strictly comply with current legal formatting standards. It supports three standard systems:

1. **Nghị định 30/2020/NĐ-CP** — Government administrative documents
2. **Hướng dẫn 36-HD/VPTW** — Communist Party of Vietnam documents
3. **Quyết định 4114/QĐ-BTC** — Ministry of Finance documents (supplements NĐ 30)

## Workflow

When a user requests a Vietnamese administrative document:

### Step 1: Identify the document type and applicable standard

Ask the user (if not already clear):
- Government document or Party document?
- Specific document type (công văn, quyết định, báo cáo, tờ trình, etc.)?
- Issuing authority (cơ quan ban hành)?
- Main content to be included?

Based on the answers, read the corresponding reference file:
- Government documents → read `references/nghi-dinh-30.md`
- Party documents → read `references/huong-dan-36.md`
- Both standards have detailed templates in `references/mau-van-ban.md`

### Step 2: Create the document

Use docx-js (npm `docx` library) to generate a .docx file. You MUST ensure:
- Font: Times New Roman throughout the entire document — no other fonts
- Paper: A4 (210mm × 297mm)
- All formatting specifications match the applicable standard exactly (see references)

**CRITICAL**: Always read the relevant reference file BEFORE creating the document to ensure full compliance with all technical parameters.

The script `scripts/create_vbhc.js` provides ready-to-use builder functions. You can either:
- Use the script directly via `node scripts/create_vbhc.js --config config.json --output output.docx`
- Import the builder functions as a module and customize as needed
- Write your own docx-js code following the specifications in the reference files

### Step 3: Validate and deliver

After creation:
1. Run `python scripts/office/validate.py` to check the file
2. Confirm key details with the user
3. Save to the workspace folder

## Quick Technical Reference

### Paper and Margins

| Parameter | Government (NĐ 30) | Party (HD 36) |
|-----------|-------------------|---------------|
| Paper | A4 (210×297mm) | A4 (210×297mm) |
| Top margin | 20–25mm | 20mm |
| Bottom margin | 20–25mm | 20mm |
| Left margin | 30–35mm | 30mm |
| Right margin | 15–20mm | 15mm |
| Font | Times New Roman | Times New Roman |
| Body text size | 13–14pt | 13–14pt |
| Encoding | TCVN 6909:2001 | TCVN 6909:2001 |
| Text color | Black | Black |

### Key Differences Between the Two Systems

**Government documents** have:
- National emblem header: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" (top right)
- Motto: "Độc lập - Tự do - Hạnh phúc" (below emblem)
- Issuing authority name (top left)
- Document code uses slash: `Số: 30/2020/NĐ-CP`
- Authority prefix uses dot: `TM.`, `KT.`, `TL.`

**Party documents** have:
- Party header: "ĐẢNG CỘNG SẢN VIỆT NAM" (top right)
- Party organization name (top left)
- Asterisk (*) separator below org name
- Document code uses hyphen: `Số: 36-HD/VPTW`
- Authority prefix uses slash: `T/M`, `K/T`, `T/L`

## Supported Document Types

### Government Documents (29 types per NĐ 30/2020)
Công văn, Quyết định, Nghị quyết, Chỉ thị, Thông báo, Báo cáo, Tờ trình, Kế hoạch, Chương trình, Quy chế, Quy định, Hướng dẫn, Biên bản, Hợp đồng, Giấy mời, Giấy giới thiệu, Giấy ủy quyền, Giấy nghỉ phép, Thông cáo, Bản ghi nhớ, Bản thỏa thuận, Phương án, Đề án, Dự án, Công điện, Phiếu gửi, Phiếu chuyển, Phiếu báo, Thư công.

### Party Documents (33 types per HD 36)
Nghị quyết, Chỉ thị, Quy định, Quy chế, Kết luận, Thông báo, Hướng dẫn, Công văn, Báo cáo, Quyết định, and 23 other types.

## Quick Usage Examples

Users can simply say:
- "Tạo công văn gửi Sở Giáo dục về việc..." → Government công văn per NĐ 30
- "Soạn nghị quyết Đảng bộ về..." → Party nghị quyết per HD 36
- "Viết tờ trình xin kinh phí..." → Government tờ trình per NĐ 30
- "Làm quyết định bổ nhiệm..." → Government quyết định per NĐ 30
- "Soạn báo cáo kết quả thực hiện..." → Report per the applicable standard

## Important Rules

1. **Always read the reference** before creating any document — each document type has its own layout
2. **Never alter** the mandated technical parameters
3. **Position each component** exactly as specified by the standard
4. **Use correct abbreviations** for document types (e.g., QĐ for Quyết định, CV for Công văn)
5. **Format dates** correctly: "ngày DD tháng MM năm YYYY" with leading zeros for days 01–09 and months 01–02
6. **The national emblem and motto** are mandatory for every government document
7. **"ĐẢNG CỘNG SẢN VIỆT NAM"** is mandatory for every Party document
8. **All Vietnamese text** in the generated document must use proper diacritics (dấu tiếng Việt)
