---
name: van-ban-hanh-chinh
description: "Vietnamese administrative document generator compliant with official government standards. Use this skill whenever a user wants to draft, create, or edit Vietnamese administrative documents (văn bản hành chính) following Decree 30/2020/NĐ-CP for government documents, Guideline 36-HD/VPTW for Communist Party documents, or Decision 4114/QĐ-BTC for Ministry of Finance documents. MANDATORY TRIGGERS: văn bản hành chính, công văn, quyết định, nghị quyết, tờ trình, báo cáo, thông báo, chỉ thị, kế hoạch, biên bản, giấy mời, giấy giới thiệu, văn bản Đảng, hành chính, ký hiệu văn bản, trình bày văn bản, thể thức văn bản, quy chuẩn văn bản, mẫu văn bản, NĐ30, HD36, Vietnamese official document, Vietnamese government letter, Party document. Always use this skill when the user mentions any type of Vietnamese administrative document, even if they don't specify the exact standard."
---

# Vietnamese Administrative Document Generator

Generates `.docx` files for Vietnamese administrative documents following three standards:

1. **Nghị định 30/2020/NĐ-CP** — Government administrative documents
2. **Hướng dẫn 36-HD/VPTW** — Communist Party of Vietnam documents
3. **Quyết định 4114/QĐ-BTC** — Ministry of Finance documents (supplements NĐ 30)

## Workflow

### Step 1: Figure out what document is needed

If the user hasn't specified, ask:
- Government or Party document?
- Document type (công văn, quyết định, báo cáo, tờ trình, etc.)?
- Issuing authority?
- What content goes in it?

Then read the right reference file before writing any code:
- Government → `references/nghi-dinh-30.md`
- Party → `references/huong-dan-36.md`
- Code templates → `references/mau-van-ban.md`

### Step 2: Generate the document

Use docx-js (npm `docx` library). The script `scripts/create_vbhc.js` has ready-made builder functions you can use directly or import as a module.

### Step 3: Validate and deliver

Run `python scripts/office/validate.py` on the output, confirm details with the user, save to workspace.

## Word-Native Formatting Rules

The goal is to produce a `.docx` that looks and behaves like a document someone built by hand in Microsoft Word. The user should be able to open it, click on any element, and edit it normally. This section defines how to achieve that.

### Layout: hidden-border tables

The header uses a **2-column, 2-row borderless table**:
- **Row 1**: authority name + shape line (left) | quốc hiệu + tiêu ngữ + shape line (right)
- **Row 2**: số ký hiệu + V/v (left) | địa danh, ngày tháng (right)

The shape line MUST stay in the same row as the text it underlines. Putting the line
and the next content (date, document number) in the same row causes the line to stick
to that content visually.

The footer uses a **2-column, 1-row borderless table**: recipients (left), signatory (right).

Column widths: left ~38%, right ~62%. The right column MUST be wide enough so that
"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" and "Độc lập - Tự do - Hạnh phúc" **never wrap
to a second line** — wrapping quốc hiệu tiêu ngữ giữa chừng is strictly forbidden
(tối kỵ) in Vietnamese administrative documents.

Do NOT use tab stops or manual spacing to position elements.

**Critical**: borders must be removed at **two levels** — both the Table level AND each
Cell level. If you only remove cell borders, the table's internal gridlines
(`insideHorizontal`, `insideVertical`) will still show in Word.

```javascript
// TABLE-level: hides outer borders AND internal gridlines
const TABLE_BORDERS_NONE = {
  top:              { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom:           { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left:             { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right:            { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical:   { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// CELL-level: hides each cell's individual borders
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const CELL_BORDERS_NONE = {
  top: NO_BORDER, bottom: NO_BORDER,
  left: NO_BORDER, right: NO_BORDER
};

// Use on Table:
new Table({ borders: TABLE_BORDERS_NONE, ... })

// Use on each TableCell:
new TableCell({
  borders: CELL_BORDERS_NONE,
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  verticalAlign: VerticalAlign.TOP,
  ...
})
```

**API note**: Table and TableCell use `borders` (plural). Paragraph uses `border` (singular).

### Underlines: Shape lines (Insert > Shapes > Line)

Vietnamese administrative documents use **Shape lines** for all decorative underlines — below
tiêu ngữ ("Độc lập - Tự do - Hạnh phúc"), "ĐẢNG CỘNG SẢN VIỆT NAM", authority name, and
trích yếu. This is the traditional approach used in real Vietnamese government offices: the
line is a selectable, resizable drawing object (Insert > Shapes > Line in Word).

