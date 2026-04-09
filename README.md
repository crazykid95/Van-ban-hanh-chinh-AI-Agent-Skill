*[Tiếng Việt](README.vi.md) | English*

# Văn Bản Hành Chính AI Agent Skill

AI agent skill for generating Vietnamese administrative documents that comply with Nghị định 30/2020/NĐ-CP (government), Hướng dẫn 36-HD/VPTW (Party), and Quyết định 4114/QĐ-BTC (Ministry of Finance).

The output is a `.docx` file formatted exactly the way a civil servant would create it by hand in Microsoft Word — hidden tables for layout, proper heading styles, editable border-based underlines, correct numbering — so anyone can open it in Word and keep editing without fighting the formatting.

## Requirements

### Docx package

Install the docx package using npm. AI agents like Claude will use docx to work with docx files.

```bash
npm install docx
```

## Installation

### Claude Desktop (Cowork)

Open **Customize** in the left sidebar, click **"+"**, and select the `van-ban-hanh-chinh` zip file (The repository was downloaded as a zip file). The skill appears in your skill list and can be toggled on or off.

### Claude Code

Copy the skill folder into either location:

```bash
# Available across all your projects
cp -r van-ban-hanh-chinh ~/.claude/skills/

# Or scoped to a single project
cp -r van-ban-hanh-chinh .claude/skills/
```

### Cursor / Windsurf / Other Agents

Most agents that follow the [Agent Skills](https://agentskills.io) standard can pick up the skill folder. Drop it into the agent's skill directory — typically `~/.one-skills/skills/` or wherever your agent reads custom instructions from. The only hard requirement is that `SKILL.md` sits at the root of the folder.

## What It Does

You ask in Vietnamese — "Tạo công văn gửi Sở Giáo dục về việc triển khai kế hoạch năm học mới" — and the agent produces a `.docx` with:

- Correct A4 layout, margins, and Times New Roman throughout
- Two-column hidden-border table for the header (authority name on the left, national emblem on the right)
- Properly sized border-based underlines under the motto and organization name
- Body text with justified alignment, 1.27cm first-line indent, correct line spacing
- Signatory block and recipient list laid out in a two-column footer table

29 government document types (công văn, quyết định, tờ trình, báo cáo, thông báo, kế hoạch, biên bản, giấy mời, etc.) and 33 Party document types (nghị quyết, chỉ thị, kết luận, thông báo, hướng dẫn, etc.) are covered.

## Standalone Usage (Without an AI Agent)

The `scripts/create_vbhc.js` script works on its own:

```bash
npm install docx
node scripts/create_vbhc.js --config assets/sample-cong-van.json --output cong-van.docx
```

Sample configs for công văn, quyết định, and nghị quyết Đảng are in `assets/`.

## Government vs. Party Documents at a Glance

| | Nhà nước (NĐ 30) | Đảng (HD 36) |
|---|---|---|
| Right header | CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM | ĐẢNG CỘNG SẢN VIỆT NAM |
| Separator | Underline below org name | Asterisk (*) |
| Code format | `Số: 30/2020/NĐ-CP` (slash) | `Số: 36-HD/VPTW` (hyphen) |
| Authority prefix | TM., KT., TL. | T/M, K/T, T/L |
| Margins | 20–25 / 30–35 / 15–20mm | 20 / 30 / 15mm (fixed) |

## Project Structure

```
van-ban-hanh-chinh/
├── SKILL.md                    # Agent instructions (English)
├── README.md                   # This file
├── README.vi.md                # Vietnamese version
├── references/
│   ├── nghi-dinh-30.md         # NĐ 30/2020 formatting specs
│   ├── huong-dan-36.md         # HD 36 Party document specs
│   └── mau-van-ban.md          # docx-js templates with code samples
├── scripts/
│   └── create_vbhc.js          # CLI document generator
└── assets/
    ├── sample-cong-van.json
    ├── sample-quyet-dinh.json
    └── sample-nghi-quyet-dang.json
```

## Legal References

- [Nghị định 30/2020/NĐ-CP](https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=199378) — Về công tác văn thư
- [Hướng dẫn 36-HD/VPTW](https://tulieuvankien.dangcongsan.vn/) — Thể thức và kỹ thuật trình bày văn bản của Đảng
- [Quy định 66-QĐ/TW](https://tulieuvankien.dangcongsan.vn/) — Thể loại, thẩm quyền ban hành và thể thức văn bản của Đảng
