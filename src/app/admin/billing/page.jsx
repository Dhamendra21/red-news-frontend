"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Printer, Save, FileText, Download } from 'lucide-react';

export default function BillingPage() {
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
  
  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], // +15 days
    client: {
      name: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      gstin: ''
    },
    items: [
      { description: '', quantity: 1, unitPrice: 0, total: 0 }
    ],
    subtotal: 0,
    taxRate: 18,
    taxAmount: 0,
    discount: 0,
    grandTotal: 0,
    notes: 'Thank you for doing business with RED NEWS BHARAT.',
    bankDetails: {
      bankName: 'State Bank of India',
      accountNumber: '12345678901',
      ifsc: 'SBIN0001234',
      upiId: 'rednews@sbi'
    }
  });

  // Fetch next invoice number on mount
  useEffect(() => {
    const fetchNextNum = async () => {
      try {
        const res = await api.get('/invoices/next-number');
        setNextInvoiceNumber(res.data.nextNumber);
        setInvoice(prev => ({ ...prev, invoiceNumber: res.data.nextNumber }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchNextNum();
  }, []);

  // Calculate totals whenever items, taxRate, or discount changes
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = (subtotal * invoice.taxRate) / 100;
    const grandTotal = subtotal + taxAmount - invoice.discount;

    setInvoice(prev => ({ ...prev, subtotal, taxAmount, grandTotal }));
  }, [invoice.items, invoice.taxRate, invoice.discount]);

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      client: { ...prev.client, [name]: value }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    const val = field === 'description' ? value : Number(value);
    
    newItems[index][field] = val;
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (invoice.items.length === 1) return;
    const newItems = invoice.items.filter((_, i) => i !== index);
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const handleSaveAndPrint = async () => {
    if (!invoice.client.name || invoice.items.some(i => !i.description)) {
      toast.error('Please fill client name and all item descriptions');
      return;
    }

    try {
      toast.loading('Saving invoice...', { id: 'save' });
      await api.post('/invoices', invoice);
      toast.success('Invoice saved!', { id: 'save' });
      
      // Trigger print dialog after slight delay
      setTimeout(() => {
        window.print();
      }, 500);
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save invoice', { id: 'save' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 print:block print:h-auto overflow-hidden print:overflow-visible pb-10 print:pb-0">
      
      {/* LEFT PANEL: Controls (Hidden in Print) */}
      <div className="w-full md:w-1/2 flex flex-col h-full bg-white rounded-xl shadow-sm border print:hidden overflow-y-auto">
        <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={20} /> Invoice Builder</h2>
          <button 
            onClick={handleSaveAndPrint}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Printer size={16} /> Save & Print PDF
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Number</label>
              <input type="text" value={invoice.invoiceNumber} onChange={e => setInvoice({...invoice, invoiceNumber: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date</label>
              <input type="date" value={invoice.invoiceDate} onChange={e => setInvoice({...invoice, invoiceDate: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
              <input type="date" value={invoice.dueDate} onChange={e => setInvoice({...invoice, dueDate: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400" />
            </div>
          </div>

          {/* Client */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Client Details</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="text" name="name" placeholder="Contact Name *" value={invoice.client.name} onChange={handleClientChange} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400" />
              <input type="text" name="companyName" placeholder="Company/Brand Name" value={invoice.client.companyName} onChange={handleClientChange} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="text" name="phone" placeholder="Phone" value={invoice.client.phone} onChange={handleClientChange} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400" />
              <input type="email" name="email" placeholder="Email" value={invoice.client.email} onChange={handleClientChange} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400" />
            </div>
            <div className="mb-3">
              <textarea name="address" placeholder="Billing Address" value={invoice.client.address} onChange={handleClientChange} rows="2" className="w-full border rounded p-2 text-sm outline-none focus:border-red-400 resize-none" />
            </div>
            <div>
              <input type="text" name="gstin" placeholder="Client GSTIN (Optional)" value={invoice.client.gstin} onChange={handleClientChange} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400 uppercase" />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Line Items</h3>
              <button onClick={addItem} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded flex items-center gap-1"><Plus size={12}/> Add Row</button>
            </div>
            
            <div className="space-y-2">
              {invoice.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input type="text" placeholder="Description (e.g. Banner Ad 30 Days)" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} className="flex-1 border rounded p-2 text-sm outline-none focus:border-red-400" />
                  <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} className="w-16 border rounded p-2 text-sm outline-none focus:border-red-400 text-center" />
                  <input type="number" min="0" placeholder="Price" value={item.unitPrice} onChange={e => handleItemChange(i, 'unitPrice', e.target.value)} className="w-24 border rounded p-2 text-sm outline-none focus:border-red-400 text-right" />
                  <div className="w-24 p-2 bg-gray-50 border rounded text-sm text-right font-medium text-gray-600">₹{item.total}</div>
                  <button onClick={() => removeItem(i)} className="p-2 text-gray-400 hover:text-red-500 rounded border border-transparent hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Financials & Notes */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes / Terms</label>
              <textarea value={invoice.notes} onChange={e => setInvoice({...invoice, notes: e.target.value})} rows="3" className="w-full border rounded p-2 text-sm outline-none focus:border-red-400 resize-none" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">GST Rate (%)</span>
                <input type="number" min="0" max="100" value={invoice.taxRate} onChange={e => setInvoice({...invoice, taxRate: Number(e.target.value)})} className="w-20 border rounded p-1 text-sm outline-none text-right" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Flat Discount (₹)</span>
                <input type="number" min="0" value={invoice.discount} onChange={e => setInvoice({...invoice, discount: Number(e.target.value)})} className="w-24 border rounded p-1 text-sm outline-none text-right" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: A4 Printable Preview */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto print:overflow-visible print:w-full print:block">
        <div className="bg-white shadow-lg mx-auto print:shadow-none print:mx-0 w-full max-w-[800px] min-h-[1050px] p-10 relative">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-red-600 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-red-600 tracking-tighter mb-1">RED NEWS BHARAT</h1>
              <p className="text-xs text-gray-500 font-medium">Digital Media & News Network</p>
              <div className="text-xs text-gray-500 mt-3 leading-relaxed">
                <p>Raipur, Chhattisgarh, India</p>
                <p>Email: contact@rednewsbharat.live</p>
                <p>Web: www.rednewsbharat.live</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-light text-gray-300 tracking-widest uppercase mb-4">Invoice</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-gray-500 font-medium">Invoice No:</span>
                <span className="font-bold text-gray-800 text-right">{invoice.invoiceNumber || 'DRAFT'}</span>
                
                <span className="text-gray-500 font-medium">Date:</span>
                <span className="text-gray-800 text-right">{invoice.invoiceDate}</span>
                
                <span className="text-gray-500 font-medium">Due Date:</span>
                <span className="text-gray-800 text-right">{invoice.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-1">Billed To</h3>
            <div className="text-sm text-gray-800 leading-relaxed">
              {invoice.client.companyName ? (
                <>
                  <p className="font-bold text-base">{invoice.client.companyName}</p>
                  <p>Attn: {invoice.client.name}</p>
                </>
              ) : (
                <p className="font-bold text-base">{invoice.client.name || 'Client Name'}</p>
              )}
              {invoice.client.address && <p className="whitespace-pre-wrap mt-1">{invoice.client.address}</p>}
              {invoice.client.phone && <p className="mt-1">Ph: {invoice.client.phone}</p>}
              {invoice.client.email && <p>Email: {invoice.client.email}</p>}
              {invoice.client.gstin && <p className="mt-2 font-medium">GSTIN: {invoice.client.gstin.toUpperCase()}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8 min-h-[300px]">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider border-b-2 border-gray-200">
                  <th className="p-3 font-bold">#</th>
                  <th className="p-3 font-bold w-1/2">Description</th>
                  <th className="p-3 font-bold text-center">Qty</th>
                  <th className="p-3 font-bold text-right">Unit Price</th>
                  <th className="p-3 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-gray-500">{idx + 1}</td>
                    <td className="p-3 font-medium text-gray-800">{item.description || '-'}</td>
                    <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="p-3 text-right text-gray-600">₹{item.unitPrice.toLocaleString()}</td>
                    <td className="p-3 text-right font-medium text-gray-800">₹{item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Details */}
          <div className="flex justify-between items-start mb-12">
            <div className="w-1/2 pr-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-1">Payment Information</h3>
              <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded border">
                <p><span className="font-medium w-24 inline-block">Bank Name:</span> {invoice.bankDetails.bankName}</p>
                <p><span className="font-medium w-24 inline-block">Account No:</span> {invoice.bankDetails.accountNumber}</p>
                <p><span className="font-medium w-24 inline-block">IFSC Code:</span> {invoice.bankDetails.ifsc}</p>
                <p><span className="font-medium w-24 inline-block">UPI ID:</span> {invoice.bankDetails.upiId}</p>
              </div>
              
              {invoice.notes && (
                <div className="mt-4 text-xs text-gray-500 italic">
                  <span className="font-semibold block mb-1 not-italic">Notes:</span>
                  {invoice.notes}
                </div>
              )}
            </div>

            <div className="w-1/2 md:w-5/12">
              <div className="bg-gray-50 rounded p-4 border text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Discount</span>
                    <span>-₹{invoice.discount.toLocaleString()}</span>
                  </div>
                )}
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between mb-3 text-gray-600 border-b pb-3">
                    <span>GST ({invoice.taxRate}%)</span>
                    <span>₹{invoice.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-gray-200">
                  <span className="text-base font-bold text-gray-800">Grand Total</span>
                  <span className="text-xl font-black text-red-600">₹{invoice.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="absolute bottom-10 right-10 text-center">
            <div className="w-48 border-b border-gray-400 mb-2"></div>
            <p className="text-xs font-bold text-gray-800">Authorized Signatory</p>
            <p className="text-[10px] text-gray-500">For RED NEWS BHARAT</p>
          </div>

        </div>
      </div>
      
      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