**docx-js does not natively support Shape objects.** Use a two-step process:

1. Place a **placeholder paragraph** with an invisible marker where each line should go.
2. After `Packer.toBuffer()`, use **JSZip** to replace each placeholder with real OOXML
   inline drawing XML (`<wp:inline>` containing `<wps:wsp>` with `prst="line"`).

See `references/mau-van-ban.md` → "Shape line" section for the complete helper code
(`shapePlaceholder()`, `shapeLineXml()`, `injectShapeLines()`).

```javascript
// Placeholder (step 1): invisible marker — will be replaced by shape line
function shapePlaceholder(widthCm = 5.5) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({
      text: `__LINE_${widthCm}CM__`,
      font: FONT, size: 2, color: "FFFFFF"
    })],
  });
}

// Post-processing (step 2): see mau-van-ban.md for injectShapeLines()
```

Standard widths:
- Tiêu ngữ / "ĐẢNG CỘNG SẢN VIỆT NAM" underline: **5.5 cm**
- Authority name / trích yếu underline: **3.0 cm**
- All lines: 0.5pt, black

Do NOT use paragraph bottom borders, underlined spaces, or any other workaround.
Shape lines are the only standard method for Vietnamese administrative documents.

### Headings: use real heading styles where appropriate

The document type name ("QUYẾT ĐỊNH", "BÁO CÁO", etc.) is the document's title — but do NOT use HeadingLevel for it, because Vietnamese administrative documents don't use Word's heading hierarchy for their title. Use a regular Paragraph with explicit bold/size/center formatting.

However, if the document body has structural sections (Phần, Chương, Mục, Điều, or Roman-numeral sections like I, II, III), those SHOULD use properly defined paragraph styles or at minimum consistent bold/size formatting so the structure is clear when viewed in Word's Navigation pane.

### Lists and numbering: use Word's numbering system

If the document body contains numbered items (1., 2., 3. or a), b), c)) or bulleted lists, use docx-js `numbering` config with `LevelFormat.DECIMAL` or `LevelFormat.LOWER_LETTER`. Never use manual text like "1. " or "a) " followed by a TextRun — that's not a real Word list and the user can't continue numbering or change indent in Word.

```javascript
// Define numbering in the Document config:
numbering: {
  config: [{
    reference: "dieu-list",
    levels: [{
      level: 0,
      format: LevelFormat.DECIMAL,
      text: "%1.",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } }
    }]
  }]
}

// Then use in paragraphs:
new Paragraph({
  numbering: { reference: "dieu-list", level: 0 },
  children: [new TextRun({ text: "Nội dung khoản", font: FONT, size: 26 })]
})
```

Exception: "Điều 1.", "Điều 2." in Quyết định are traditionally written as inline bold text, not as a numbered list. Keep those as `new TextRun({ text: "Điều 1. ", bold: true })` followed by the content — this matches how real Quyết định are typed.

### Recipient list formatting

The "Nơi nhận:" label and the recipient items (- Như trên; - Lưu: VT, VP.) should just be plain paragraphs with manual dash prefixes. These are NOT bullet lists in practice — Vietnamese administrative templates use plain text with dashes, and converting them to Word bullet lists would add unwanted indent and bullet styling.

### Cell padding and vertical alignment in layout tables

All TableCell elements in layout tables should have zero internal padding (page margins
already provide spacing) and top vertical alignment:

```javascript
new TableCell({
  borders: CELL_BORDERS_NONE,
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  verticalAlign: VerticalAlign.TOP, // import VerticalAlign from docx
  children: [...]
})
// Only add cell margins (80–120 DXA) for data tables in the body.
```

### Page numbers

Start from page 2 (first page has no number). Centered in the top margin, 13–14pt, regular style. Use Word's built-in PageNumber in a Header element:

```javascript
headers: {
  default: new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        children: [PageNumber.CURRENT],
        font: "Times New Roman", size: 26
      })]
    })]
  })
}
// Then suppress header on first page via section properties:
// properties: { titlePage: true }
```

## Quick Reference: Paper and Margins

| Parameter | Government (NĐ 30) | Party (HD 36) |
|-----------|-------------------|---------------|
| Paper | A4 (210×297mm) | A4 (210×297mm) |
| Top | 20–25mm | 20mm |
| Bottom | 20–25mm | 20mm |
| Left | 30–35mm | 30mm |
| Right | 15–20mm | 15mm |
| Font | Times New Roman | Times New Roman |
| Body size | 13–14pt | 13–14pt |
| Text color | Black | Black |

