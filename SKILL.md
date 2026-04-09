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

### Layout: use hidden-border tables, not tab stops

The two-column header (authority name on the left, national emblem on the right) and the footer (recipients on the left, signatory on the right) must be laid out using **Table elements with all borders set to NONE**. This is how people actually do it in Word — a 2-column, borderless table keeps left and right content aligned regardless of text length.

Do NOT use tab stops or manual spacing to align the left and right halves. Tabs break when text length changes; tables don't.

```javascript
// Every layout table must have this:
const NO_BORDER = { style: BorderStyle.NONE, size: 0 };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
// And each TableCell must include: borders: NO_BORDERS
```

### Underlines: use paragraph bottom borders with explicit width

The underlines below "Độc lập - Tự do - Hạnh phúc", below the issuing authority name, and below the document summary (trích yếu) are **not** text underlines. They are **bottom borders on a dedicated empty paragraph** placed right after the text.

This is the right approach because:
- The user can select the paragraph and adjust the border width/length in Word
- It matches how Vietnamese government templates are actually built
- It won't disappear or shift when text is edited

```javascript
// Underline = a short empty paragraph with bottom border
new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 0 },
  // Use indent to control the visible width of the line:
  indent: { left: 600, right: 600 }, // narrower than full column width
  border: {
    bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 }
  },
  children: [] // empty — the border IS the underline
})
```

To control underline width: adjust `indent.left` and `indent.right`. Wider indents = shorter line. The user can later change these indents in Word to resize the line.

For the tiêu ngữ underline (under "Độc lập - Tự do - Hạnh phúc"), the line should be roughly the same width as the text. For the authority name underline, it should be about 1/3 to 1/2 of the name width.

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

### Cell padding and spacing in layout tables

All TableCell elements in layout tables should include internal padding so text doesn't touch the cell edges:

```javascript
margins: { top: 0, bottom: 0, left: 0, right: 0 }
// Use 0 for layout tables — the page margins already provide spacing.
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
| Separator below org name | Underline (border) | Asterisk (*) |
| Code separator | Slash: `Số: 30/2020/NĐ-CP` | Hyphen: `Số: 36-HD/VPTW` |
| Authority prefix | TM., KT., TL. | T/M, K/T, T/L |
| Doc type font size | 13–14pt | 15–16pt |

## Supported Document Types

**Government** (29 types): Công văn, Quyết định, Nghị quyết, Chỉ thị, Thông báo, Báo cáo, Tờ trình, Kế hoạch, Chương trình, Quy chế, Quy định, Hướng dẫn, Biên bản, Hợp đồng, Giấy mời, Giấy giới thiệu, Giấy ủy quyền, Giấy nghỉ phép, Thông cáo, Bản ghi nhớ, Bản thỏa thuận, Phương án, Đề án, Dự án, Công điện, Phiếu gửi, Phiếu chuyển, Phiếu báo, Thư công.

**Party** (33 types): Nghị quyết, Chỉ thị, Quy định, Quy chế, Kết luận, Thông báo, Hướng dẫn, Công văn, Báo cáo, Quyết định, and 23 others.

## Rules

1. Read the reference file for the relevant standard before writing any code
2. Font is Times New Roman everywhere — no exceptions
3. All Vietnamese text uses full diacritics
4. Dates: "ngày DD tháng MM năm YYYY" with leading zeros (01–09, 01–02)
5. Layout via hidden-border tables, underlines via paragraph bottom borders
6. The document must be fully editable in Word — no hacks that look right but break on edit
