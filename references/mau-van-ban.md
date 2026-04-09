# Document Templates — docx-js Code

Reusable docx-js code for Vietnamese administrative documents. All templates produce Word-native
formatting: hidden-border tables for layout, paragraph-border underlines the user can resize,
proper numbering configs for lists — nothing that breaks when someone opens the file in Word.

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
        AlignmentType, WidthType, BorderStyle, Header, Footer,
        PageNumber, PageBreak, LevelFormat, SectionType } = require('docx');
const fs = require('fs');

const FONT = "Times New Roman";

// A4 content area with 30mm left, 15mm right margins
const CONTENT_WIDTH = 9355; // DXA
const LEFT_COL = 4677;
const RIGHT_COL = 4678;

// Hidden borders for layout tables
const NO_BORDER = { style: BorderStyle.NONE, size: 0 };
const NO_BORDERS = {
  top: NO_BORDER, bottom: NO_BORDER,
  left: NO_BORDER, right: NO_BORDER
};

// A4 page config per NĐ 30/2020
const PAGE_A4 = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1134, bottom: 1134, left: 1701, right: 850 }
};
```

### Underline helper

The underlines in Vietnamese administrative documents (below tiêu ngữ, below authority name,
below trích yếu) are implemented as **empty paragraphs with a bottom border**. The indent
controls how wide the line appears — the user can later change the indent in Word to make
the line longer or shorter.

```javascript
/**
 * Creates an editable underline (empty paragraph with bottom border).
 * @param {number} indentLeft  - Left indent in DXA (bigger = shorter line)
 * @param {number} indentRight - Right indent in DXA (bigger = shorter line)
 */
function underline(indentLeft = 600, indentRight = 600) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    indent: { left: indentLeft, right: indentRight },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 }
    },
    children: []
  });
}

