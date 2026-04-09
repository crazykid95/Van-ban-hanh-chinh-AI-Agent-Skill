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
 *   "noiNhanList": ["Như trên;", "Lưu: VT, VP."],
 *   "quyenHan": "TM." | "KT." | "TL." | "T/M" | "K/T" | "T/L" | null,
 *   "chucVu": "GIÁM ĐỐC",
 *   "hoTen": "Nguyễn Văn A"
 * }
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, PageBreak } = require('docx');
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

// A4 page configuration per NĐ 30/2020
const PAGE_A4 = {
  size: { width: 11906, height: 16838 }, // 210mm × 297mm
  margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } // 20/20/30/15mm
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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

function separator() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
    children: []
  });
}

// ============================================================
// HEADER BUILDERS
// ============================================================

/**
 * Government document header (NĐ 30/2020)
 * Left column: Cơ quan chủ quản + Cơ quan ban hành
 * Right column: Quốc hiệu + Tiêu ngữ
 */
function buildHeaderNhaNuoc(cfg) {
  const rows = [
    // Row 1: Parent authority (left) | "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          children: [p(cfg.coQuanChuQuan || "", {
            size: 26, center: true, spacing: { before: 0, after: 0 }
          })]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          children: [p("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", {
            size: 26, bold: true, center: true, spacing: { before: 0, after: 0 }
          })]
        })
      ]
    }),
    // Row 2: Issuing authority + rule (left) | Tiêu ngữ + rule (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          children: [
            p(cfg.coQuanBanHanh || "", {
              size: 26, bold: true, center: true, spacing: { before: 0, after: 0 }
            }),
            separator()
          ]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          children: [
            p("Độc lập - Tự do - Hạnh phúc", {
              size: 28, bold: true, center: true, spacing: { before: 0, after: 0 }
            }),
            separator()
          ]
        })
      ]
    }),
    // Row 3: Document number (left) | Place and date (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          children: [p(cfg.soKyHieu || "", {
            size: 26, center: true, spacing: { before: 120, after: 0 }
          })]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          children: [p(`${cfg.diaDanh}, ${cfg.ngayThang}`, {
            size: 28, italics: true, center: true, spacing: { before: 120, after: 0 }
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
 * Right column: "ĐẢNG CỘNG SẢN VIỆT NAM" + đường kẻ + địa danh ngày tháng
 */
function buildHeaderDang(cfg) {
  const rows = [
    // Row 1: Superior Party org (left) | "ĐẢNG CỘNG SẢN VIỆT NAM" (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          children: [p(cfg.coQuanChuQuan || "", {
            size: 28, center: true, spacing: { before: 0, after: 0 }
          })]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          children: [p("ĐẢNG CỘNG SẢN VIỆT NAM", {
            size: 32, bold: true, center: true, spacing: { before: 0, after: 0 }
          })]
        })
      ]
    }),
    // Row 2: Issuing org + asterisk (left) | Rule + date (right)
    new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          children: [
            p(cfg.coQuanBanHanh || "", {
              size: 28, bold: true, center: true, spacing: { before: 0, after: 0 }
            }),
            p("*", { size: 28, center: true, spacing: { before: 0, after: 0 } })
          ]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          children: [
            separator(),
            p(`${cfg.diaDanh}, ${cfg.ngayThang}`, {
              size: 28, italics: true, center: true, spacing: { before: 60, after: 0 }
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
          children: [p(cfg.soKyHieu || "", {
            size: 26, center: true, spacing: { before: 60, after: 0 }
          })]
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
          children: [p("", { spacing: { before: 0, after: 0 } })]
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
    p([new TextRun({ text: "Nơi nhận:", font: FONT, size: 24, bold: true, italics: true })], {
      spacing: { before: 240, after: 0 }
    })
  ];
  (cfg.noiNhanList || []).forEach(item => {
    noiNhanChildren.push(p(`- ${item}`, {
      size: 22, spacing: { before: 0, after: 0 }, alignment: AlignmentType.LEFT
    }));
  });

  // Right column: Signatory block
  const chuKyChildren = [];
  const qh = cfg.quyenHan ? `${cfg.quyenHan} ` : "";
  chuKyChildren.push(p(`${qh}${cfg.chucVu || ""}`.toUpperCase(), {
    size: 28, bold: true, center: true, spacing: { before: 240, after: 0 }
  }));
  // Blank space for handwritten signature
  for (let i = 0; i < 3; i++) {
    chuKyChildren.push(p(" ", { spacing: { before: 0, after: 0 } }));
  }
  // Full name
  chuKyChildren.push(p(cfg.hoTen || "", {
    size: 28, bold: true, center: true, spacing: { before: 0, after: 0 }
  }));

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LEFT_COL, RIGHT_COL],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: NO_BORDERS, width: { size: LEFT_COL, type: WidthType.DXA },
          children: noiNhanChildren
        }),
        new TableCell({
          borders: NO_BORDERS, width: { size: RIGHT_COL, type: WidthType.DXA },
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
    children.push(p(`V/v ${cfg.trichYeu}`, {
      size: 24, spacing: { before: 60, after: 240 }, alignment: AlignmentType.LEFT
    }));
  }

  // "Kính gửi:" — centered
  if (cfg.kinhGui) {
    children.push(p([
      new TextRun({ text: "Kính gửi: ", font: FONT, size: 26 }),
      new TextRun({ text: cfg.kinhGui, font: FONT, size: 26 })
    ], { center: true, spacing: { before: 120, after: 120 } }));
  }

  // Body paragraphs
  (cfg.noiDung || []).forEach(text => {
    children.push(p(text, { indent: { firstLine: 720 } }));
  });

  // Footer (recipients + signatory)
  children.push(buildFooter(cfg));
  return children;
}

