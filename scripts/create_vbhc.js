#!/usr/bin/env node
/**
 * Vietnamese Administrative Document Generator
 * Compliant with Nghị định 30/2020/NĐ-CP and Hướng dẫn 36-HD/VPTW
 *
 * Usage: node create_vbhc.js --config config.json --output output.docx
 *
 * config.json fields:
 * {
 *   "loai": "cong-van" | "quyet-dinh" | "to-trinh" | "bao-cao" | "thong-bao" |
 *           "ke-hoach" | "bien-ban" | "nghi-quyet-dang" | "cong-van-dang" | ...,
 *   "heTieuChuan": "nha-nuoc" | "dang",
 *   "coQuanChuQuan": "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
 *   "coQuanBanHanh": "TRƯỜNG ĐẠI HỌC ABC",
 *   "soKyHieu": "Số: 1234/BGDĐT-VP",
 *   "diaDanh": "Hà Nội",
 *   "ngayThang": "ngày 05 tháng 03 năm 2024",
 *   "trichYeu": "...",
 *   "kinhGui": "..." (only for công văn),
 *   "noiDung": ["Paragraph 1", "Paragraph 2", ...],
 *   "canCuList": [...] (only for quyết định),
 *   "dieuList": [...] (only for quyết định),
 *   "theoDeNghi": "..." (only for quyết định),
 *   "noiNhanList": ["Như trên;", "Lưu: VT, VP."],
 *   "quyenHan": "TM." | "KT." | "TL." | "T/M" | "K/T" | "T/L" | null,
 *   "chucVu": "GIÁM ĐỐC",
 *   "hoTen": "Nguyễn Văn A"
 * }
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, Header, PageNumber,
        LevelFormat } = require('docx');
const fs = require('fs');

// ============================================================
// CONSTANTS
// ============================================================
const FONT = "Times New Roman";
const CONTENT_WIDTH = 9355; // DXA — A4 content area with 30mm left, 15mm right margins
const LEFT_COL = 4677;      // ~50%
const RIGHT_COL = 4678;     // ~50%
const NO_BORDER = { style: BorderStyle.NONE, size: 0 };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
const CELL_MARGINS = { top: 0, bottom: 0, left: 0, right: 0 };

// A4 page configuration per NĐ 30/2020
const PAGE_A4 = {
  size: { width: 11906, height: 16838 }, // 210mm × 297mm
  margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } // 20/20/30/15mm
};

// Page header: page number centered, starting from page 2
const PAGE_HEADER = new Header({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      children: [PageNumber.CURRENT],
      font: FONT, size: 26
    })]
  })]
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Creates an editable underline (empty paragraph with bottom border).
 * The indent controls visible width — bigger indent = shorter line.
 * In Word, users can change the indent to resize the line.
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

/**
 * Shorthand for a single-run paragraph.
 */
function p(text, opts = {}) {
  const {
    alignment = AlignmentType.JUSTIFIED,
    size = 26, bold = false, italics = false,
    spacing = { before: 120, after: 0, line: 276 },
    indent = null, center = false
  } = opts;

  return new Paragraph({
    alignment: center ? AlignmentType.CENTER : alignment,
    spacing,
    ...(indent ? { indent } : {}),
    children: Array.isArray(text) ? text : [new TextRun({
      text, font: FONT, size, bold, italics
    })]
  });
}

// ============================================================
// HEADER BUILDERS
// ============================================================

/**
 * Government document header (NĐ 30/2020)
 * Left column: Cơ quan chủ quản + Cơ quan ban hành + underline
 * Right column: Quốc hiệu + Tiêu ngữ + underline
 */
