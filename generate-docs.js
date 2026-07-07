import fs from "fs";
import { marked } from "marked";
import { jsPDF } from "jspdf";
import * as docx from "docx";

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak
} = docx;

// BRAND CONSTANTS
const BRAND_RED = "BE0028";
const CHARCOAL = "1A1A1A";
const LIGHT_GRAY = "F4F4F4";
const SLATE_GRAY = "F8FAFC";
const BORDER_COLOR = "D1D5DB";

function createDocx(title, subtitle, mdFile, outFile) {
  const mdContent = fs.readFileSync(mdFile, "utf8");
  const tokens = marked.lexer(mdContent);

  const children = [];

  // 1. COVER PAGE ELEMENTS
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1440, after: 240 }, // 1 inch before
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 56, // 28pt
          color: BRAND_RED,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 720 },
      children: [
        new TextRun({
          text: subtitle,
          size: 32, // 16pt
          color: CHARCOAL,
          italic: true,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1440 },
      children: [
        new TextRun({
          text: "______________________________________________________",
          color: BRAND_RED,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1440, after: 120 },
      children: [
        new TextRun({
          text: "DKSH HSE Compliance Division",
          bold: true,
          size: 24, // 12pt
          color: CHARCOAL,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "Author: Regional HSE Compliance Team & Business Analysts",
          size: 20, // 10pt
          color: "555555",
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 2880 }, // Page break after this
      children: [
        new TextRun({
          text: `Date: July 2026  |  Version: 2.1  |  Status: APPROVED`,
          size: 18, // 9pt
          color: "777777",
          font: "Arial",
        }),
      ],
    })
  );

  // Helper to add page break before starting content
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // 2. PARSE TOKENS TO DOCX
  tokens.forEach((token) => {
    switch (token.type) {
      case "heading": {
        let level = HeadingLevel.HEADING_1;
        let size = 36; // 18pt
        let color = BRAND_RED;
        let beforeSpacing = 400;

        if (token.depth === 2) {
          level = HeadingLevel.HEADING_2;
          size = 28; // 14pt
          color = "2C3E50";
          beforeSpacing = 300;
        } else if (token.depth >= 3) {
          level = HeadingLevel.HEADING_3;
          size = 24; // 12pt
          color = CHARCOAL;
          beforeSpacing = 200;
        }

        children.push(
          new Paragraph({
            heading: level,
            spacing: { before: beforeSpacing, after: 120 },
            keepNext: true,
            children: [
              new TextRun({
                text: token.text,
                bold: true,
                size: size,
                color: color,
                font: "Arial",
              }),
            ],
          })
        );
        break;
      }

      case "paragraph": {
        // Simple parsing of inline bold/italics
        const textRuns = [];
        let remaining = token.text;

        // Simple bold parser **text**
        const regex = /\*\*([^*]+)\*\*/g;
        let match;
        let lastIndex = 0;

        while ((match = regex.exec(remaining)) !== null) {
          // Add plain text before
          if (match.index > lastIndex) {
            textRuns.push(
              new TextRun({
                text: remaining.substring(lastIndex, match.index),
                font: "Arial",
                size: 22, // 11pt
                color: CHARCOAL,
              })
            );
          }
          // Add bold text
          textRuns.push(
            new TextRun({
              text: match[1],
              bold: true,
              font: "Arial",
              size: 22,
              color: CHARCOAL,
            })
          );
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < remaining.length) {
          textRuns.push(
            new TextRun({
              text: remaining.substring(lastIndex),
              font: "Arial",
              size: 22,
              color: CHARCOAL,
            })
          );
        }

        children.push(
          new Paragraph({
            spacing: { after: 140 },
            children: textRuns.length > 0 ? textRuns : [
              new TextRun({
                text: token.text,
                font: "Arial",
                size: 22,
                color: CHARCOAL,
              }),
            ],
          })
        );
        break;
      }

      case "list": {
        token.items.forEach((item, idx) => {
          // Clean item text from markdown formatting
          const cleanText = item.text.replace(/\*\*([^*]+)\*\*/g, "$1");
          const bulletSymbol = token.ordered ? `${idx + 1}.   ` : "•   ";
          children.push(
            new Paragraph({
              spacing: { after: 100 },
              indent: { left: 720 }, // Indent 0.5 inches
              children: [
                new TextRun({
                  text: bulletSymbol,
                  bold: true,
                  font: "Arial",
                  size: 22,
                  color: BRAND_RED,
                }),
                new TextRun({
                  text: cleanText,
                  font: "Arial",
                  size: 22,
                  color: CHARCOAL,
                }),
              ],
            })
          );
        });
        break;
      }

      case "code": {
        // Monospace blocks (like ASCII diagrams)
        const lines = token.text.split("\n");
        lines.forEach((line) => {
          children.push(
            new Paragraph({
              spacing: { before: 20, after: 20 },
              children: [
                new TextRun({
                  text: line,
                  font: "Courier New",
                  size: 16, // 8pt
                  color: "000000",
                }),
              ],
            })
          );
        });
        break;
      }

      case "table": {
        const tableRows = [];

        // Header Row
        if (token.header && token.header.length > 0) {
          tableRows.push(
            new TableRow({
              tableHeader: true,
              children: token.header.map((colText) => {
                const headerCellText = typeof colText === "object" ? colText.text : colText;
                return new TableCell({
                  shading: { fill: BRAND_RED },
                  children: [
                    new Paragraph({
                      spacing: { before: 100, after: 100 },
                      children: [
                        new TextRun({
                          text: headerCellText,
                          bold: true,
                          color: "FFFFFF",
                          font: "Arial",
                          size: 18,
                        }),
                      ],
                    }),
                  ],
                });
              }),
            })
          );
        }

        // Data Rows
        if (token.rows && token.rows.length > 0) {
          token.rows.forEach((row, rowIdx) => {
            const isAlt = rowIdx % 2 === 1;
            tableRows.push(
              new TableRow({
                children: row.map((cellVal) => {
                  const cellText = typeof cellVal === "object" ? cellVal.text : cellVal;
                  return new TableCell({
                    shading: { fill: isAlt ? LIGHT_GRAY : "FFFFFF" },
                    children: [
                      new Paragraph({
                        spacing: { before: 80, after: 80 },
                        children: [
                          new TextRun({
                            text: cellText,
                            font: "Arial",
                            size: 18,
                            color: CHARCOAL,
                          }),
                        ],
                      }),
                    ],
                  });
                }),
              })
            );
          });
        }

        if (tableRows.length > 0) {
          children.push(
            new Paragraph({ spacing: { before: 200 } }) // Spacing before table
          );
          children.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            })
          );
          children.push(
            new Paragraph({ spacing: { after: 200 } }) // Spacing after table
          );
        }
        break;
      }

      case "hr": {
        children.push(
          new Paragraph({
            spacing: { before: 240, after: 240 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "______________________________________________________",
                color: BORDER_COLOR,
                size: 16,
              }),
            ],
          })
        );
        break;
      }
    }
  });

  // Create document configuration with running headers/footers
  const doc = new Document({
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${title}  |  DKSH HSE Internal Compliance`,
                    size: 16,
                    color: "888888",
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "DKSH HSE Incident Logging Register  -  ",
                    size: 16,
                    color: "888888",
                    font: "Arial",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: "888888",
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        },
        children: children,
      },
    ],
  });

  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outFile, buffer);
    console.log(`Successfully generated DOCX: ${outFile}`);
    if (outFile.startsWith("public/")) {
      const rootPath = outFile.substring("public/".length);
      fs.writeFileSync(rootPath, buffer);
      console.log(`Successfully copied to root: ${rootPath}`);
    }
  });
}

function createPdf(title, subtitle, mdFile, outFile) {
  const mdContent = fs.readFileSync(mdFile, "utf8");
  const tokens = marked.lexer(mdContent);

  // Initialize jsPDF A4 Document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let pageNum = 1;
  let y = 25;
  const marginX = 20;
  const printableWidth = 170; // 210 - 40
  const pageHeight = 297;
  const marginBottom = 25;

  function drawHeaderFooter(pdfDoc) {
    if (pageNum === 1) return; // Skip cover page
    
    // Top running header
    pdfDoc.setFont("helvetica", "normal");
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(120, 120, 120);
    pdfDoc.text(`${title}  |  DKSH Internal Register`, marginX, 12);
    pdfDoc.setDrawColor(220, 220, 220);
    pdfDoc.setLineWidth(0.2);
    pdfDoc.line(marginX, 14, 210 - marginX, 14);

    // Bottom running footer
    pdfDoc.text("DKSH Regional HSE Compliance Platform  -  Strictly Confidential", marginX, pageHeight - 12);
    pdfDoc.text(`Page ${pageNum}`, 210 - marginX - 12, pageHeight - 12);
  }

  function checkPageBreak(neededHeight, pdfDoc) {
    if (y + neededHeight > pageHeight - marginBottom) {
      pdfDoc.addPage();
      pageNum++;
      y = 25;
      drawHeaderFooter(pdfDoc);
    }
  }

  // 1. COVER PAGE RENDER
  // Crimson Header Accent Circle
  doc.setFillColor(190, 0, 40); // BRAND_RED
  doc.ellipse(marginX + 15, 45, 10, 10, "F");
  doc.setFillColor(255, 255, 255);
  doc.ellipse(marginX + 15, 45, 6, 6, "F");
  doc.setFillColor(190, 0, 40);
  doc.rect(marginX + 14, 40, 2, 10, "F"); // simple abstract tree/circle

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(190, 0, 40); // BRAND_RED
  
  const titleLines = doc.splitTextToSize(title.toUpperCase(), printableWidth);
  doc.text(titleLines, marginX, 75);
  
  y = 75 + (titleLines.length * 10) + 5;
  doc.setFont("helvetica", "oblique");
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text(subtitle, marginX, y);

  y += 15;
  doc.setDrawColor(190, 0, 40);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, marginX + 60, y);

  y += 25;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("DKSH HSE Compliance Division", marginX, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("Author: Regional HSE Compliance Team & Business Analysts", marginX, y);

  y += 6;
  doc.text(`Date: July 2026  |  Version: 2.1  |  Status: APPROVED`, marginX, y);

  y += 12;
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text("Confidentiality Notice: This document contains proprietary operational specs for internal use inside DKSH.", marginX, y);

  // Add page break after cover
  doc.addPage();
  pageNum++;
  y = 25;
  drawHeaderFooter(doc);

  // 2. PARSE AND RENDER TOKENS
  tokens.forEach((token) => {
    switch (token.type) {
      case "heading": {
        let size = 16;
        let color = [190, 0, 40]; // BRAND_RED
        let beforeHeight = 12;

        if (token.depth === 2) {
          size = 13;
          color = [44, 62, 80]; // SLATE
          beforeHeight = 10;
        } else if (token.depth >= 3) {
          size = 11;
          color = [30, 30, 30]; // CHARCOAL
          beforeHeight = 8;
        }

        checkPageBreak(beforeHeight + 8, doc);
        y += beforeHeight;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(token.text, marginX, y);
        y += size * 0.4 + 2;
        break;
      }

      case "paragraph": {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);

        // Simple cleanup of markdown links or bold tags
        const cleanText = token.text.replace(/\*\*([^*]+)\*\*/g, "$1");
        const lines = doc.splitTextToSize(cleanText, printableWidth);
        const lineSpacing = 4.5;
        
        checkPageBreak((lines.length * lineSpacing) + 4, doc);

        lines.forEach((line) => {
          doc.text(line, marginX, y);
          y += lineSpacing;
        });
        y += 2; // Spacing after paragraph
        break;
      }

      case "list": {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);

        token.items.forEach((item, idx) => {
          const cleanText = item.text.replace(/\*\*([^*]+)\*\*/g, "$1");
          const bulletPrefix = token.ordered ? `${idx + 1}. ` : "• ";
          const prefixWidth = 6;
          
          const itemLines = doc.splitTextToSize(cleanText, printableWidth - prefixWidth);
          const lineSpacing = 4.5;

          checkPageBreak((itemLines.length * lineSpacing) + 2, doc);

          // Draw bullet
          doc.setFont("helvetica", "bold");
          doc.text(bulletPrefix, marginX, y);
          
          doc.setFont("helvetica", "normal");
          itemLines.forEach((line, lineIdx) => {
            doc.text(line, marginX + prefixWidth, y);
            y += lineSpacing;
          });
          y += 1;
        });
        y += 2;
        break;
      }

      case "code": {
        // Render ASCII diagrams inside courier blocks
        doc.setFont("courier", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(0, 0, 0);

        const lines = token.text.split("\n");
        const lineSpacing = 3.2;

        checkPageBreak((lines.length * lineSpacing) + 6, doc);
        
        // Draw container box
        doc.setFillColor(248, 250, 252); // SLATE_GRAY
        doc.setDrawColor(220, 224, 230);
        doc.setLineWidth(0.2);
        doc.rect(marginX - 2, y - 2, printableWidth + 4, (lines.length * lineSpacing) + 3, "FD");

        lines.forEach((line) => {
          doc.text(line, marginX, y);
          y += lineSpacing;
        });
        y += 4;
        break;
      }

      case "table": {
        if (!token.header || token.header.length === 0) return;

        const colCount = token.header.length;
        const colWidth = printableWidth / colCount;
        const lineSpacing = 4;
        const padding = 2;

        // Calculate heights for rows to check for page break
        let tableHeightNeeded = 12; // header plus some lines
        checkPageBreak(tableHeightNeeded, doc);

        // Draw Headers
        doc.setFillColor(190, 0, 40); // BRAND_RED
        doc.rect(marginX, y, printableWidth, 8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);

        token.header.forEach((colText, colIdx) => {
          const headerText = typeof colText === "object" ? colText.text : colText;
          const cellLines = doc.splitTextToSize(headerText, colWidth - (padding * 2));
          doc.text(cellLines[0] || "", marginX + (colIdx * colWidth) + padding, y + 5);
        });

        y += 8;

        // Draw Rows
        if (token.rows && token.rows.length > 0) {
          token.rows.forEach((row, rowIdx) => {
            // Determine max lines in any cell of this row to calculate height
            let maxLines = 1;
            const cellsTextLines = row.map((cellVal) => {
              const cellText = typeof cellVal === "object" ? cellVal.text : cellVal;
              const cellLines = doc.splitTextToSize(cellText, colWidth - (padding * 2));
              if (cellLines.length > maxLines) maxLines = cellLines.length;
              return cellLines;
            });

            const rowHeight = (maxLines * lineSpacing) + (padding * 2);
            checkPageBreak(rowHeight, doc);

            // Shading
            if (rowIdx % 2 === 1) {
              doc.setFillColor(244, 244, 244); // LIGHT_GRAY
              doc.rect(marginX, y, printableWidth, rowHeight, "F");
            } else {
              doc.setFillColor(255, 255, 255);
              doc.rect(marginX, y, printableWidth, rowHeight, "F");
            }

            // Draw cells
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(50, 50, 50);

            cellsTextLines.forEach((cellLines, colIdx) => {
              cellLines.forEach((line, lineIdx) => {
                doc.text(line, marginX + (colIdx * colWidth) + padding, y + padding + 3 + (lineIdx * lineSpacing));
              });
            });

            // Bottom border for cells
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.line(marginX, y + rowHeight, marginX + printableWidth, y + rowHeight);

            y += rowHeight;
          });
        }
        y += 4;
        break;
      }

      case "hr": {
        checkPageBreak(6, doc);
        doc.setDrawColor(209, 213, 219);
        doc.setLineWidth(0.3);
        doc.line(marginX + 10, y + 2, 210 - marginX - 10, y + 2);
        y += 6;
        break;
      }
    }
  });

  // Save the generated PDF
  doc.save(outFile);
  console.log(`Successfully generated PDF: ${outFile}`);
  if (outFile.startsWith("public/")) {
    const rootPath = outFile.substring("public/".length);
    try {
      fs.copyFileSync(outFile, rootPath);
      console.log(`Successfully copied to root: ${rootPath}`);
    } catch (e) {
      console.error("Error copying PDF to root:", e);
    }
  }
}

console.log("Starting Document Compilation Workflow...");

// Generate HSE System BRD
createDocx(
  "HSE Incident & CAPA Compliance Portal",
  "Business Requirements Document (BRD) - Platform Specification",
  "HSE_SYSTEM_BRD.md",
  "public/HSE_SYSTEM_BRD.docx"
);

createPdf(
  "HSE Incident & CAPA Compliance Portal",
  "Business Requirements Document (BRD) - Platform Specification",
  "HSE_SYSTEM_BRD.md",
  "public/HSE_SYSTEM_BRD.pdf"
);

// Generate Report Extraction BRD
createDocx(
  "HSE Compliance Extraction & Reporting System",
  "Business Requirements Document (BRD) - Automated Extraction & PDF Reporting Module",
  "REPORT_EXTRACTION_BRD.md",
  "public/REPORT_EXTRACTION_BRD.docx"
);

createPdf(
  "HSE Compliance Extraction & Reporting System",
  "Business Requirements Document (BRD) - Automated Extraction & PDF Reporting Module",
  "REPORT_EXTRACTION_BRD.md",
  "public/REPORT_EXTRACTION_BRD.pdf"
);

console.log("Compilation complete!");
