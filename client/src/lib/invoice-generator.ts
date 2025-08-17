import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  clientName: string;
  firmName?: string;
  gstNumber?: string;
  address?: string;
  phoneNumber?: string;
  items: Array<{
    stoneId: string;
    stoneName: string;
    carat: number;
    pricePerCarat: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalAmount: number;
  isOutOfState: boolean;
  paymentStatus: string;
  waitingPeriod?: number;
  isTrustworthy?: boolean;
  // Optional disclosures to print (e.g., treatments)
  treatmentDisclosures?: string[];
}

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF();

  // Helper: INR currency formatter with safe symbol
  // Note: Default jsPDF fonts do not include the ₹ glyph, which renders as ¹.
  // Using "Rs." avoids the glyph issue without embedding custom fonts.
  const formatINR = (amount: number): string => `Rs. ${amount.toLocaleString('en-IN')}`;

  // Page layout constants
  const page = {
    width: doc.internal.pageSize.getWidth(),
    height: doc.internal.pageSize.getHeight(),
    marginLeft: 20,
    marginRight: 20,
  };
  const rightX = page.width - page.marginRight; // Right-aligned anchor
  
  // Company Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('ANANTYA STONEWORKS', page.width / 2, 18, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text('Premium Gemstone Solutions', page.width / 2, 26, { align: 'center' });
  
  // Company Details (left)
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  let y = 40;
  doc.text('Address: 123 Gemstone Plaza, Jewelry District', page.marginLeft, y);
  y += 7;
  doc.text('Mumbai, Maharashtra - 400001', page.marginLeft, y);
  y += 7;
  doc.text('Phone: +91 98765 43210 | Email: info@anantya.com', page.marginLeft, y);
  y += 7;
  doc.text('GST: 27AABCA1234Z1Z5', page.marginLeft, y);
  
  // Invoice Details (right block)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', rightX, 40, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${data.invoiceNumber}`, rightX, 50, { align: 'right' });
  doc.text(`Date: ${data.date}`, rightX, 57, { align: 'right' });
  if (data.dueDate) {
    doc.text(`Due Date: ${data.dueDate}`, rightX, 64, { align: 'right' });
  }
  
  // Client Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', page.marginLeft, 82);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let billToY = 92;
  doc.text(data.clientName, page.marginLeft, billToY);
  billToY += 7;
  if (data.firmName) {
    doc.text(data.firmName, page.marginLeft, billToY, { maxWidth: 110 });
    billToY += 7;
  }
  if (data.address) {
    doc.text(data.address, page.marginLeft, billToY, { maxWidth: 110 });
    billToY += 7;
  }
  if (data.phoneNumber) {
    doc.text(`Phone: ${data.phoneNumber}`, page.marginLeft, billToY);
    billToY += 7;
  }
  if (data.gstNumber) {
    doc.text(`GST: ${data.gstNumber}`, page.marginLeft, billToY);
    billToY += 7;
  }
  
  // Payment Status (right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const statusColor = data.paymentStatus === 'Paid' ? [34, 197, 94] :
                     data.paymentStatus === 'Partial' ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${data.paymentStatus}`, rightX, 82, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  if (data.waitingPeriod && data.paymentStatus !== 'Paid') {
    doc.text(`Waiting Period: ${data.waitingPeriod} days`, rightX, 90, { align: 'right' });
  }

  if (data.isTrustworthy !== undefined) {
    const trustText = data.isTrustworthy ? 'Trustworthy Client' : 'Requires Follow-up';
    const trustColor = data.isTrustworthy ? [34, 197, 94] : [239, 68, 68];
    doc.setTextColor(trustColor[0], trustColor[1], trustColor[2]);
    doc.text(trustText, rightX, 98, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
  
  // Items Table
  const itemsStartY = Math.max(billToY + 16, 118);
  const tableData = data.items.map(item => [
    item.stoneId,
    item.stoneName,
    `${item.carat.toFixed(2)} ct`,
    `${formatINR(item.pricePerCarat)}/ct`,
    `${formatINR(item.totalPrice)}`
  ]);

  autoTable(doc, {
    startY: itemsStartY,
    margin: { left: page.marginLeft, right: page.marginRight },
    head: [['Stone ID', 'Gemstone', 'Carat', 'Price/Carat', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      valign: 'middle',
    },
    styles: {
      overflow: 'linebreak',
    },
    columnStyles: {
      0: { cellWidth: 38 }, // Stone ID
      1: { cellWidth: 58 }, // Gemstone
      2: { cellWidth: 25, halign: 'right' }, // Carat
      3: { cellWidth: 35, halign: 'right' }, // Price/Carat
      4: { cellWidth: 35, halign: 'right' }, // Total
    },
    didDrawPage: (dataCtx) => {
      // Table title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Items', page.marginLeft, itemsStartY - 6);
    },
  });
  
  // Summary / Totals (right aligned)
  const lastTableY = ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) || itemsStartY;
  let currentY = lastTableY + 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  doc.text(`Subtotal: ${formatINR(data.subtotal)}`, rightX, currentY, { align: 'right' });
  currentY += 7;

  if (data.discount && data.discount > 0) {
    doc.text(`Discount: -${formatINR(data.discount)}`, rightX, currentY, { align: 'right' });
    currentY += 7;
  }

  if (data.isOutOfState && data.igst) {
    doc.text(`IGST (3%): ${formatINR(data.igst)}`, rightX, currentY, { align: 'right' });
    currentY += 7;
  } else {
    if (typeof data.cgst === 'number') {
      doc.text(`CGST (1.5%): ${formatINR(data.cgst)}`, rightX, currentY, { align: 'right' });
      currentY += 7;
    }
    if (typeof data.sgst === 'number') {
      doc.text(`SGST (1.5%): ${formatINR(data.sgst)}`, rightX, currentY, { align: 'right' });
      currentY += 7;
    }
  }

  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${formatINR(data.totalAmount)}`, rightX, currentY + 10, { align: 'right' });
  currentY += 20;

  // Disclosures
  if (data.treatmentDisclosures && data.treatmentDisclosures.length > 0) {
    const blockY = Math.max(currentY, ((doc as any).lastAutoTable?.finalY || itemsStartY) + 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Disclosures', page.marginLeft, blockY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let dy = blockY + 6;
    data.treatmentDisclosures.forEach((line) => {
      doc.text(`• ${line}`, page.marginLeft + 2, dy, { maxWidth: page.width - page.marginLeft - page.marginRight - 4 });
      dy += 5;
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Thank you for your business!', page.width / 2, page.height - 20, { align: 'center' });
  doc.text('For any queries, please contact us at info@anantya.com', page.width / 2, page.height - 15, { align: 'center' });
  
  return doc;
};

export const downloadInvoice = (data: InvoiceData, filename?: string) => {
  const doc = generateInvoicePDF(data);
  const fileName = filename || `invoice-${data.invoiceNumber}-${data.date}.pdf`;
  doc.save(fileName);
};

export const shareInvoice = async (data: InvoiceData): Promise<string> => {
  const doc = generateInvoicePDF(data);
  const pdfBlob = doc.output('blob');
  
  if (navigator.share && navigator.canShare && navigator.canShare({})) {
    const file = new File([pdfBlob], `invoice-${data.invoiceNumber}.pdf`, {
      type: 'application/pdf',
    });
    
    try {
      await navigator.share({
        title: `Invoice ${data.invoiceNumber}`,
        text: `Invoice for ${data.clientName}`,
        files: [file],
      });
      return 'shared';
    } catch (error) {
      console.error('Error sharing:', error);
      return 'download';
    }
  } else {
    // Fallback to download
    downloadInvoice(data);
    return 'downloaded';
  }
};

export const printInvoice = (data: InvoiceData) => {
  const doc = generateInvoicePDF(data);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}; 