import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type CompanyInfo = {
  name: string;
  tagline?: string;
  addressLines: string[];
  phone?: string;
  email?: string;
  gst?: string;
};

export type StockItem = {
  id?: string;
  gemId?: string;
  type?: string;
  grade?: string;
  carat?: number | string; // may come as string from API
  weight?: number | string; // alternate name used in some data
  origin?: string;
  quantity?: number | string;
  status?: string; // In Stock, Sold, Reserved
  isAvailable?: boolean;
  pricePerCarat?: number | string;
  totalPrice?: number | string;
  sellingPrice?: number | string; // alternate name used in some data
};

const defaultCompany: CompanyInfo = {
  name: 'ANANTYA STONEWORKS',
  tagline: 'Premium Gemstone Solutions',
  addressLines: [
    '123 Gemstone Plaza, Jewelry District',
    'Mumbai, Maharashtra - 400001',
  ],
  phone: '+91 98765 43210',
  email: 'info@anantya.com',
  gst: '27AABCA1234Z1Z5',
};

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isFinite(n) ? n : undefined;
}

function formatINR(amount: number): string {
  // Avoid ₹ glyph issues in default jsPDF fonts
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

export function generateStockReportPDF(items: StockItem[], opts?: { company?: CompanyInfo; title?: string; onlyAvailable?: boolean }): jsPDF {
  const company = opts?.company || defaultCompany;
  const title = opts?.title || 'Stock Report';
  const onlyAvailable = opts?.onlyAvailable ?? true;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const page = {
    width: doc.internal.pageSize.getWidth(),
    height: doc.internal.pageSize.getHeight(),
    marginLeft: 32,
    marginRight: 32,
    marginTop: 28,
  };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(company.name, page.width / 2, page.marginTop, { align: 'center' });

  if (company.tagline) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(company.tagline, page.width / 2, page.marginTop + 14, { align: 'center' });
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  let y = page.marginTop + 30;
  const leftX = page.marginLeft;
  const contact: string[] = [];
  if (company.phone) contact.push(`Phone: ${company.phone}`);
  if (company.email) contact.push(`Email: ${company.email}`);

  const headerLines = [
    ...company.addressLines,
    contact.join(' | '),
    company.gst ? `GST: ${company.gst}` : '',
  ].filter(Boolean);

  headerLines.forEach((line) => {
    doc.text(line, leftX, y);
    y += 12;
  });

  // Title and meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, leftX, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const printedAt = new Date().toLocaleString();
  doc.text(`Printed: ${printedAt}${onlyAvailable ? ' • Available Only' : ''}`, leftX, y + 20);

  // Prepare table data
  const normalized = items
    .filter((it) => (onlyAvailable ? (it.isAvailable ?? it.status === 'In Stock') : true))
    .map((it) => {
      const carat = toNumber(it.carat) ?? toNumber(it.weight) ?? 0;
      const qty = toNumber(it.quantity) ?? 1;
      const total = toNumber(it.totalPrice) ?? toNumber(it.sellingPrice);
      const ppc = toNumber(it.pricePerCarat) ?? (total && carat ? total / carat : undefined);
      const totalVal = total ?? (ppc && carat ? ppc * carat : 0);
      return {
        gemId: it.gemId || it.id || '',
        type: it.type || '',
        grade: it.grade || '',
        carat,
        origin: it.origin || '',
        qty,
        status: it.status || (it.isAvailable ? 'In Stock' : 'Sold'),
        ppc: ppc ?? 0,
        total: totalVal,
      };
    });

  // Summary row values
  const sumQty = normalized.reduce((s, r) => s + (Number.isFinite(r.qty) ? (r.qty as number) : 0), 0);
  const sumCarat = normalized.reduce((s, r) => s + (Number.isFinite(r.carat) ? (r.carat as number) : 0), 0);
  const sumValue = normalized.reduce((s, r) => s + (Number.isFinite(r.total) ? (r.total as number) : 0), 0);

  // Table
  const startY = y + 30;
  autoTable(doc, {
    startY,
    margin: { left: page.marginLeft, right: page.marginRight },
    head: [[
      'Gem ID',
      'Type',
      'Grade',
      'Carat',
      'Origin',
      'Qty',
      'Status',
      'Price/ct',
      'Total',
    ]],
    body: normalized.map((r) => [
      String(r.gemId),
      String(r.type),
      String(r.grade),
      `${(r.carat as number).toFixed(2)}`,
      String(r.origin),
      String(r.qty),
      String(r.status),
      r.ppc ? formatINR(r.ppc as number) : '-',
      formatINR(r.total as number),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
    },
    styles: { overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 72 }, // Gem ID
      1: { cellWidth: 84 }, // Type
      2: { cellWidth: 40 }, // Grade
      3: { cellWidth: 44, halign: 'right' }, // Carat
      4: { cellWidth: 72 }, // Origin
      5: { cellWidth: 30, halign: 'right' }, // Qty
      6: { cellWidth: 58 }, // Status
      7: { cellWidth: 56, halign: 'right' }, // Price/ct
      8: { cellWidth: 64, halign: 'right' }, // Total
    },
    didDrawPage: (dataCtx) => {
      // Footer page number
      const pageNumber = `${doc.getCurrentPageInfo().pageNumber}`;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Page ${pageNumber}`, page.width - page.marginRight, page.height - 16, { align: 'right' });
    },
  });

  // Totals section
  const finalY = (doc as any).lastAutoTable?.finalY || startY;
  let sy = finalY + 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Summary', leftX, sy);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  sy += 14;
  doc.text(`Items: ${normalized.length}`, leftX, sy);
  sy += 12;
  doc.text(`Total Qty: ${sumQty}`, leftX, sy);
  sy += 12;
  doc.text(`Total Carat: ${sumCarat.toFixed(2)} ct`, leftX, sy);
  sy += 12;
  doc.text(`Total Value: ${formatINR(sumValue)}`, leftX, sy);

  return doc;
}

export function downloadStockReport(items: StockItem[], opts?: { company?: CompanyInfo; title?: string; onlyAvailable?: boolean; filename?: string }) {
  const doc = generateStockReportPDF(items, opts);
  const filename = opts?.filename || `${(opts?.title || 'Stock_Report').replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}


