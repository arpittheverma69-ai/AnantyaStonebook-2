import React, { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { InvoiceData } from '@/lib/invoice-generator';
import QRCode from 'qrcode';
import { companyProfileService } from '@/lib/company-profile';

function formatINR(n: number) {
  return `Rs. ${Math.round(n).toLocaleString('en-IN')}`;
}

// Indian currency in words (basic; supports up to crores)
function amountToWordsINR(amount: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function twoDigits(n: number): string {
    if (n < 20) return a[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return b[tens] + (ones ? ' ' + a[ones] : '');
  }
  function threeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return (hundred ? a[hundred] + ' Hundred' + (rest ? ' ' : '') : '') + (rest ? twoDigits(rest) : '');
  }
  const num = Math.floor(amount);
  const paise = Math.round((amount - num) * 100);
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;
  let words = '';
  if (crore) words += threeDigits(crore) + ' Crore ';
  if (lakh) words += threeDigits(lakh) + ' Lakh ';
  if (thousand) words += threeDigits(thousand) + ' Thousand ';
  if (hundred) words += threeDigits(hundred);
  words = words.trim() || 'Zero';
  if (paise) {
    return `${words} and ${twoDigits(paise)} Paise`;
  }
  return words + ' Only';
}

type ExtendedItem = InvoiceData['items'][number] & { hsn?: string; unit?: string; quantity?: number };
type ExtendedInvoiceData = InvoiceData & {
  // Company details
  companyName?: string;
  companyTagline?: string;
  companyAddressLines?: string[];
  companyPhone?: string;
  companyEmail?: string;
  companyGstin?: string;
  companyStateName?: string;
  companyStateCode?: string;
  companyTin?: string;
  companyPan?: string;
  // Buyer
  buyerStateName?: string;
  buyerStateCode?: string;
  buyerTin?: string;
  // Invoice meta
  deliveryNote?: string;
  paymentTerms?: string;
  referenceNumber?: string;
  referenceDate?: string;
  otherReferences?: string;
  buyersOrderNumber?: string;
  buyersOrderDate?: string;
  dispatchDocNo?: string;
  deliveryNoteDate?: string;
  dispatchedThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
  // Banking
  bankName?: string;
  bankAccount?: string;
  bankIfsc?: string;
  bankBranch?: string;
  // Items extended
  items: ExtendedItem[];
};

function parseData(param: string | null): Partial<ExtendedInvoiceData> | null {
  if (!param) return null;
  try {
    // Support base64 or URI-encoded JSON
    let jsonStr = param;
    try {
      jsonStr = atob(param);
    } catch {}
    const data = JSON.parse(decodeURIComponent(jsonStr));
    return data;
  } catch {
    return null;
  }
}

const sampleInvoice: ExtendedInvoiceData = {
  invoiceNumber: 'INV-2025-001',
  date: new Date().toLocaleDateString(),
  dueDate: undefined,
  clientName: 'M/s. Shree Jewels',
  firmName: 'Shree Jewels & Co.',
  gstNumber: '27ABCFS1234H1Z8',
  address: '12, Zaveri Bazaar, Kalbadevi, Mumbai - 400002',
  phoneNumber: '+91 99200 11223',
  items: [
    { stoneId: 'RBY-0001', stoneName: 'Ruby (Manik)', carat: 3.25, pricePerCarat: 25000, totalPrice: 81250, hsn: '7113', unit: 'ct', quantity: 1 },
    { stoneId: 'BLS-0042', stoneName: 'Blue Sapphire (Neelam)', carat: 4.10, pricePerCarat: 32000, totalPrice: 131200, hsn: '7113', unit: 'ct', quantity: 1 },
  ],
  subtotal: 212450,
  discount: 5000,
  cgst: 3108,
  sgst: 3108,
  igst: undefined,
  totalAmount: 213666,
  isOutOfState: false,
  paymentStatus: 'Unpaid',
  waitingPeriod: 7,
  isTrustworthy: true,
  treatmentDisclosures: ['Heated sapphire disclosure as per standard trade practice. No diffusion detected.'],
  // Extended example fields
  companyName: 'ANANTYA STONEWORKS',
  companyTagline: 'Premium Gemstone Solutions',
  companyAddressLines: ['123 Gemstone Plaza, Jewelry District', 'Mumbai, Maharashtra - 400001'],
  companyPhone: '+91 98765 43210',
  companyEmail: 'info@anantya.com',
  companyGstin: '27AABCA1234Z1Z5',
  companyStateName: 'Maharashtra',
  companyStateCode: '27',
  buyerStateName: 'Maharashtra',
  buyerStateCode: '27',
  companyTin: '09627100742',
  buyerTin: '098712342391',
  companyPan: 'AABCA1234Z',
  bankName: 'HDFC Bank',
  bankAccount: '123456789012',
  bankIfsc: 'HDFC0000123',
  bankBranch: 'Fort Branch',
  deliveryNote: '',
  paymentTerms: 'Due on receipt',
  referenceNumber: '',
  referenceDate: '',
  otherReferences: '',
  buyersOrderNumber: '',
  buyersOrderDate: '',
  dispatchDocNo: '',
  deliveryNoteDate: '',
  dispatchedThrough: '',
  destination: 'Mumbai',
  termsOfDelivery: 'As discussed',
};

export default function InvoicePrint() {
  const [params] = useSearchParams();
  const raw = parseData(params.get('data'));
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const data: ExtendedInvoiceData = useMemo(() => {
    // Load company profile
    const companyProfile = companyProfileService.get();
    
    if (!raw) return { ...sampleInvoice, ...companyProfile };
    
    const items = (Array.isArray(raw.items) && raw.items.length > 0 ? raw.items : sampleInvoice.items) as ExtendedItem[];
    const subtotal = (raw.subtotal as number) ?? items.reduce((s, it) => s + (it.totalPrice || (it.pricePerCarat * it.carat)), 0);
    const isOutOfState = !!raw.isOutOfState;
    const discount = Number(raw.discount || 0);
    let cgst: number | undefined = undefined;
    let sgst: number | undefined = undefined;
    let igst: number | undefined = undefined;
    if (isOutOfState) {
      igst = Number(raw.igst ?? Math.round(subtotal * 0.03));
    } else {
      cgst = Number(raw.cgst ?? Math.round(subtotal * 0.015));
      sgst = Number(raw.sgst ?? Math.round(subtotal * 0.015));
    }
    const totalAmount = Number(raw.totalAmount || Math.max(0, subtotal - discount + (igst || 0) + (cgst || 0) + (sgst || 0)));
    
    return {
      ...sampleInvoice,
      ...companyProfile, // Merge company profile data
      ...raw,
      items,
      subtotal,
      discount,
      cgst,
      sgst,
      igst,
      totalAmount,
      date: (raw.date as string) || sampleInvoice.date,
      invoiceNumber: (raw.invoiceNumber as string) || sampleInvoice.invoiceNumber,
      paymentStatus: (raw.paymentStatus as string) || 'Unpaid',
    } as ExtendedInvoiceData;
  }, [raw]);

  const taxes = data.isOutOfState
    ? [{ label: 'IGST (3%)', value: data.igst || 0 }]
    : [
        { label: 'CGST (1.5%)', value: data.cgst || 0 },
        { label: 'SGST (1.5%)', value: data.sgst || 0 },
      ];

  const roundedTotal = Math.round(data.totalAmount);
  const roundedOff = +(roundedTotal - data.totalAmount).toFixed(2);
  const amountInWords = `Indian Rupees ${amountToWordsINR(roundedTotal)}`;
  const taxTotal = (data.cgst || 0) + (data.sgst || 0) + (data.igst || 0);
  const taxInWords = `Indian Rupees ${amountToWordsINR(taxTotal)}`;

  const qrTarget = useMemo(() => {
    const r: any = raw || {};
    return r.qrUrl || r.invoiceUrl || `${window.location.origin}/invoice/print?invoice=${encodeURIComponent(data.invoiceNumber)}`;
  }, [raw, data.invoiceNumber]);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrTarget, { width: 80, margin: 0 })
      .then((url) => { if (isMounted) setQrDataUrl(url); })
      .catch(() => { if (isMounted) setQrDataUrl(''); });
    return () => { isMounted = false; };
  }, [qrTarget]);

  return (
    <div>
      <style>{`
        :root { --page-w: 210mm; --page-h: 297mm; }
        @page { size: A4; margin: 3mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .page { box-shadow: none; }
        }
        body { background: #f5f5f5; }
        .page {
          width: var(--page-w);
          min-height: var(--page-h);
          margin: 8px auto;
          background: #fff;
          color: #111;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 6mm 5mm;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        }
        .row { display: flex; gap: 8px; }
        .space { height: 4px; }
        .muted { color: #6b7280; }
        .title { font-weight: 700; font-size: 14px; }
        .subtitle { font-size: 10px; color: #6b7280; }
        .h1 { font-weight: 800; font-size: 16px; letter-spacing: 0.2px; }
        .badge { font-size: 9px; padding: 1px 6px; border-radius: 999px; border: 1px solid #e5e7eb; }
        .paid { color: #059669; border-color: #a7f3d0; background: #ecfdf5; }
        .partial { color: #ca8a04; border-color: #fde68a; background: #fffbeb; }
        .unpaid { color: #dc2626; border-color: #fecaca; background: #fef2f2; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 4px 3px; border: 1px solid #111; font-size: 10px; }
        th { text-align: left; background: #f9fafb; font-weight: 600; }
        tfoot td { font-weight: 600; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .right { text-align: right; }
        .section-title { font-weight: 700; font-size: 11px; margin: 4px 0; }
        .small { font-size: 9px; line-height: 1.28; }
        .dev-title { font-family: 'Noto Sans Devanagari','Mangal','Kohinoor Devanagari','Devanagari Sangam MN',sans-serif; font-weight: 500; font-size: 14px; letter-spacing: 0.4px; color: #444; }
        .dev-orn { font-size: 9px; color: #777; }
        .footer { position: relative; margin-top: 4mm; color: #6b7280; font-size: 9px; text-align: center; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8mm; }
        .sig-box { height: 22mm; border: 1px dashed #d1d5db; border-radius: 4px; padding: 6px; position: relative; }
        .box { border: 1px solid #111; padding: 6px; }
        .box-grid { display: grid; grid-template-columns: repeat(2, 1fr); border: 1px solid #111; }
        .box-grid > div { padding: 6px; border-right: 1px solid #111; border-bottom: 1px solid #111; }
        .box-grid > div:nth-child(2n) { border-right: none; }
        .box-grid > div:last-child, .box-grid > div:nth-last-child(2) { border-bottom: none; }
      `}</style>

      <div className="no-print" style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, fontSize: 12 }}>
        <button onClick={() => window.print()} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#111827', color: 'white' }}>Print</button>
        <span className="muted">Tip: In the print dialog, turn off “Headers and footers” to hide the URL/date.</span>
      </div>

      <div className="page">
        {/* Hindi title above the header section */}
        <div style={{ textAlign: 'center', marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span className="dev-orn">❂</span>
          <div className="dev-title">श्री हित हरवंश</div>
          <span className="dev-orn">❂</span>
        </div>

        {/* Header with border */}
        <div className="box" style={{ marginBottom: 10 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="h1">{data.companyName || 'ANANTYA STONEWORKS'}</div>
              {data.companyTagline ? <div className="subtitle">{data.companyTagline}</div> : null}
              <div className="space" />
              {(data.companyAddressLines || sampleInvoice.companyAddressLines)?.map((l, i) => (
                <div className="small" key={i}>{l}</div>
              ))}
              <div className="small">
                {(data.companyPhone ? `Phone: ${data.companyPhone}` : '') + (data.companyEmail ? ` | Email: ${data.companyEmail}` : '')}
              </div>
              {data.companyGstin ? <div className="small">GSTIN/UIN: {data.companyGstin}</div> : null}
              {(data.companyStateName || data.companyStateCode) ? (
                <div className="small">State Name: {data.companyStateName || ''}{data.companyStateCode ? `, Code : ${data.companyStateCode}` : ''}</div>
              ) : null}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="title">INVOICE</div>
              <div className="small">Invoice #: {data.invoiceNumber}</div>
              <div className="small">Date: {data.date}</div>
              {data.dueDate ? <div className="small">Due Date: {data.dueDate}</div> : null}
              {/* Status hidden per request */}
            </div>
          </div>
        </div>

        {/* Bill To with border grid */}
        <div className="box-grid" style={{ marginBottom: 10 }}>
          <div>
            <div className="section-title">Buyer (Bill to)</div>
            <div style={{ fontWeight: 600 }}>{data.clientName}</div>
            {data.firmName ? <div className="small">{data.firmName}</div> : null}
            {data.address ? <div className="small">{data.address}</div> : null}
            <div className="small">{data.gstNumber ? `GSTIN/UIN: ${data.gstNumber}` : ''}</div>
            {(data.buyerStateName || data.buyerStateCode) ? (
              <div className="small">State Name : {data.buyerStateName || ''}{data.buyerStateCode ? `, Code : ${data.buyerStateCode}` : ''}</div>
            ) : null}
          </div>
          <div>
            <div className="section-title">Invoice Meta</div>
            <div className="small">Delivery Note: {data.deliveryNote || '-'}</div>
            <div className="small">Mode/Terms of Payment: {data.paymentTerms || '-'}</div>
            <div className="small">Reference No. & Date: {(data.referenceNumber || '-')}{data.referenceDate ? `, ${data.referenceDate}` : ''}</div>
            <div className="small">Other References: {data.otherReferences || '-'}</div>
          </div>
          <div>
            <div className="small">Buyer’s Order No.: {data.buyersOrderNumber || '-'}</div>
            <div className="small">Dated: {data.buyersOrderDate || '-'}</div>
            <div className="small">Dispatch Doc No.: {data.dispatchDocNo || '-'}</div>
          </div>
          <div>
            <div className="small">Delivery Note Date: {data.deliveryNoteDate || '-'}</div>
            <div className="small">Dispatched through: {data.dispatchedThrough || '-'}</div>
            <div className="small">Destination: {data.destination || '-'}</div>
            <div className="small">Terms of Delivery: {data.termsOfDelivery || '-'}</div>
          </div>
        </div>

        {/* Items */}
        <table>
          <thead>
            <tr>
              <th style={{ width: '4%' }}>Sl</th>
              <th style={{ width: '32%' }}>Description of Goods</th>
              <th style={{ width: '10%' }}>HSN/SAC</th>
              <th style={{ width: '12%' }} className="right">Quantity</th>
              <th style={{ width: '12%' }} className="right">Rate</th>
              <th style={{ width: '6%' }}>per</th>
              <th style={{ width: '14%' }} className="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, idx) => {
              const unit = (it as ExtendedItem).unit || 'ct';
              const qty = (it as ExtendedItem).quantity || 1;
              const quantityText = unit.toLowerCase() === 'ct' ? `${it.carat.toFixed(3)} ${unit}` : `${qty} ${unit}`;
              const rate = unit.toLowerCase() === 'ct' ? it.pricePerCarat : (it.totalPrice / (qty || 1));
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <div>{it.stoneName}</div>
                    <div className="small muted">ID: {it.stoneId}</div>
                  </td>
                  <td>{(it as ExtendedItem).hsn || '7113'}</td>
                  <td className="right">{quantityText}</td>
                  <td className="right">{formatINR(rate)}</td>
                  <td>{unit.toUpperCase()}</td>
                  <td className="right">{formatINR(it.totalPrice)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals block with borders */}
        <div className="box" style={{ marginTop: 8 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div className="small muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Invoice QR" style={{ width: 80, height: 80 }} />
                ) : null}
                <span>E. & O.E</span>
              </div>
            </div>
            <div style={{ width: '50%' }}>
              <table>
                <tbody>
                  <tr>
                    <td style={{ width: '60%', textAlign: 'right' }}>Subtotal</td>
                    <td className="right">{formatINR(data.subtotal)}</td>
                  </tr>
                  {data.discount && data.discount > 0 ? (
                    <tr>
                      <td style={{ textAlign: 'right' }}>Less: Discount</td>
                      <td className="right">- {formatINR(data.discount)}</td>
                    </tr>
                  ) : null}
                  {taxes.map((t, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'right' }}>{t.label}</td>
                      <td className="right">{formatINR(t.value)}</td>
                    </tr>
                  ))}
                  {roundedOff !== 0 ? (
                    <tr>
                      <td style={{ textAlign: 'right' }}>Less : ROUNDED OFF</td>
                      <td className="right">{roundedOff > 0 ? '-' : ''}{formatINR(Math.abs(roundedOff))}</td>
                    </tr>
                  ) : null}
                  <tr>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>Total</td>
                    <td className="right" style={{ fontWeight: 700 }}>{formatINR(roundedTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Amount in words (taller section) */}
        <div className="box" style={{ marginTop: 8, padding: '8px 8px', minHeight: '14mm' }}>
          <div className="small" style={{ fontSize: 10 }}>Amount Chargeable (in words)</div>
          <div className="small" style={{ fontWeight: 600, fontSize: 10 }}>{amountInWords}</div>
        </div>

        {/* HSN Tax Summary */}
        <div className="box" style={{ marginTop: 8, padding: '8px 8px', minHeight: '30mm' }}>
          <table>
            <thead>
              <tr>
                <th>HSN/SAC</th>
                <th className="right">Taxable Value</th>
                <th className="right">CGST Rate</th>
                <th className="right">CGST Amount</th>
                <th className="right">SGST/UTGST Rate</th>
                <th className="right">SGST/UTGST Amount</th>
                <th className="right">Total Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const hsn = (data.items[0] as ExtendedItem).hsn || '7113';
                const taxable = data.subtotal - (data.discount || 0);
                const cg = data.cgst || 0;
                const sg = data.sgst || 0;
                const cgRate = taxable ? ((cg / taxable) * 100).toFixed(2) + '%' : '—';
                const sgRate = taxable ? ((sg / taxable) * 100).toFixed(2) + '%' : '—';
                return (
                  <tr>
                    <td>{hsn}</td>
                    <td className="right">{formatINR(taxable)}</td>
                    <td className="right">{cg ? cgRate : '—'}</td>
                    <td className="right">{cg ? formatINR(cg) : '—'}</td>
                    <td className="right">{sg ? sgRate : '—'}</td>
                    <td className="right">{sg ? formatINR(sg) : '—'}</td>
                    <td className="right">{formatINR(cg + sg)}</td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
          <div className="small" style={{ marginTop: 6 }}>Tax Amount (in words): {taxInWords}</div>
        </div>

        {/* Disclosures & Notes */}
        {(data.treatmentDisclosures && data.treatmentDisclosures.length > 0) ? (
          <div className="box" style={{ marginTop: 8 }}>
            <div className="section-title">Disclosures</div>
            <div className="small">
              {data.treatmentDisclosures.map((d, i) => (
                <div key={i}>• {d}</div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Payment & Terms */}
        <div className="box-grid" style={{ marginTop: 10 }}>
          <div style={{ minHeight: '26mm' }}>
            <div className="section-title" style={{ marginBottom: 2 }}>Company’s Tax IDs</div>
            <div className="small" style={{ lineHeight: 1.2 }}>
              {data.companyTin ? (<div>Company’s VAT TIN : {data.companyTin}</div>) : null}
              {data.buyerTin ? (<div>Buyer’s VAT TIN : {data.buyerTin}</div>) : null}
              {data.companyPan ? (<div>Company’s PAN : {data.companyPan}</div>) : null}
            </div>
          </div>
          <div style={{ minHeight: '26mm' }}>
            <div className="section-title">Company’s Bank Details</div>
            <div className="small">Bank Name : {data.bankName || '-'}</div>
            <div className="small">A/c No. : {data.bankAccount || '-'}</div>
            <div className="small">Branch & IFS Code : {(data.bankBranch || '-') + (data.bankIfsc ? `, ${data.bankIfsc}` : '')}</div>
          </div>
          <div style={{ gridColumn: '1 / span 2', minHeight: '26mm' }}>
            <div className="section-title">Declaration</div>
            <div className="small" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ maxWidth: '70%' }}>
                We declare that this invoice shows the actual price of the goods described<br/>
                and that all particulars are true and correct.
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="small" style={{ fontWeight: 700, fontSize: 12 }}>For {data.companyName || 'ANANTYA STONEWORKS'}</div>
                <div style={{ height: '14mm' }} />
                <div className="small">Authorised Signatory</div>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures removed per request */}

        <div className="footer">
          Thank you for your business! For queries: info@anantya.com | +91 98765 43210
        </div>
      </div>
    </div>
  );
}