// Preset widths:
// Full-width (for tiêu ngữ):     underline(200, 200)
// Medium (for authority name):    underline(800, 800)   — about 1/3 to 1/2 of column
// Short (for trích yếu):         underline(1000, 1000)
```

---

## 2. Government Header

Two-column borderless table. Left = authority name stack. Right = national emblem stack.
Each column is independently centered. The underlines are real paragraph borders that
can be resized by changing their indent in Word.

```javascript
function createHeaderNhaNuoc(coQuanChuQuan, coQuanBanHanh, soKyHieu, diaDanh, ngayThang) {

  // --- Row 1: Parent authority (left) | Quốc hiệu (right) ---
  const row1 = new TableRow({ children: [
    new TableCell({
      borders: NO_BORDERS,
      width: { size: LEFT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({
          text: coQuanChuQuan.toUpperCase(),
          font: FONT, size: 26 // 13pt, NOT bold
        })]
      })]
    }),
    new TableCell({
      borders: NO_BORDERS,
      width: { size: RIGHT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({
          text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
          font: FONT, size: 26, bold: true // 13pt, bold
        })]
      })]
    })
  ]});

  // --- Row 2: Issuing authority + underline (left) | Tiêu ngữ + underline (right) ---
  const row2 = new TableRow({ children: [
    new TableCell({
      borders: NO_BORDERS,
      width: { size: LEFT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({
            text: coQuanBanHanh.toUpperCase(),
            font: FONT, size: 26, bold: true // 13pt, bold
          })]
        }),
        // Underline: ~1/3 of column width
        underline(1200, 1200)
      ]
    }),
    new TableCell({
      borders: NO_BORDERS,
      width: { size: RIGHT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({
            text: "Độc lập - Tự do - Hạnh phúc",
            font: FONT, size: 28, bold: true // 14pt, bold
          })]
        }),
        // Underline: roughly same width as the motto text
        underline(200, 200)
      ]
    })
  ]});

  // --- Row 3: Document number (left) | Place and date (right) ---
  const row3 = new TableRow({ children: [
    new TableCell({
      borders: NO_BORDERS,
      width: { size: LEFT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 0 },
        children: [new TextRun({
          text: soKyHieu,
          font: FONT, size: 26 // 13pt
        })]
      })]
    }),
    new TableCell({
      borders: NO_BORDERS,
      width: { size: RIGHT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 0 },
        children: [new TextRun({
          text: `${diaDanh}, ${ngayThang}`,
          font: FONT, size: 28, italics: true // 14pt, italic
        })]
      })]
    })
  ]});

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows: [row1, row2, row3]
  });
}
```

---

## 3. Party Header

Same two-column approach. Right side has "ĐẢNG CỘNG SẢN VIỆT NAM" instead of Quốc hiệu.
Left side has the asterisk (*) separator instead of an underline.

```javascript
function createHeaderDang(toChucCapTren, toChucBanHanh, soKyHieu, diaDanh, ngayThang) {

  const row1 = new TableRow({ children: [
    new TableCell({
      borders: NO_BORDERS,
      width: { size: LEFT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({
          text: toChucCapTren.toUpperCase(),
          font: FONT, size: 28 // 14pt, NOT bold
        })]
      })]
    }),
    new TableCell({
      borders: NO_BORDERS,
      width: { size: RIGHT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({
          text: "ĐẢNG CỘNG SẢN VIỆT NAM",
          font: FONT, size: 32, bold: true // 16pt, bold
        })]
      })]
    })
  ]});

  const row2 = new TableRow({ children: [
    // Left: issuing org + asterisk
    new TableCell({
      borders: NO_BORDERS,
      width: { size: LEFT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [
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
      ]
    }),
    // Right: underline + date
    new TableCell({
      borders: NO_BORDERS,
      width: { size: RIGHT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [
        underline(200, 200),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 0 },
          children: [new TextRun({
            text: `${diaDanh}, ${ngayThang}`,
            font: FONT, size: 28, italics: true
          })]
        })
      ]
    })
  ]});

  const row3 = new TableRow({ children: [
    new TableCell({
      borders: NO_BORDERS,
      width: { size: LEFT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 0 },
        children: [new TextRun({ text: soKyHieu, font: FONT, size: 26 })]
      })]
    }),
    new TableCell({
      borders: NO_BORDERS,
      width: { size: RIGHT_COL, type: WidthType.DXA },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({ spacing: { after: 0 }, children: [] })]
    })
  ]});

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows: [row1, row2, row3]
  });
}
```

---

## 4. Footer (Recipients + Signatory)

Same hidden-table approach. Left column = "Nơi nhận:" with the recipient list.
Right column = authority prefix, title, signature space, and name.

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

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows: [new TableRow({ children: [
      new TableCell({
        borders: NO_BORDERS,
        width: { size: LEFT_COL, type: WidthType.DXA },
        verticalAlign: "top",
        children: leftChildren
      }),
      new TableCell({
        borders: NO_BORDERS,
        width: { size: RIGHT_COL, type: WidthType.DXA },
        verticalAlign: "top",
        children: rightChildren
      })
    ]})]
  });
}
```

---

## 5. Template: Công văn — Government

Công văn has a unique layout: the "V/v" summary sits under the document number on the left,
and "Kính gửi:" appears centered above the body text.

```javascript
function createCongVan(params) {
  const children = [
    createHeaderNhaNuoc(
      params.coQuanChuQuan, params.coQuanBanHanh,
      params.soKyHieu, params.diaDanh, params.ngayThang
    ),

    // "V/v" summary — below document number, left-aligned
    new Paragraph({
      spacing: { before: 60, after: 240 },
      children: [new TextRun({
        text: `V/v ${params.trichYeu}`,
        font: FONT, size: 24 // 12pt
      })]
    }),

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
        titlePage: true // suppress header on first page
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
    underline(1000, 1000),

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

  // Điều articles — "Điều X." is inline bold text (this is the convention)
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
    underline(1000, 1000),

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
      underline(1000, 1000)
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
