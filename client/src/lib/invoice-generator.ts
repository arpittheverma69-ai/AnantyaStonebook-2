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
}

export const generateInvoicePDF = (data: InvoiceData): jsPDF => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('ANANTYA STONEWORKS', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Premium Gemstone Solutions', 105, 30, { align: 'center' });
  
  // Company Details
  doc.setFontSize(10);
  doc.text('Address: 123 Gemstone Plaza, Jewelry District', 20, 45);
  doc.text('Mumbai, Maharashtra - 400001', 20, 52);
  doc.text('Phone: +91 98765 43210 | Email: info@anantya.com', 20, 59);
  doc.text('GST: 27AABCA1234Z1Z5', 20, 66);
  
  // Invoice Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 150, 45);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${data.invoiceNumber}`, 150, 55);
  doc.text(`Date: ${data.date}`, 150, 62);
  if (data.dueDate) {
    doc.text(`Due Date: ${data.dueDate}`, 150, 69);
  }
  
  // Client Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 85);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.clientName, 20, 95);
  if (data.firmName) {
    doc.text(data.firmName, 20, 102);
  }
  if (data.address) {
    doc.text(data.address, 20, 109);
  }
  if (data.phoneNumber) {
    doc.text(`Phone: ${data.phoneNumber}`, 20, 116);
  }
  if (data.gstNumber) {
    doc.text(`GST: ${data.gstNumber}`, 20, 123);
  }
  
  // Payment Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const statusColor = data.paymentStatus === 'Paid' ? [34, 197, 94] : 
                     data.paymentStatus === 'Partial' ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${data.paymentStatus}`, 150, 95);
  
  if (data.waitingPeriod && data.paymentStatus !== 'Paid') {
    doc.text(`Waiting Period: ${data.waitingPeriod} days`, 150, 102);
  }
  
  if (data.isTrustworthy !== undefined) {
    const trustText = data.isTrustworthy ? 'Trustworthy Client' : 'Requires Follow-up';
    const trustColor = data.isTrustworthy ? [34, 197, 94] : [239, 68, 68];
    doc.setTextColor(trustColor[0], trustColor[1], trustColor[2]);
    doc.text(trustText, 150, 109);
  }
  
  // Items Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Items', 20, 145);
  
  const tableData = data.items.map(item => [
    item.stoneId,
    item.stoneName,
    `${item.carat.toFixed(2)} ct`,
    `₹${item.pricePerCarat.toLocaleString('en-IN')}/ct`,
    `₹${item.totalPrice.toLocaleString('en-IN')}`
  ]);
  
  autoTable(doc, {
    startY: 150,
    head: [['Stone ID', 'Gemstone', 'Carat', 'Price/Carat', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 30 }
    }
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  let currentY = finalY;
  doc.text(`Subtotal: ₹${data.subtotal.toLocaleString('en-IN')}`, 150, currentY);
  currentY += 7;
  
  if (data.discount && data.discount > 0) {
    doc.text(`Discount: -₹${data.discount.toLocaleString('en-IN')}`, 150, currentY);
    currentY += 7;
  }
  
  if (data.isOutOfState && data.igst) {
    doc.text(`IGST (3%): ₹${data.igst.toLocaleString('en-IN')}`, 150, currentY);
  } else {
    if (data.cgst) {
      doc.text(`CGST (1.5%): ₹${data.cgst.toLocaleString('en-IN')}`, 150, currentY);
      currentY += 7;
    }
    if (data.sgst) {
      doc.text(`SGST (1.5%): ₹${data.sgst.toLocaleString('en-IN')}`, 150, currentY);
      currentY += 7;
    }
  }
  
  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ₹${data.totalAmount.toLocaleString('en-IN')}`, 150, currentY + 10);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 105, 270, { align: 'center' });
  doc.text('For any queries, please contact us at info@anantya.com', 105, 275, { align: 'center' });
  
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
  
  if (navigator.share && navigator.canShare) {
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