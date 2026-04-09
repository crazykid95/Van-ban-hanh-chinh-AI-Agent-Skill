# Document Templates — docx-js Code

This file contains reusable docx-js code for generating Vietnamese administrative documents.
When creating a document, copy the shared utility functions and the relevant template, then customize the content.

## Table of Contents

1. [Shared Utility Functions](#1-shared-utility-functions)
2. [Template: Công văn (Official Letter) — Government](#2-template-công-văn-official-letter--government)
3. [Template: Quyết định (Decision) — Government](#3-template-quyết-định-decision--government)
4. [Template: Tờ trình (Submission) — Government](#4-template-tờ-trình-submission--government)
5. [Template: Báo cáo (Report) — Government](#5-template-báo-cáo-report--government)
6. [Template: Thông báo (Notice) — Government](#6-template-thông-báo-notice--government)
7. [Template: Kế hoạch (Plan) — Government](#7-template-kế-hoạch-plan--government)
8. [Template: Nghị quyết Đảng (Party Resolution)](#8-template-nghị-quyết-đảng-party-resolution)
9. [Template: Công văn Đảng (Party Official Letter)](#9-template-công-văn-đảng-party-official-letter)
10. [Usage Notes](#10-usage-notes)

---

## 1. Shared Utility Functions

### Constants and imports

```javascript
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, HeadingLevel, ShadingType,
        Header, Footer, PageNumber, PageBreak, LevelFormat } = require('docx');
const fs = require('fs');

// ============================================================
// CONSTANTS — Standard parameters per NĐ 30/2020
// ============================================================
const FONT = "Times New Roman";
const CONTENT_WIDTH = 9355; // DXA — Content area for A4 with 30mm left, 15mm right margins
const LEFT_COL = 4677;      // ~50% of content width
const RIGHT_COL = 4678;     // ~50% of content width
const NO_BORDER = { style: BorderStyle.NONE, size: 0 };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
```

### Government document header builder

Uses a borderless table to create the two-column layout (left = authority name, right = national emblem).

```javascript
function createHeaderNhaNuoc(coQuanChuQuan, coQuanBanHanh, soKyHieu, diaDanh, ngayThang) {
  // Row 1: Parent authority (left) | Quốc hiệu (right)
  const row1 = new TableRow({
    children: [
      new TableCell({
        borders: NO_BORDERS,
        width: { size: LEFT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({
              text: coQuanChuQuan.toUpperCase(),
              font: FONT, size: 26, bold: false // 13pt, NOT bold
            })]
          })
        ]
      }),
      new TableCell({
        borders: NO_BORDERS,
        width: { size: RIGHT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({
              text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
              font: FONT, size: 26, bold: true // 13pt, bold
            })]
          })
        ]
      })
    ]
  });

  // Row 2: Issuing authority + rule (left) | Tiêu ngữ + rule (right)
  const row2 = new TableRow({
    children: [
      new TableCell({
        borders: NO_BORDERS,
        width: { size: LEFT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({
              text: coQuanBanHanh.toUpperCase(),
              font: FONT, size: 26, bold: true // 13pt, bold
            })]
          }),
          // Horizontal rule below authority name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
            children: []
          })
        ]
      }),
      new TableCell({
        borders: NO_BORDERS,
        width: { size: RIGHT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({
              text: "Độc lập - Tự do - Hạnh phúc",
              font: FONT, size: 28, bold: true // 14pt, bold
            })]
          }),
          // Horizontal rule below motto
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
            children: []
          })
        ]
      })
    ]
  });

  // Row 3: Document number/code (left) | Place and date (right)
  const row3 = new TableRow({
    children: [
      new TableCell({
        borders: NO_BORDERS,
        width: { size: LEFT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 0 },
            children: [new TextRun({
              text: soKyHieu,
              font: FONT, size: 26 // 13pt
            })]
          })
        ]
      }),
      new TableCell({
        borders: NO_BORDERS,
        width: { size: RIGHT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 0 },
            children: [new TextRun({
              text: `${diaDanh}, ${ngayThang}`,
              font: FONT, size: 28, italics: true // 14pt, italic
            })]
          })
        ]
      })
    ]
  });

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows: [row1, row2, row3]
  });
}
```

### Party document header builder

```javascript
function createHeaderDang(toChucCapTren, toChucBanHanh, soKyHieu, diaDanh, ngayThang) {
  // Row 1: Superior Party org (left) | "ĐẢNG CỘNG SẢN VIỆT NAM" (right)
  const row1 = new TableRow({
    children: [
      new TableCell({
        borders: NO_BORDERS,
        width: { size: LEFT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({
              text: toChucCapTren.toUpperCase(),
              font: FONT, size: 28 // 14pt, NOT bold
            })]
          })
        ]
      }),
      new TableCell({
        borders: NO_BORDERS,
        width: { size: RIGHT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({
              text: "ĐẢNG CỘNG SẢN VIỆT NAM",
              font: FONT, size: 32, bold: true // 16pt, bold
            })]
          })
        ]
      })
    ]
  });

  // Row 2: Issuing org + asterisk (left) | Rule + date (right)
  const row2 = new TableRow({
    children: [
      new TableCell({
        borders: NO_BORDERS,
        width: { size: LEFT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({
              text: toChucBanHanh.toUpperCase(),
              font: FONT, size: 28, bold: true // 14pt, bold
            })]
          }),
          // Asterisk separator
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            children: [new TextRun({
              text: "*",
              font: FONT, size: 28
            })]
          })
        ]
      }),
      new TableCell({
        borders: NO_BORDERS,
        width: { size: RIGHT_COL, type: WidthType.DXA },
        children: [
          // Horizontal rule below "ĐẢNG CỘNG SẢN VIỆT NAM"
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
            children: []
          }),
          // Place and date
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 0 },
            children: [new TextRun({
              text: `${diaDanh}, ${ngayThang}`,
              font: FONT, size: 28, italics: true // 14pt, italic
            })]
          })
        ]
      })
    ]
  });

  // Row 3: Document number/code (left) | Empty (right)
  const row3 = new TableRow({
    children: [
      new TableCell({
        borders: NO_BORDERS,
        width: { size: LEFT_COL, type: WidthType.DXA },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 0 },
            children: [new TextRun({
              text: soKyHieu,
              font: FONT, size: 26 // 13pt
            })]
          })
        ]
      }),
      new TableCell({
        borders: NO_BORDERS,
        width: { size: RIGHT_COL, type: WidthType.DXA },
        children: [new Paragraph({ spacing: { after: 0 }, children: [] })]
      })
    ]
  });

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows: [row1, row2, row3]
  });
}
```

### Document type name and summary builder

```javascript
function createTenLoaiVaTrichYeu(tenLoaiVB, trichYeu, isDang = false) {
  const fontSize = isDang ? 32 : 28; // Party: 16pt, Government: 14pt
  const children = [
    // Document type name
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 0 },
      children: [new TextRun({
        text: tenLoaiVB.toUpperCase(),
        font: FONT, size: fontSize, bold: true
      })]
    })
  ];

  if (trichYeu) {
    children.push(
      // Summary
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({
          text: trichYeu,
          font: FONT, size: 28, bold: true // 14pt, bold
        })]
      }),
      // Horizontal rule below summary
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
        children: []
      })
    );
  }

  return children;
}
```

### Recipient list builder

```javascript
function createNoiNhan(danhSachNoiNhan) {
  // danhSachNoiNhan: ["Như trên;", "UBND tỉnh (để báo cáo);", "Lưu: VT, VP. 20b."]
  const children = [
    new Paragraph({
      spacing: { before: 120, after: 0 },
      children: [new TextRun({
        text: "Nơi nhận:",
        font: FONT, size: 24, bold: true, italics: true // 12pt, bold, italic
      })]
    })
  ];

  danhSachNoiNhan.forEach(noiNhan => {
    children.push(new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: `- ${noiNhan}`,
        font: FONT, size: 22 // 11pt
      })]
    }));
  });

  return children;
}
```

### Footer builder (Recipients + Signatory — two-column layout)

```javascript
function createFooterSection(noiNhanList, quyenHan, chucVu, hoTen, isDang = false) {
  // Build signatory column
  const chuKyChildren = [];

  const qhPrefix = quyenHan ? `${quyenHan} ` : "";
  chuKyChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({
      text: `${qhPrefix}${chucVu}`.toUpperCase(),
      font: FONT, size: 28, bold: true
    })]
  }));

  // Blank space for handwritten signature (3 empty lines)
  for (let i = 0; i < 3; i++) {
    chuKyChildren.push(new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: " ", font: FONT, size: 28 })]
    }));
  }

  // Full name
  chuKyChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({
      text: hoTen,
      font: FONT, size: 28, bold: true
    })]
  }));

  // Two-column table: left = recipients, right = signatory
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows: [new TableRow({
      children: [
        // Left column: Nơi nhận
        new TableCell({
          borders: NO_BORDERS,
          width: { size: LEFT_COL, type: WidthType.DXA },
          verticalAlign: "top",
          children: createNoiNhan(noiNhanList)
        }),
        // Right column: Signatory
        new TableCell({
          borders: NO_BORDERS,
          width: { size: RIGHT_COL, type: WidthType.DXA },
          verticalAlign: "top",
          children: chuKyChildren
        })
      ]
    })]
  });
}
```

---

## 2. Template: Công văn (Official Letter) — Government

Công văn is the most common document type. It has a unique layout with "Kính gửi:" and "V/v".

```javascript
function createCongVan(params) {
  // params: { coQuanChuQuan, coQuanBanHanh, soKyHieu, diaDanh, ngayThang,
  //           trichYeu, kinhGui, noiDungParagraphs, noiNhanList,
  //           quyenHan, chucVu, hoTen }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 26 } } } // 13pt default
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, bottom: 1134, left: 1701, right: 850 }
        }
      },
      children: [
        // Two-column header
        createHeaderNhaNuoc(
          params.coQuanChuQuan,
          params.coQuanBanHanh,
          params.soKyHieu,
          params.diaDanh,
          params.ngayThang
        ),

        // "V/v" summary line — below document number, left-aligned
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

        // Body paragraphs
        ...params.noiDungParagraphs.map(text => new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { before: 120, after: 0, line: 276 },
          indent: { firstLine: 720 },
          children: [new TextRun({ text, font: FONT, size: 26 })]
        })),

        // Footer: Recipients + Signatory
        createFooterSection(
          params.noiNhanList,
          params.quyenHan,
          params.chucVu,
          params.hoTen,
          false // Government document
        )
      ]
    }]
  });

  return doc;
}
```

**Example usage**:
```javascript
const doc = createCongVan({
  coQuanChuQuan: "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
  coQuanBanHanh: "TRƯỜNG ĐẠI HỌC ABC",
  soKyHieu: "Số: 1234/ĐHABC-VP",
  diaDanh: "Hà Nội",
  ngayThang: "ngày 05 tháng 03 năm 2024",
  trichYeu: "triển khai kế hoạch năm học mới 2024-2025",
  kinhGui: "Sở Giáo dục và Đào tạo thành phố Hà Nội",
  noiDungParagraphs: [
    "Thực hiện chỉ đạo của Bộ Giáo dục và Đào tạo về việc triển khai kế hoạch năm học mới 2024-2025, Trường Đại học ABC kính gửi Sở Giáo dục và Đào tạo thành phố Hà Nội các nội dung sau:",
    "Trường Đại học ABC đã hoàn thành công tác chuẩn bị cho năm học mới.",
    "Kính đề nghị Sở Giáo dục và Đào tạo xem xét và hỗ trợ nhà trường.",
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

## 3. Template: Quyết định (Decision) — Government

Quyết định has a special structure with "Căn cứ" (legal basis) and "Điều" (articles).

```javascript
function createQuyetDinh(params) {
  // params: { coQuanChuQuan, coQuanBanHanh, soKyHieu, diaDanh, ngayThang,
  //           trichYeu, canCuList, theoDeNghi, dieuList, noiNhanList,
  //           quyenHan, chucVu, hoTen }

  const children = [
    // Header
    createHeaderNhaNuoc(
      params.coQuanChuQuan, params.coQuanBanHanh,
      params.soKyHieu, params.diaDanh, params.ngayThang
    ),

    // Document type: "QUYẾT ĐỊNH"
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 0 },
      children: [new TextRun({
        text: "QUYẾT ĐỊNH", font: FONT, size: 28, bold: true
      })]
    }),

    // Summary
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: params.trichYeu, font: FONT, size: 28, bold: true
      })]
    }),

    // Horizontal rule
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
      children: []
    }),

    // Signatory title (e.g., "GIÁM ĐỐC SỞ GIÁO DỤC VÀ ĐÀO TẠO")
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({
        text: params.chucVu.toUpperCase(), font: FONT, size: 28, bold: true
      })]
    })
  ];

  // Legal basis ("Căn cứ") — italic
  params.canCuList.forEach(canCu => {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 60, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({
        text: `Căn cứ ${canCu};`,
        font: FONT, size: 26, italics: true
      })]
    }));
  });

  // "Theo đề nghị" — italic
  if (params.theoDeNghi) {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 60, after: 120, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({
        text: `Theo đề nghị ${params.theoDeNghi}.`,
        font: FONT, size: 26, italics: true
      })]
    }));
  }

  // "QUYẾT ĐỊNH:" label
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({
      text: "QUYẾT ĐỊNH:", font: FONT, size: 28, bold: true
    })]
  }));

  // Articles (Điều)
  params.dieuList.forEach((dieu, index) => {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [
        new TextRun({ text: `Điều ${index + 1}. `, font: FONT, size: 26, bold: true }),
        new TextRun({ text: dieu, font: FONT, size: 26 })
      ]
    }));
  });

  // Footer
  children.push(createFooterSection(
    params.noiNhanList, params.quyenHan, params.chucVu, params.hoTen, false
  ));

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 26 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, bottom: 1134, left: 1701, right: 850 }
        }
      },
      children
    }]
  });
}
```

---

## 4. Template: Tờ trình (Submission) — Government

Similar to Công văn but with document type "TỜ TRÌNH" and "Kính gửi:" after the summary.

Structure: Header → "TỜ TRÌNH" → Trích yếu → Kính gửi → Body → Signatory + Recipients

---

## 5. Template: Báo cáo (Report) — Government

Structure: Header → "BÁO CÁO" → Trích yếu → Body (typically with sections I, II, III) → Signatory + Recipients

Body typically includes: I. Tình hình chung, II. Kết quả đạt được, III. Hạn chế, tồn tại, IV. Kiến nghị, đề xuất

---

## 6. Template: Thông báo (Notice) — Government

Simple structure: Header → "THÔNG BÁO" → Trích yếu → Body → Signatory + Recipients

---

## 7. Template: Kế hoạch (Plan) — Government

Structure: Header → "KẾ HOẠCH" → Trích yếu → Body with outline numbering (I. Mục đích, yêu cầu, II. Nội dung, III. Tổ chức thực hiện) → Signatory + Recipients

---

## 8. Template: Nghị quyết Đảng (Party Resolution)

```javascript
function createNghiQuyetDang(params) {
  // params: { toChucCapTren, toChucBanHanh, soKyHieu, diaDanh, ngayThang,
  //           trichYeu, noiDungParagraphs, noiNhanList,
  //           quyenHan, chucVu, hoTen }

  const children = [
    // Party header
    createHeaderDang(
      params.toChucCapTren, params.toChucBanHanh,
      params.soKyHieu, params.diaDanh, params.ngayThang
    ),

    // Document type: "NGHỊ QUYẾT" — 16pt for Party documents
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 0 },
      children: [new TextRun({
        text: "NGHỊ QUYẾT",
        font: FONT, size: 32, bold: true // 16pt, bold
      })]
    }),

    // Summary
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: params.trichYeu, font: FONT, size: 28, bold: true
      })]
    }),

    // Horizontal rule
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
      children: []
    }),

    // Body paragraphs — 14pt for Party documents
    ...params.noiDungParagraphs.map(text => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({ text, font: FONT, size: 28 })] // 14pt
    })),

    // Footer
    createFooterSection(
      params.noiNhanList, params.quyenHan, params.chucVu, params.hoTen, true
    )
  ];

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: 28 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, bottom: 1134, left: 1701, right: 850 }
        }
      },
      children
    }]
  });
}
```

**Example usage**:
```javascript
const doc = createNghiQuyetDang({
  toChucCapTren: "TỈNH ỦY QUẢNG NINH",
  toChucBanHanh: "BAN THƯỜNG VỤ",
  soKyHieu: "Số: 15-NQ/TU",
  diaDanh: "Quảng Ninh",
  ngayThang: "ngày 20 tháng 06 năm 2024",
  trichYeu: "về tăng cường công tác xây dựng Đảng trong tình hình mới",
  noiDungParagraphs: [
    "Thực hiện Nghị quyết Đại hội đại biểu toàn quốc lần thứ XIII của Đảng...",
    "I. TÌNH HÌNH VÀ NGUYÊN NHÂN",
    "Trong thời gian qua, công tác xây dựng Đảng của Đảng bộ tỉnh đã đạt được nhiều kết quả quan trọng.",
    "II. MỤC TIÊU, NHIỆM VỤ VÀ GIẢI PHÁP",
    "1. Mục tiêu chung: Xây dựng Đảng bộ tỉnh trong sạch, vững mạnh toàn diện."
  ],
  noiNhanList: [
    "Các ban đảng Tỉnh ủy;",
    "Các huyện ủy, thị ủy, thành ủy;",
    "Lưu: VT."
  ],
  quyenHan: "T/M BAN THƯỜNG VỤ",
  chucVu: "BÍ THƯ",
  hoTen: "Phạm Văn D"
});
```

---

## 9. Template: Công văn Đảng (Party Official Letter)

Same as government Công văn but with these differences:
1. Use `createHeaderDang` instead of `createHeaderNhaNuoc`
2. Code uses hyphen: `Số: XX-CV/ZZZ`
3. Authority prefix uses slash: `T/M`, `K/T`, `T/L`
4. Body text at 14pt (size: 28) instead of 13pt
5. No "V/v" line — summary is either omitted or placed differently

---

## 10. Usage Notes

When creating a document:

1. **Copy the shared utility functions** (Section 1) into your JavaScript file
2. **Choose the appropriate template** for the document type you need
3. **Replace parameters** with actual content (all Vietnamese text must use proper diacritics)
4. **Validate** after creation: `python scripts/office/validate.py output.docx`

The templates above are foundational frameworks. Depending on the specific content, you may need to add:
- Tables within the body (use bordered Table with proper column widths)
- Appendices (Phụ lục) after the footer section
- Multiple articles (Điều) for Quyết định
- Outline-numbered sections (I, II, III) for Kế hoạch, Báo cáo
- Confidentiality/urgency marks