function buildHeaderNhaNuoc(cfg) {
  const rows = [
    // Row 1: Parent authority (left) | "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({
              text: (cfg.coQuanChuQuan || "").toUpperCase(),
              font: FONT, size: 26
            })]
          })]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({
              text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
              font: FONT, size: 26, bold: true
            })]
          })]
        })
      ]
    }),
    // Row 2: Issuing authority + underline (left) | Tiêu ngữ + underline (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
              children: [new TextRun({
                text: (cfg.coQuanBanHanh || "").toUpperCase(),
                font: FONT, size: 26, bold: true
              })]
            }),
            underline(1200, 1200) // ~1/3 of column width
          ]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
              children: [new TextRun({
                text: "Độc lập - Tự do - Hạnh phúc",
                font: FONT, size: 28, bold: true
              })]
            }),
            underline(200, 200) // roughly same width as motto text
          ]
        })
      ]
    }),
    // Row 3: Document number (left) | Place and date (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 0 },
            children: [new TextRun({
              text: cfg.soKyHieu || "",
              font: FONT, size: 26
            })]
          })]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 0 },
            children: [new TextRun({
              text: `${cfg.diaDanh}, ${cfg.ngayThang}`,
              font: FONT, size: 28, italics: true
            })]
          })]
        })
      ]
    })
  ];

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows
  });
}

/**
 * Party document header (HD 36-HD/VPTW)
 * Left column: Tổ chức Đảng cấp trên + Tổ chức ban hành + dấu sao (*)
 * Right column: "ĐẢNG CỘNG SẢN VIỆT NAM" + underline + địa danh ngày tháng
 */
function buildHeaderDang(cfg) {
  const rows = [
    // Row 1: Superior Party org (left) | "ĐẢNG CỘNG SẢN VIỆT NAM" (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({
              text: (cfg.coQuanChuQuan || "").toUpperCase(),
              font: FONT, size: 28
            })]
          })]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({
              text: "ĐẢNG CỘNG SẢN VIỆT NAM",
              font: FONT, size: 32, bold: true
            })]
          })]
        })
      ]
    }),
    // Row 2: Issuing org + asterisk (left) | Underline + date (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
              children: [new TextRun({
                text: (cfg.coQuanBanHanh || "").toUpperCase(),
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
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [
            underline(200, 200),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 0 },
              children: [new TextRun({
                text: `${cfg.diaDanh}, ${cfg.ngayThang}`,
                font: FONT, size: 28, italics: true
              })]
            })
          ]
        })
      ]
    }),
    // Row 3: Document number (left)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 0 },
            children: [new TextRun({
              text: cfg.soKyHieu || "",
              font: FONT, size: 26
            })]
          })]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          children: [new Paragraph({ spacing: { after: 0 }, children: [] })]
        })
      ]
    })
  ];

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows
  });
}

// ============================================================
// FOOTER BUILDER (Nơi nhận + Chữ ký)
// ============================================================

function buildFooter(cfg) {
  // Left column: Nơi nhận (recipients)
  const noiNhanChildren = [
    new Paragraph({
      spacing: { before: 240, after: 0 },
      children: [new TextRun({
        text: "Nơi nhận:",
        font: FONT, size: 24, bold: true, italics: true
      })]
    })
  ];
  (cfg.noiNhanList || []).forEach(item => {
    noiNhanChildren.push(new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: `- ${item}`, font: FONT, size: 22 })]
    }));
  });

  // Right column: Signatory block
  const qh = cfg.quyenHan ? `${cfg.quyenHan} ` : "";
  const chuKyChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 0 },
      children: [new TextRun({
        text: `${qh}${cfg.chucVu || ""}`.toUpperCase(),
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
        text: cfg.hoTen || "",
        font: FONT, size: 28, bold: true
      })]
    })
  ];

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          verticalAlign: "top",
          children: noiNhanChildren
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          margins: CELL_MARGINS,
          verticalAlign: "top",
          children: chuKyChildren
        })
      ]
    })]
  });
}

// ============================================================
// DOCUMENT BUILDERS
// ============================================================

