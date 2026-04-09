#!/usr/bin/env node
/**
 * Vietnamese Administrative Document Generator
 * Compliant with Nghị định 30/2020/NĐ-CP and Hướng dẫn 36-HD/VPTW
 *
 * Usage: node create_vbhc.js --config config.json --output output.docx
 *
 * Decorative underlines use Shape lines (Insert > Shapes > Line) —
 * the traditional method in Vietnamese government offices.
 * Since docx-js doesn't support shapes natively, the script uses a
 * two-step process: build with docx-js, then post-process with JSZip
 * to inject inline drawing XML.
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, WidthType, BorderStyle, Header, PageNumber,
        VerticalAlign, LevelFormat } = require('docx');
const JSZip = require('jszip');
const fs = require('fs');

// ============================================================
// CONSTANTS
// ============================================================
const FONT = "Times New Roman";
const CONTENT_WIDTH = 9355; // DXA — A4 content area (210mm - 30mm left - 15mm right)
const LEFT_COL = 3555;      // ~38% — narrower left to give right column enough room
const RIGHT_COL = 5800;     // ~62% — wider right so quốc hiệu tiêu ngữ never wraps

// Table-level: hide all borders including internal gridlines
// MUST include insideHorizontal + insideVertical or gridlines still show in Word
const TABLE_BORDERS_NONE = {
  top:              { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom:           { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left:             { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right:            { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical:   { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

// Cell-level: hide each cell's own borders
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const CELL_BORDERS_NONE = {
  top: NO_BORDER, bottom: NO_BORDER,
  left: NO_BORDER, right: NO_BORDER
};

// A4 page configuration per NĐ 30/2020
const PAGE_A4 = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1134, bottom: 1134, left: 1701, right: 850 }
};

// Page header: centered page number from page 2 onwards
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
// SHAPE LINE HELPERS
// ============================================================

/**
 * Placeholder paragraph for a shape line.
 * Contains invisible marker text that will be replaced by real OOXML
 * inline drawing XML during post-processing.
 *
 * @param {number} widthCm  Line width in centimeters
 */
function shapePlaceholder(widthCm = 5.5) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({
      text: `__LINE_${widthCm}CM__`,
      font: FONT, size: 2, color: "FFFFFF" // tiny invisible text
    })],
  });
}

/**
 * Generate OOXML inline drawing XML for a horizontal shape line.
 * Same result as Insert > Shapes > Line in Word.
 * The line is selectable, resizable, and repositionable.
 *
 * @param {number} id        Unique shape ID (increment for each line)
 * @param {number} widthCm   Line width in centimeters
 * @param {number} weightPt  Line thickness in points (default 0.5)
 * @param {string} color     RGB hex color (default "000000" = black)
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
 * Post-process a docx buffer: replace __LINE_XCM__ placeholder runs
 * with real inline drawing XML (shape lines).
 *
 * @param {Buffer} docxBuffer  Buffer from Packer.toBuffer()
 * @returns {Promise<Buffer>}  Modified docx buffer with shape lines
 */
async function injectShapeLines(docxBuffer) {
  const zip = await JSZip.loadAsync(docxBuffer);
  let xml = await zip.file('word/document.xml').async('string');

  let shapeId = 100; // start from 100 to avoid ID conflicts
  xml = xml.replace(/<w:r[^>]*>.*?__LINE_([\d.]+)CM__.*?<\/w:r>/g, (match, cm) => {
    const id = shapeId++;
    const drawingXml = shapeLineXml(id, parseFloat(cm));
    return `<w:r>${drawingXml}</w:r>`;
  });

  zip.file('word/document.xml', xml);
  return zip.generateAsync({ type: 'nodebuffer' });
}

// ============================================================
// LAYOUT HELPERS
// ============================================================

/**
 * Create a hidden-border layout table (2-column, borderless).
 * Borders removed at BOTH Table level and Cell level — same as
 * selecting a table in Word then Design > Borders > No Border.
 */
function layoutTable(rows, columnWidths = [LEFT_COL, RIGHT_COL]) {
  return new Table({
    borders: TABLE_BORDERS_NONE,
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    rows,
  });
}

/**
 * Create a table cell: no borders, no padding, top-aligned.
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

/**
 * Body paragraph: justified, first-line indented 1.27cm.
 */
function bodyParagraph(text, { size = 26, bold = false, italics = false } = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 120, after: 0, line: 276 },
    indent: { firstLine: 720 },
    children: Array.isArray(text) ? text : [new TextRun({ text, font: FONT, size, bold, italics })],
  });
}

// ============================================================
// HEADER BUILDERS
// ============================================================