## Quick Reference: Government vs. Party

| | Government | Party |
|---|---|---|
| Right header | CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM | ĐẢNG CỘNG SẢN VIỆT NAM |
| Left header | Government authority name | Party organization name |
| Separator below org name | Shape line (~3cm) | Asterisk (*) |
| Code separator | Slash: `Số: 30/2020/NĐ-CP` | Hyphen: `Số: 36-HD/VPTW` |
| Authority prefix | TM., KT., TL. | T/M, K/T, T/L |
| Doc type font size | 13–14pt | 15–16pt |

## Supported Document Types

**Government** (29 types): Công văn, Quyết định, Nghị quyết, Chỉ thị, Thông báo, Báo cáo, Tờ trình, Kế hoạch, Chương trình, Quy chế, Quy định, Hướng dẫn, Biên bản, Hợp đồng, Giấy mời, Giấy giới thiệu, Giấy ủy quyền, Giấy nghỉ phép, Thông cáo, Bản ghi nhớ, Bản thỏa thuận, Phương án, Đề án, Dự án, Công điện, Phiếu gửi, Phiếu chuyển, Phiếu báo, Thư công.

**Party** (33 types): Nghị quyết, Chỉ thị, Quy định, Quy chế, Kết luận, Thông báo, Hướng dẫn, Công văn, Báo cáo, Quyết định, and 23 others.

## Rules

### Formatting rules

1. Read the reference file for the relevant standard before writing any code
2. Font is Times New Roman everywhere — no exceptions
3. All Vietnamese text uses full diacritics
4. Dates: "ngày DD tháng MM năm YYYY" with leading zeros (01–09, 01–02)
5. Layout via hidden-border tables, underlines via Shape lines (Insert > Shapes > Line)
6. The document must be fully editable in Word — no hacks that look right but break on edit
7. Quốc hiệu tiêu ngữ ("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", "Độc lập - Tự do - Hạnh phúc") MUST NOT wrap to a second line — this is strictly forbidden. Ensure the right column is wide enough (~62% of content width)
8. Shape lines must be in the same table row as the text they underline — never in the next row where they'd visually stick to different content

### Content rules

9. **Chính tả**: Nội dung văn bản phải được viết đúng chính tả tiếng Việt. Kiểm tra kỹ dấu hỏi/ngã, các từ dễ sai chính tả (ví dụ: "giải quyết" không phải "giải quết", "kỷ luật" không phải "kỉ luật" trong văn bản hành chính). Nếu không chắc chắn, tra cứu từ điển chính tả tiếng Việt.

10. **Từ ngữ hành chính**: Sử dụng từ ngữ hành chính thông dụng, chuẩn mực trong văn bản hành chính Việt Nam. Tránh dùng từ ngữ đời thường, khẩu ngữ, hoặc cách diễn đạt không phù hợp với văn phong hành chính. Ví dụ:
    - Dùng "đề nghị", "kính đề nghị" thay vì "xin", "mong"
    - Dùng "triển khai thực hiện" thay vì "làm"
    - Dùng "phối hợp" thay vì "hợp tác"
    - Dùng "trân trọng" thay vì "cảm ơn"
    - Kết thúc bằng "./." (dấu chấm gạch chéo chấm) đúng quy chuẩn

11. **Nội dung chính xác**: Nội dung phải đúng về thông tin, logic, và phù hợp với ngữ cảnh của loại văn bản. Các căn cứ pháp lý (tên luật, nghị định, thông tư) phải chính xác nếu được viện dẫn.

12. **Giảm thiểu dấu hiệu AI**: Sau khi soạn xong nội dung, đọc lại toàn bộ văn bản và chỉnh sửa để:
    - Tránh các cụm từ lặp đi lặp lại một cách máy móc
    - Tránh liệt kê quá đều đặn, quá cân đối (mỗi điểm cùng độ dài)
    - Tránh dùng các cách diễn đạt mang tính "template" quá rõ ràng
    - Đảm bảo giọng văn tự nhiên, mang tính chuyên nghiệp của người soạn thảo văn bản hành chính thực thụ
    - Nội dung nên cụ thể, có chi tiết thực tế, tránh viết chung chung kiểu mẫu