function buildCongVan(cfg) {
  const isDang = cfg.heTieuChuan === "dang";
  const header = isDang ? buildHeaderDang(cfg) : buildHeaderNhaNuoc(cfg);
  const children = [header];

  // "V/v" summary (government công văn only)
  if (!isDang && cfg.trichYeu) {
    children.push(new Paragraph({
      spacing: { before: 60, after: 240 },
      children: [new TextRun({
        text: `V/v ${cfg.trichYeu}`,
        font: FONT, size: 24
      })]
    }));
  }

  // "Kính gửi:" — centered
  if (cfg.kinhGui) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({ text: "Kính gửi: ", font: FONT, size: 26 }),
        new TextRun({ text: cfg.kinhGui, font: FONT, size: 26 })
      ]
    }));
  }

  // Body paragraphs — justified, 1.27cm first-line indent
  (cfg.noiDung || []).forEach(text => {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({ text, font: FONT, size: 26 })]
    }));
  });

  children.push(buildFooter(cfg));
  return children;
}

function buildQuyetDinh(cfg) {
  const isDang = cfg.heTieuChuan === "dang";
  const header = isDang ? buildHeaderDang(cfg) : buildHeaderNhaNuoc(cfg);
  const titleSize = isDang ? 32 : 28;
  const children = [header];

  // Document type: "QUYẾT ĐỊNH"
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 0 },
    children: [new TextRun({
      text: "QUYẾT ĐỊNH", font: FONT, size: titleSize, bold: true
    })]
  }));

  // Summary + underline
  if (cfg.trichYeu) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: cfg.trichYeu, font: FONT, size: 28, bold: true
      })]
    }));
    children.push(underline(1000, 1000));
  }

  // Signatory title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    children: [new TextRun({
      text: (cfg.chucVu || "").toUpperCase(),
      font: FONT, size: 28, bold: true
    })]
  }));

  // Legal basis ("Căn cứ") — italic
  (cfg.canCuList || []).forEach(canCu => {
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
  if (cfg.theoDeNghi) {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 60, after: 120, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({
        text: `Theo đề nghị ${cfg.theoDeNghi}.`,
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

  // Articles (Điều) — "Điều X." is inline bold text (convention)
  (cfg.dieuList || []).forEach((dieu, i) => {
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

  children.push(buildFooter(cfg));
  return children;
}

function buildGeneric(cfg, tenLoaiVB) {
  const isDang = cfg.heTieuChuan === "dang";
  const header = isDang ? buildHeaderDang(cfg) : buildHeaderNhaNuoc(cfg);
  const bodySize = isDang ? 28 : 26;
  const titleSize = isDang ? 32 : 28;
  const children = [header];

  // Document type name
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 0 },
    children: [new TextRun({
      text: tenLoaiVB.toUpperCase(),
      font: FONT, size: titleSize, bold: true
    })]
  }));

  // Summary + underline
  if (cfg.trichYeu) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: cfg.trichYeu, font: FONT, size: 28, bold: true
      })]
    }));
    children.push(underline(1000, 1000));
  }

  // "Kính gửi:" (for Tờ trình, etc.)
  if (cfg.kinhGui) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 120 },
      children: [
        new TextRun({ text: "Kính gửi: ", font: FONT, size: bodySize }),
        new TextRun({ text: cfg.kinhGui, font: FONT, size: bodySize })
      ]
    }));
  }

  // Body paragraphs
  (cfg.noiDung || []).forEach(text => {
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 120, after: 0, line: 276 },
      indent: { firstLine: 720 },
      children: [new TextRun({ text, font: FONT, size: bodySize })]
    }));
  });

  children.push(buildFooter(cfg));
  return children;
}

// ============================================================
// DOCUMENT TYPE MAP
// ============================================================