/**
 * Government document header (NĐ 30/2020)
 *
 * 2-column, **2-row** hidden table:
 *   Row 1: org name + shape line | quốc hiệu + tiêu ngữ + shape line
 *   Row 2: số ký hiệu (+ V/v)   | địa danh, ngày tháng
 *
 * The shape line stays in the same row as the text it underlines,
 * preventing it from sticking to the date/number below.
 *
 * Right column is ~62% of content width so "CỘNG HÒA XÃ HỘI CHỦ NGHĨA
 * VIỆT NAM" never wraps — wrapping the quốc hiệu is strictly forbidden
 * in Vietnamese administrative documents.
 */
function buildHeaderNhaNuoc(cfg, options = {}) {
  // ── ROW 1: Org info + shape lines ──
  const r1Left = [];

  if (cfg.coQuanChuQuan) {
    r1Left.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: cfg.coQuanChuQuan.toUpperCase(),
        font: FONT, size: 26 // 13pt, NOT bold
      })],
    }));
  }

  r1Left.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({
      text: (cfg.coQuanBanHanh || "").toUpperCase(),
      font: FONT, size: 26, bold: true
    })],
  }));

  // Shape line under authority name (~3cm)
  r1Left.push(shapePlaceholder(3.0));

  const r1Right = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
        font: FONT, size: 26, bold: true
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: "Độc lập - Tự do - Hạnh phúc",
        font: FONT, size: 28, bold: true
      })],
    }),
    // Shape line under tiêu ngữ (~5.5cm)
    shapePlaceholder(5.5),
  ];

  // ── ROW 2: Document number + date ──
  const r2Left = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
      children: [new TextRun({ text: cfg.soKyHieu || "", font: FONT, size: 26 })],
    }),
  ];

  // V/v summary (only for công văn)
  if (options.trichYeuCV) {
    r2Left.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 0 },
      children: [new TextRun({
        text: `V/v ${options.trichYeuCV}`,
        font: FONT, size: 24
      })],
    }));
  }

  const r2Right = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 0 },
      children: [new TextRun({
        text: `${cfg.diaDanh}, ${cfg.ngayThang}`,
        font: FONT, size: 28, italics: true
      })],
    }),
  ];

  return layoutTable([
    new TableRow({ children: [layoutCell(r1Left, LEFT_COL), layoutCell(r1Right, RIGHT_COL)] }),
    new TableRow({ children: [layoutCell(r2Left, LEFT_COL), layoutCell(r2Right, RIGHT_COL)] }),
  ]);
}

/**
 * Party document header (HD 36-HD/VPTW)
 *
 * Same 2-row, 2-column structure as government header.
 * Row 1: org name + asterisk | "ĐẢNG CỘNG SẢN VIỆT NAM" + shape line
 * Row 2: số ký hiệu          | địa danh, ngày tháng
 */
function buildHeaderDang(cfg, options = {}) {
  // ── ROW 1 ──
  const r1Left = [];

  if (cfg.coQuanChuQuan) {
    r1Left.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: cfg.coQuanChuQuan.toUpperCase(),
        font: FONT, size: 28
      })],
    }));
  }

  r1Left.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: (cfg.coQuanBanHanh || "").toUpperCase(),
        font: FONT, size: 28, bold: true
      })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "*", font: FONT, size: 28 })],
    }),
  );

  const r1Right = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: "ĐẢNG CỘNG SẢN VIỆT NAM",
        font: FONT, size: 32, bold: true
      })],
    }),
    shapePlaceholder(5.5),
  ];

  // ── ROW 2 ──
  const r2Left = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 0 },
      children: [new TextRun({ text: cfg.soKyHieu || "", font: FONT, size: 26 })],
    }),
  ];

  const r2Right = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 0 },
      children: [new TextRun({
        text: `${cfg.diaDanh}, ${cfg.ngayThang}`,
        font: FONT, size: 28, italics: true
      })],
    }),
  ];

  return layoutTable([
    new TableRow({ children: [layoutCell(r1Left, LEFT_COL), layoutCell(r1Right, RIGHT_COL)] }),
    new TableRow({ children: [layoutCell(r2Left, LEFT_COL), layoutCell(r2Right, RIGHT_COL)] }),
  ]);
}

// ============================================================
// FOOTER BUILDER (Nơi nhận + Chữ ký)
// ============================================================

function buildFooter(cfg) {
  const leftChildren = [
    new Paragraph({
      spacing: { before: 240, after: 0 },
      children: [new TextRun({
        text: "Nơi nhận:",
        font: FONT, size: 24, bold: true, italics: true
      })]
    })
  ];
  (cfg.noiNhanList || []).forEach(item => {
    leftChildren.push(new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: `- ${item}`, font: FONT, size: 22 })]
    }));
  });

  const qh = cfg.quyenHan ? `${cfg.quyenHan} ` : "";
  const rightChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 0 },
      children: [new TextRun({
        text: `${qh}${cfg.chucVu || ""}`.toUpperCase(),
        font: FONT, size: 28, bold: true
      })]
    }),
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
    }),
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

