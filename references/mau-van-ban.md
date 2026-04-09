# Document Templates — docx-js Code

Reusable docx-js code for Vietnamese administrative documents. All templates produce Word-native
formatting: hidden-border tables for two-column layout, paragraph-border underlines for
decorative lines, proper page numbering from page 2.

## Table of Contents

1. [Shared Constants and Utilities](#1-shared-constants-and-utilities)
2. [Government Header](#2-government-header)
3. [Party Header](#3-party-header)
4. [Footer (Recipients + Signatory)](#4-footer-recipients--signatory)
5. [Template: Công văn — Government](#5-template-công-văn--government)
6. [Template: Quyết định — Government](#6-template-quyết-định--government)
7. [Template: Nghị quyết — Party](#7-template-nghị-quyết--party)
8. [Generic Template (Báo cáo, Tờ trình, Thông báo, Kế hoạch, etc.)](#8-generic-template)
9. [Body Content Patterns](#9-body-content-patterns)

---

## 1. Shared Constants and Utilities

```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, Header, PageNumber,
        VerticalAlign, LevelFormat } = require('docx');
const JSZip = require('jszip');  // npm install jszip — for shape line post-processing
const fs = require('fs');

const FONT = "Times New Roman";

// A4 content area with 30mm left, 15mm right margins
const CONTENT_WIDTH = 9355; // DXA
const LEFT_COL = 3555;   // ~38% — narrower left
const RIGHT_COL = 5800;  // ~62% — wider right so quốc hiệu tiêu ngữ never wraps

// Table-level borders: must include insideHorizontal and insideVertical
// to hide the gridlines between rows and columns
const TABLE_BORDERS_NONE = {
  top:              { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom:           { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left:             { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right:            { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical:   { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// Cell-level borders
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const CELL_BORDERS_NONE = {
  top: NO_BORDER, bottom: NO_BORDER,
  left: NO_BORDER, right: NO_BORDER
};

// A4 page config per NĐ 30/2020
const PAGE_A4 = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1134, bottom: 1134, left: 1701, right: 850 }
};
```

### Hidden-border layout table

Vietnamese administrative documents use a 2-column invisible table for the header and
footer. The standard approach (same as in Word: Insert > Table > 2×1, then Design >
Borders > No Border) requires borders removed at **both** levels:

- **Table level** (`borders`): removes the outer border AND internal gridlines
  (`insideHorizontal`, `insideVertical`)
- **Cell level** (`borders`): removes each cell's individual border

If you only set cell borders, the table's internal gridlines will still show in Word.

```javascript
/**
 * Create a 2-column hidden-border table.
 */
function layoutTable(rows, columnWidths = [LEFT_COL, RIGHT_COL]) {
  return new Table({
    borders: TABLE_BORDERS_NONE, // <-- hides gridlines between cells
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    rows,
  });
}

/**
 * Create a cell with no borders, no padding, top-aligned.
 */
function layoutCell(children, width = LEFT_COL) {
  return new TableCell({
    borders: CELL_BORDERS_NONE,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    verticalAlign: VerticalAlign.TOP,
    children,
  });
}
```

**Important API notes (docx npm)**:
- Paragraph property: `border` (singular) — `{ bottom: { style, size, color, space } }`
- TableCell property: `borders` (plural) — `{ top, bottom, left, right }`
- Table property: `borders` (plural) — includes `insideHorizontal`, `insideVertical`
- Cell margins: `margins` — `{ top, bottom, left, right }` in twips (DXA)
- Vertical align: `verticalAlign: VerticalAlign.TOP` (import `VerticalAlign` from docx)

### Shape line (decorative underline)

Vietnamese administrative documents use **Shape lines** (Insert > Shapes > Line) for the
decorative underlines below tiêu ngữ, "ĐẢNG CỘNG SẢN VIỆT NAM", tên cơ quan, and trích yếu.
Shape lines are the traditional approach: they are selectable, resizable by dragging handles,
and repositionable — exactly as done in real Vietnamese government offices.

**docx-js does NOT natively support creating Shape objects.** The solution is a two-step process:

1. Use docx-js to build the document, placing a **placeholder paragraph** where each line goes.
2. After `Packer.toBuffer()`, use **JSZip** to unzip the docx, find placeholders in
   `word/document.xml`, replace them with inline drawing XML, then rezip.

#### Step 1: Placeholder paragraphs

Insert a centered paragraph containing a unique marker text (e.g. `__LINE_5.5CM__`):

```javascript
/**
 * Placeholder paragraph for a shape line. Will be replaced by post-processing.
 * @param {number} widthCm   Line width in centimeters
 */
function shapePlaceholder(widthCm = 5.5) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({
      text: `__LINE_${widthCm}CM__`,
      font: FONT, size: 2, color: "FFFFFF"  // tiny invisible text
    })],
  });
}
```

#### Step 2: Post-processing with JSZip

After generating the buffer, replace all placeholder runs with inline drawing XML:

```javascript
const JSZip = require('jszip');

/**
 * Generate the OOXML inline drawing XML for a horizontal shape line.
 * Same result as Insert > Shapes > Line in Word.
 *
 * @param {number} id        Unique shape ID (increment for each line)
 * @param {number} widthCm   Line width in cm
 * @param {number} weightPt  Line thickness in pt (default 0.5)
 * @param {string} color     RGB hex color (default "000000")
 */
function shapeLineXml(id, widthCm, weightPt = 0.5, color = "000000") {
  const widthEmu = Math.round(widthCm * 360000);   // 1 cm = 360,000 EMU
  const weightEmu = Math.round(weightPt * 12700);   // 1 pt = 12,700 EMU
  return `<w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0"
      xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
      xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
      xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
      <wp:extent cx="${widthEmu}" cy="0"/>
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="${id}" name="Straight Connector ${id}"/>
      <wp:cNvGraphicFramePr><a:graphicFrameLocks/></wp:cNvGraphicFramePr>
      <a:graphic>
        <a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">
          <wps:wsp>
            <wps:cNvCnPr/>
            <wps:spPr>
              <a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="0"/></a:xfrm>
              <a:prstGeom prst="line"><a:avLst/></a:prstGeom>
              <a:ln w="${weightEmu}" cap="flat" cmpd="sng">
                <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>
              </a:ln>
            </wps:spPr>
            <wps:bodyPr/>
          </wps:wsp>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing>`;
}

/**
 * Post-process a docx buffer: replace __LINE_XCM__ placeholders with real shape lines.
 * @param {Buffer} docxBuffer  Buffer from Packer.toBuffer()
 * @returns {Promise<Buffer>}  Modified docx buffer
 */
async function injectShapeLines(docxBuffer) {
  const zip = await JSZip.loadAsync(docxBuffer);
  let xml = await zip.file('word/document.xml').async('string');

  let shapeId = 100; // start from 100 to avoid conflicts
  // Match <w:r>...__LINE_XCM__...</w:r>
  xml = xml.replace(/<w:r[^>]*>.*?__LINE_([\d.]+)CM__.*?<\/w:r>/g, (match, cm) => {
    const id = shapeId++;
    const drawingXml = shapeLineXml(id, parseFloat(cm));
    return `<w:r>${drawingXml}</w:r>`;
  });

  zip.file('word/document.xml', xml);
  return zip.generateAsync({ type: 'nodebuffer' });
}
```

#### Complete usage

```javascript
async function generateDocument(params) {
  // 1. Build with docx-js (use shapePlaceholder() where lines go)
  const doc = buildDocument(params);
  const buffer = await Packer.toBuffer(doc);

  // 2. Post-process: replace placeholders with real shape lines
  const finalBuffer = await injectShapeLines(buffer);

  // 3. Save
  fs.writeFileSync(params.outputPath, finalBuffer);
}
```

#### Preset widths

| Element | Width | Usage |
|---------|-------|-------|
| Tiêu ngữ underline | 5.5 cm | `shapePlaceholder(5.5)` |
| "ĐẢNG CỘNG SẢN VIỆT NAM" underline | 5.5 cm | `shapePlaceholder(5.5)` |
| Authority name underline | 3.0 cm | `shapePlaceholder(3.0)` |
| Trích yếu underline | 3.0 cm | `shapePlaceholder(3.0)` |

All lines: 0.5pt thick, black (#000000).

---

## 2. Government Header

2-column, **2-row** hidden-border table:
- **Row 1**: org name + shape line (left) | quốc hiệu + tiêu ngữ + shape line (right)
- **Row 2**: số ký hiệu + V/v (left) | địa danh, ngày tháng (right)

The shape line stays in the same row as the text it underlines, preventing it from
sticking to the date line below. The right column is ~62% of content width so
"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" never wraps — wrapping the quốc hiệu is
strictly forbidden in Vietnamese administrative documents.

```javascript
function createHeaderNhaNuoc(coQuanChuQuan, coQuanBanHanh, soKyHieu, diaDanh, ngayThang, trichYeuCV) {

  // ── ROW 1: Org info + shape lines ──
  const r1Left = [];
  if (coQuanChuQuan) {
    r1Left.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: coQuanChuQuan.toUpperCase(),
        font: FONT, size: 26 // 13pt, NOT bold
      })]
    }));
  }
  r1Left.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({
      text: coQuanBanHanh.toUpperCase(),
      font: FONT, size: 26, bold: true
    })]
  }));
  r1Left.push(shapePlaceholder(3.0)); // shape line under authority name

  const r1Right = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
        font: FONT, size: 26, bold: true
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: "Độc lập - Tự do - Hạnh phúc",
        font: FONT, size: 28, bold: true
      })]
    }),
    shapePlaceholder(5.5), // shape line under tiêu ngữ
  ];

  // ── ROW 2: Document number + date ──
  const r2Left = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
      children: [new TextRun({ text: soKyHieu, font: FONT, size: 26 })]
    })
  ];
  if (trichYeuCV) {
    r2Left.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 0 },
      children: [new TextRun({ text: `V/v ${trichYeuCV}`, font: FONT, size: 24 })]
    }));
  }

  const r2Right = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
      children: [new TextRun({
        text: `${diaDanh}, ${ngayThang}`,
        font: FONT, size: 28, italics: true
      })]
    })
  ];

  return layoutTable([
    new TableRow({ children: [layoutCell(r1Left, LEFT_COL), layoutCell(r1Right, RIGHT_COL)] }),
    new TableRow({ children: [layoutCell(r2Left, LEFT_COL), layoutCell(r2Right, RIGHT_COL)] }),
  ]);
}
```

---

## 3. Party Header

Same 2-row, 2-column approach. Right side has "ĐẢNG CỘNG SẢN VIỆT NAM" instead of
Quốc hiệu. Left side has the asterisk (*) separator instead of a shape line.

```javascript
function createHeaderDang(toChucCapTren, toChucBanHanh, soKyHieu, diaDanh, ngayThang) {

  // ── ROW 1: Org info + shape line ──
  const r1Left = [];
  if (toChucCapTren) {
    r1Left.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: toChucCapTren.toUpperCase(),
        font: FONT, size: 28
      })]
    }));
  }
  r1Left.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: toChucBanHanh.toUpperCase(),
        font: FONT, size: 28, bold: true
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "*", font: FONT, size: 28 })]
    })
  );

  const r1Right = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: "ĐẢNG CỘNG SẢN VIỆT NAM",
        font: FONT, size: 32, bold: true
      })]
    }),
    shapePlaceholder(5.5),
  ];

  // ── ROW 2: Document number + date ──
  const r2Left = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 0 },
      children: [new TextRun({ text: soKyHieu, font: FONT, size: 26 })]
    })
  ];

  const r2Right = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 0 },
      children: [new TextRun({
        text: `${diaDanh}, ${ngayThang}`,
        font: FONT, size: 28, italics: true
      })]
    })
  ];

  return layoutTable([
    new TableRow({ children: [layoutCell(r1Left, LEFT_COL), layoutCell(r1Right, RIGHT_COL)] }),
    new TableRow({ children: [layoutCell(r2Left, LEFT_COL), layoutCell(r2Right, RIGHT_COL)] }),
  ]);
}
```

---

## 4. Footer (Recipients + Signatory)

Same hidden-border, 1-row, 2-column table. Left column = "Nơi nhận:" with the
recipient list. Right column = authority prefix, title, signature space, and name.

```javascript
function createFooter(noiNhanList, quyenHan, chucVu, hoTen) {
  // --- Left column: Nơi nhận ---
  const leftChildren = [
    new Paragraph({
      spacing: { before: 240, after: 0 },
      children: [new TextRun({
        text: "Nơi nhận:",
        font: FONT, size: 24, bold: true, italics: true // 12pt
      })]
    })
  ];
  (noiNhanList || []).forEach(item => {
    leftChildren.push(new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: `- ${item}`, font: FONT, size: 22 })] // 11pt
    }));
  });

  // --- Right column: Signatory ---
  const qh = quyenHan ? `${quyenHan} ` : "";
  const rightChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 0 },
      children: [new TextRun({
        text: `${qh}${chucVu}`.toUpperCase(),
        font: FONT, size: 28, bold: true
      })]
    }),
    // 3 blank lines for handwritten signature
    ...Array(3).fill(null).map(() => new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: " ", font: FONT, size: 28 })]
    })),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: hoTen, font: FONT, size: 28, bold: true
      })]
    })
  ];

  return layoutTable([
    new TableRow({
      children: [
        layoutCell(leftChildren, LEFT_COL),
        layoutCell(rightChildren, RIGHT_COL),
      ]
    })
  ]);
}
```

---

## 5. Template: Công văn — Government

Công văn has a unique layout: the "V/v" summary sits under the document number on the left,
and "Kính gửi:" appears centered above the body text.

```javascript
function createCongVan(params) {
  const children = [
    // V/v summary is passed to the header — it sits inside the left cell,
    // below the document number (not as a standalone paragraph)
    createHeaderNhaNuoc(
      params.coQuanChuQuan, params.coQuanBanHanh,
      params.soKyHieu, params.diaDanh, params.ngayThang,
      params.trichYeu // trichYeuCV — placed inside left cell
    ),

    // "Kính gửi:" — centered
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({ text: "Kính gửi: ", font: FONT, size: 26 }),
        new TextRun({ text: params.kinhGui, font: FONT, size: 26 })
      ]
    }),

    // Body paragraphs — justified, indented first line
    ...params.noiDung.map(text => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 0, line: 276 },
      indent: { firstLine: 720 }, // 1.27cm
      children: [new TextRun({ text, font: FONT, size: 26 })]
    })),

    createFooter(params.noiNhanList, params.quyenHan, params.chucVu, params.hoTen)
  ];

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 26, color: "000000" } } } },
    sections: [{
      properties: {
        page: PAGE_A4,
        titlePage: true // suppress page number on first page
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 26 })]
        })] })
      },
      children
    }]
  });
}
```

**Usage**:
```javascript
const doc = createCongVan({
  coQuanChuQuan: "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
  coQuanBanHanh: "TRƯỜNG ĐẠI HỌC ABC",
  soKyHieu: "Số: 1234/ĐHABC-VP",
  diaDanh: "Hà Nội",
  ngayThang: "ngày 05 tháng 03 năm 2024",
  trichYeu: "triển khai kế hoạch năm học mới 2024-2025",
  kinhGui: "Sở Giáo dục và Đào tạo thành phố Hà Nội",
  noiDung: [
    "Thực hiện chỉ đạo của Bộ Giáo dục và Đào tạo về việc triển khai kế hoạch năm học mới, Trường Đại học ABC kính báo cáo các nội dung sau:",
    "Nhà trường đã hoàn thành công tác chuẩn bị cho năm học mới.",
    "Kính đề nghị Sở Giáo dục và Đào tạo xem xét và hỗ trợ.",
    "Trân trọng./."
  ],
  noiNhanList: ["Như trên;", "Ban Giám hiệu (để báo cáo);", "Lưu: VT, VP. 20b."],
  quyenHan: "TL.",
  chucVu: "HIỆU TRƯỞNG",
  hoTen: "Nguyễn Văn A"
});
Packer.toBuffer(doc).then(buf => fs.writeFileSync("cong-van.docx", buf));
```

---

## 6. Template: Quyết định — Government

Quyết định has "Căn cứ" (legal basis, italic) and numbered "Điều" articles.

```javascript
function createQuyetDinh(params) {
  const children = [
    createHeaderNhaNuoc(
      params.coQuanChuQuan, params.coQuanBanHanh,
      params.soKyHieu, params.diaDanh, params.ngayThang
    ),

    // "QUYẾT ĐỊNH"
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 0 },
      children: [new TextRun({ text: "QUYẾT ĐỊNH", font: FONT, size: 28, bold: true })]
    }),
    // Trích yếu
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: params.trichYeu, font: FONT, size: 28, bold: true })]
    }),
    // Shape line under trích yếu (~3cm, placeholder for post-processing)
    shapePlaceholder(3.0),

    // Signatory title (e.g., "GIÁM ĐỐC SỞ GIÁO DỤC VÀ ĐÀO TẠO")
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [new TextRun({
        text: params.chucVu.toUpperCase(), font: FONT, size: 28, bold: true
      })]
    }),
  ];

  // Căn cứ (legal basis) — italic
  (params.canCuList || []).forEach(canCu => {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 60, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({ text: `Căn cứ ${canCu};`, font: FONT, size: 26, italics: true })]
    }));
  });

  if (params.theoDeNghi) {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 60, after: 120, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({
        text: `Theo đề nghị ${params.theoDeNghi}.`, font: FONT, size: 26, italics: true
      })]
    }));
  }

  // "QUYẾT ĐỊNH:" label
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text: "QUYẾT ĐỊNH:", font: FONT, size: 28, bold: true })]
  }));

  // Điều articles — "Điều X." is inline bold text (convention)
  (params.dieuList || []).forEach((dieu, i) => {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [
        new TextRun({ text: `Điều ${i + 1}. `, font: FONT, size: 26, bold: true }),
        new TextRun({ text: dieu, font: FONT, size: 26 })
      ]
    }));
  });

  children.push(createFooter(params.noiNhanList, params.quyenHan, params.chucVu, params.hoTen));

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 26, color: "000000" } } } },
    sections: [{ properties: { page: PAGE_A4, titlePage: true },
      headers: { default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 26 })]
      })] }) },
      children
    }]
  });
}
```

---

## 7. Template: Nghị quyết — Party

Party documents use `createHeaderDang` and slightly larger font sizes (16pt for doc type).

```javascript
function createNghiQuyetDang(params) {
  const children = [
    createHeaderDang(
      params.toChucCapTren, params.toChucBanHanh,
      params.soKyHieu, params.diaDanh, params.ngayThang
    ),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 0 },
      children: [new TextRun({ text: "NGHỊ QUYẾT", font: FONT, size: 32, bold: true })] // 16pt
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: params.trichYeu, font: FONT, size: 28, bold: true })]
    }),
    // Shape line under trích yếu (~3cm, placeholder for post-processing)
    shapePlaceholder(3.0),

    ...params.noiDung.map(text => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({ text, font: FONT, size: 28 })] // 14pt for Party docs
    })),

    createFooter(params.noiNhanList, params.quyenHan, params.chucVu, params.hoTen)
  ];

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 28, color: "000000" } } } },
    sections: [{ properties: { page: PAGE_A4, titlePage: true },
      headers: { default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 26 })]
      })] }) },
      children
    }]
  });
}
```

---

## 8. Generic Template

Works for Báo cáo, Tờ trình, Thông báo, Kế hoạch, Chỉ thị, Hướng dẫn, and most other types.
Pass the document type name and it builds the right structure.

```javascript
function createGeneric(params, tenLoaiVB, isDang = false) {
  const header = isDang
    ? createHeaderDang(params.coQuanChuQuan, params.coQuanBanHanh,
        params.soKyHieu, params.diaDanh, params.ngayThang)
    : createHeaderNhaNuoc(params.coQuanChuQuan, params.coQuanBanHanh,
        params.soKyHieu, params.diaDanh, params.ngayThang);

  const bodySize = isDang ? 28 : 26; // Party: 14pt, Government: 13pt
  const titleSize = isDang ? 32 : 28;

  const children = [
    header,
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 0 },
      children: [new TextRun({
        text: tenLoaiVB.toUpperCase(), font: FONT, size: titleSize, bold: true
      })]
    }),
  ];

  if (params.trichYeu) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: params.trichYeu, font: FONT, size: 28, bold: true })]
      }),
      // Shape line under trích yếu (~3cm, placeholder for post-processing)
      shapePlaceholder(3.0)
    );
  }

  // "Kính gửi:" for Tờ trình
  if (params.kinhGui) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: "Kính gửi: ", font: FONT, size: bodySize }),
        new TextRun({ text: params.kinhGui, font: FONT, size: bodySize })
      ]
    }));
  }

  (params.noiDung || []).forEach(text => {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({ text, font: FONT, size: bodySize })]
    }));
  });

  children.push(createFooter(params.noiNhanList, params.quyenHan, params.chucVu, params.hoTen));

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: bodySize, color: "000000" } } } },
    sections: [{ properties: { page: PAGE_A4, titlePage: true },
      headers: { default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 26 })]
      })] }) },
      children
    }]
  });
}
```

---

## 9. Body Content Patterns

### Outline-numbered sections (for Kế hoạch, Báo cáo, etc.)

When the body has sections like I, II, III with sub-items 1, 2, 3 and a), b), c),
use Word's numbering system so users can continue numbering or re-indent in Word:

```javascript
// Define in the Document config:
numbering: {
  config: [
    {
      reference: "khoan-list",
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    },
    {
      reference: "diem-list",
      levels: [{
        level: 0,
        format: LevelFormat.LOWER_LETTER,
        text: "%1)",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
      }]
    }
  ]
}

// Use in body:
new Paragraph({
  numbering: { reference: "khoan-list", level: 0 },
  children: [new TextRun({ text: "Nội dung khoản", font: FONT, size: 26 })]
})
```

### Roman-numeral section headings (I., II., III.)

These are typically typed as bold text, not generated by a numbering config,
because Vietnamese documents use the Roman numeral as part of the heading text:

```javascript
new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { before: 240, after: 120 },
  indent: { firstLine: 720 },
  children: [new TextRun({
    text: "I. TÌNH HÌNH CHUNG",
    font: FONT, size: 26, bold: true
  })]
})
```

### Closing phrase

Documents end with "Trân trọng./." or similar. The "./." is part of the last paragraph,
not a separate element:

```javascript
new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { before: 120, after: 0 },
  indent: { firstLine: 720 },
  children: [new TextRun({ text: "Trân trọng./.", font: FONT, size: 26 })]
})
```