const LOAI_VB_MAP = {
  // Government documents
  "cong-van":         { builder: buildCongVan },
  "quyet-dinh":       { builder: buildQuyetDinh },
  "to-trinh":         { builder: (cfg) => buildGeneric(cfg, "Tờ trình") },
  "bao-cao":          { builder: (cfg) => buildGeneric(cfg, "Báo cáo") },
  "thong-bao":        { builder: (cfg) => buildGeneric(cfg, "Thông báo") },
  "ke-hoach":         { builder: (cfg) => buildGeneric(cfg, "Kế hoạch") },
  "bien-ban":         { builder: (cfg) => buildGeneric(cfg, "Biên bản") },
  "chi-thi":          { builder: (cfg) => buildGeneric(cfg, "Chỉ thị") },
  "huong-dan":        { builder: (cfg) => buildGeneric(cfg, "Hướng dẫn") },
  "chuong-trinh":     { builder: (cfg) => buildGeneric(cfg, "Chương trình") },
  "quy-che":          { builder: (cfg) => buildGeneric(cfg, "Quy chế") },
  "quy-dinh-vb":      { builder: (cfg) => buildGeneric(cfg, "Quy định") },
  "nghi-quyet":       { builder: (cfg) => buildGeneric(cfg, "Nghị quyết") },
  "hop-dong":         { builder: (cfg) => buildGeneric(cfg, "Hợp đồng") },
  "giay-moi":         { builder: (cfg) => buildGeneric(cfg, "Giấy mời") },
  "giay-gioi-thieu":  { builder: (cfg) => buildGeneric(cfg, "Giấy giới thiệu") },
  "giay-uy-quyen":    { builder: (cfg) => buildGeneric(cfg, "Giấy ủy quyền") },
  "cong-dien":        { builder: (cfg) => buildGeneric(cfg, "Công điện") },
  "phuong-an":        { builder: (cfg) => buildGeneric(cfg, "Phương án") },
  "de-an":            { builder: (cfg) => buildGeneric(cfg, "Đề án") },
  // Party documents
  "nghi-quyet-dang":  { builder: (cfg) => buildGeneric({...cfg, heTieuChuan: "dang"}, "Nghị quyết") },
  "cong-van-dang":    { builder: (cfg) => buildCongVan({...cfg, heTieuChuan: "dang"}) },
  "chi-thi-dang":     { builder: (cfg) => buildGeneric({...cfg, heTieuChuan: "dang"}, "Chỉ thị") },
  "ket-luan-dang":    { builder: (cfg) => buildGeneric({...cfg, heTieuChuan: "dang"}, "Kết luận") },
  "thong-bao-dang":   { builder: (cfg) => buildGeneric({...cfg, heTieuChuan: "dang"}, "Thông báo") },
};

// ============================================================
// MAIN
// ============================================================

function createDocument(cfg) {
  const loai = cfg.loai || "cong-van";
  const entry = LOAI_VB_MAP[loai];
  if (!entry) {
    throw new Error(`Unsupported document type: ${loai}. Supported: ${Object.keys(LOAI_VB_MAP).join(", ")}`);
  }

  const isDang = cfg.heTieuChuan === "dang" || loai.endsWith("-dang");
  const bodySize = isDang ? 28 : 26;
  const children = entry.builder(cfg);

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: bodySize, color: "000000" }
        }
      }
    },
    sections: [{
      properties: {
        page: PAGE_A4,
        titlePage: true // suppress page number on first page
      },
      headers: {
        default: PAGE_HEADER
      },
      children
    }]
  });
}

async function main() {
  const args = process.argv.slice(2);
  let configPath = null;
  let outputPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--config" && args[i + 1]) configPath = args[++i];
    if (args[i] === "--output" && args[i + 1]) outputPath = args[++i];
  }

  if (!configPath || !outputPath) {
    console.log("Usage: node create_vbhc.js --config config.json --output output.docx");
    process.exit(1);
  }

  const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const doc = createDocument(cfg);
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created: ${outputPath}`);
}

// Export for use as a module
module.exports = {
  createDocument, buildHeaderNhaNuoc, buildHeaderDang, buildFooter,
  buildCongVan, buildQuyetDinh, buildGeneric, underline,
  LOAI_VB_MAP, PAGE_A4, FONT
};

// Run from command line
if (require.main === module) {
  main().catch(console.error);
}