// ============================================================
// DOCUMENT BUILDERS
// ============================================================

function buildCongVan(cfg) {
  const isDang = cfg.heTieuChuan === "dang";
  // Pass trichYeuCV so the header builder puts "V/v" inside the left cell
  const header = isDang
    ? buildHeaderDang(cfg)
    : buildHeaderNhaNuoc(cfg, { trichYeuCV: cfg.trichYeu });
  const children = [header];

  // "Kính gửi:" — centered
  if (cfg.kinhGui) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({ text: "Kính gửi: ", font: FONT, size: 26 }),
        new TextRun({ text: cfg.kinhGui, font: FONT, size: 26 })
      ]
    }));
  }

  // Body
  (cfg.noiDung || []).forEach(text => { children.push(bodyParagraph(text)); });
  children.push(buildFooter(cfg));
  return children;
}

function buildQuyetDinh(cfg) {
  const isDang = cfg.heTieuChuan === "dang";
  const header = isDang ? buildHeaderDang(cfg) : buildHeaderNhaNuoc(cfg);
  const titleSize = isDang ? 32 : 28;
  const children = [header];

  // "QUYẾT ĐỊNH"
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 0 },
    children: [new TextRun({ text: "QUYẾT ĐỊNH", font: FONT, size: titleSize, bold: true })],
  }));

  // Trích yếu + shape line
  if (cfg.trichYeu) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: cfg.trichYeu, font: FONT, size: 28, bold: true })],
      }),
      shapePlaceholder(3.0),
    );
  }

  // Signatory title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    children: [new TextRun({
      text: (cfg.chucVu || "").toUpperCase(), font: FONT, size: 28, bold: true
    })],
  }));

  // Căn cứ
  (cfg.canCuList || []).forEach(canCu => {
    children.push(bodyParagraph(`Căn cứ ${canCu};`, { italics: true }));
  });
  if (cfg.theoDeNghi) {
    children.push(bodyParagraph(`Theo đề nghị ${cfg.theoDeNghi}.`, { italics: true }));
  }

  // "QUYẾT ĐỊNH:" label
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text: "QUYẾT ĐỊNH:", font: FONT, size: 28, bold: true })],
  }));

  // Điều articles
  (cfg.dieuList || []).forEach((dieu, i) => {
    children.push(bodyParagraph([
      new TextRun({ text: `Điều ${i + 1}. `, font: FONT, size: 26, bold: true }),
      new TextRun({ text: dieu, font: FONT, size: 26 })
    ]));
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

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 0 },
    children: [new TextRun({
      text: tenLoaiVB.toUpperCase(), font: FONT, size: titleSize, bold: true
    })],
  }));

  if (cfg.trichYeu) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: cfg.trichYeu, font: FONT, size: 28, bold: true })],
      }),
      shapePlaceholder(3.0),
    );
  }

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

  (cfg.noiDung || []).forEach(text => {
    children.push(bodyParagraph(text, { size: bodySize }));
  });

  children.push(buildFooter(cfg));
  return children;
}

// ============================================================
// DOCUMENT TYPE MAP
// ============================================================

const LOAI_VB_MAP = {
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
        titlePage: true, // suppress page number on first page
      },
      headers: { default: PAGE_HEADER },
      children,
    }]
  });
}

/**
 * Generate a complete .docx file with shape lines.
 * Two-step process:
 * 1. Build document structure with docx-js (shape lines are placeholders)
 * 2. Post-process with JSZip to inject real OOXML drawing XML
 */
async function generateDocx(cfg) {
  const doc = createDocument(cfg);
  const buffer = await Packer.toBuffer(doc);
  return injectShapeLines(buffer);
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
  const finalBuffer = await generateDocx(cfg);
  fs.writeFileSync(outputPath, finalBuffer);
  console.log(`Created: ${outputPath}`);
}

module.exports = {
  createDocument, generateDocx, injectShapeLines,
  buildHeaderNhaNuoc, buildHeaderDang, buildFooter,
  buildCongVan, buildQuyetDinh, buildGeneric,
  layoutTable, layoutCell, shapePlaceholder, shapeLineXml, bodyParagraph,
  LOAI_VB_MAP, PAGE_A4, FONT,
  TABLE_BORDERS_NONE, CELL_BORDERS_NONE,
};

if (require.main === module) {
  main().catch(console.error);
}