function buildQuyetDinh(cfg) {
  const isDang = cfg.heTieuChuan === "dang";
  const header = isDang ? buildHeaderDang(cfg) : buildHeaderNhaNuoc(cfg);
  const children = [header];

  // Document type: "QUYẾT ĐỊNH"
  children.push(p("QUYẾT ĐỊNH", {
    size: isDang ? 32 : 28, bold: true, center: true,
    spacing: { before: 360, after: 0 }
  }));

  // Summary
  if (cfg.trichYeu) {
    children.push(p(cfg.trichYeu, {
      size: 28, bold: true, center: true, spacing: { before: 0, after: 0 }
    }));
    children.push(separator());
  }

  // Signatory title
  children.push(p((cfg.chucVu || "").toUpperCase(), {
    size: 28, bold: true, center: true, spacing: { before: 120, after: 120 }
  }));

  // Legal basis ("Căn cứ") — italic
  (cfg.canCuList || []).forEach(canCu => {
    children.push(p(`Căn cứ ${canCu};`, {
      size: 26, italics: true, indent: { firstLine: 720 },
      spacing: { before: 60, after: 0 }
    }));
  });

  // "Theo đề nghị" — italic
  if (cfg.theoDeNghi) {
    children.push(p(`Theo đề nghị ${cfg.theoDeNghi}.`, {
      size: 26, italics: true, indent: { firstLine: 720 },
      spacing: { before: 60, after: 120 }
    }));
  }

  // "QUYẾT ĐỊNH:" label
  children.push(p("QUYẾT ĐỊNH:", {
    size: 28, bold: true, center: true, spacing: { before: 240, after: 120 }
  }));

  // Articles (Điều)
  (cfg.dieuList || []).forEach((dieu, i) => {
    children.push(p([
      new TextRun({ text: `Điều ${i + 1}. `, font: FONT, size: 26, bold: true }),
      new TextRun({ text: dieu, font: FONT, size: 26 })
    ], {
      indent: { firstLine: 720 }, spacing: { before: 120, after: 0 }
    }));
  });

  children.push(buildFooter(cfg));
  return children;
}

function buildGeneric(cfg, tenLoaiVB) {
  const isDang = cfg.heTieuChuan === "dang";
  const header = isDang ? buildHeaderDang(cfg) : buildHeaderNhaNuoc(cfg);
  const children = [header];

  // Document type name
  children.push(p(tenLoaiVB.toUpperCase(), {
    size: isDang ? 32 : 28, bold: true, center: true,
    spacing: { before: 360, after: 0 }
  }));

  // Summary
  if (cfg.trichYeu) {
    children.push(p(cfg.trichYeu, {
      size: 28, bold: true, center: true, spacing: { before: 0, after: 0 }
    }));
    children.push(separator());
  }

  // "Kính gửi:" (for Tờ trình, etc.)
  if (cfg.kinhGui) {
    children.push(p([
      new TextRun({ text: "Kính gửi: ", font: FONT, size: 26 }),
      new TextRun({ text: cfg.kinhGui, font: FONT, size: 26 })
    ], { center: true, spacing: { before: 120, after: 120 } }));
  }

  // Body paragraphs
  (cfg.noiDung || []).forEach(text => {
    children.push(p(text, { indent: { firstLine: 720 } }));
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
    throw new Error(`Unsupported document type: ${loai}. Supported types: ${Object.keys(LOAI_VB_MAP).join(", ")}`);
  }

  const children = entry.builder(cfg);

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 26, color: "000000" }
        }
      }
    },
    sections: [{
      properties: { page: PAGE_A4 },
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
  console.log(`Document created: ${outputPath}`);
}

// Export for use as a module
module.exports = { createDocument, buildHeaderNhaNuoc, buildHeaderDang, buildFooter, buildCongVan, buildQuyetDinh, buildGeneric, LOAI_VB_MAP };

// Run from command line
if (require.main === module) {
  main().catch(console.error);
}
