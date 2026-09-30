"use client";
import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Printer, Save, FileText, Download, Clock, ChevronRight } from 'lucide-react';

export default function BillingPage() {
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('');
  const [previousInvoices, setPreviousInvoices] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const invoiceRef = useRef(null);

  const defaultInvoice = {
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
    taxRate: 0, // GST removed for now
    taxAmount: 0,
    discount: 0,
    grandTotal: 0,
    notes: 'Thank you for doing business with RED NEWS BHARAT.',
    bankDetails: {
      bankName: 'Bank of Baroda',
      accountNumber: '87610100006083',
      ifsc: 'BARB0DBKDUR',
      upiId: '9407620205-2@axl '
    }
  };

  const [invoice, setInvoice] = useState(defaultInvoice);

  // Fetch initial data
  useEffect(() => {
    fetchNextNum();
    fetchPreviousInvoices();
  }, []);

  const fetchNextNum = async () => {
    try {
      const res = await api.get('/invoices/next-number');
      setNextInvoiceNumber(res.data.nextNumber);
      setInvoice(prev => ({ ...prev, invoiceNumber: res.data.nextNumber }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPreviousInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setPreviousInvoices(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate totals
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

  const loadPreviousInvoice = (inv) => {
    setInvoice({
      ...inv,
      invoiceDate: inv.invoiceDate || defaultInvoice.invoiceDate,
      dueDate: inv.dueDate || defaultInvoice.dueDate,
    });
    setShowHistory(false);
  };

  const startNewInvoice = () => {
    setInvoice({ ...defaultInvoice, invoiceNumber: nextInvoiceNumber });
    setShowHistory(false);
  };

  const handleSave = async () => {
    if (!invoice.client.name || invoice.items.some(i => !i.description)) {
      toast.error('Please fill client name and all item descriptions');
      return false;
    }

    try {
      if (!invoice._id) {
        toast.loading('Saving invoice...', { id: 'save' });
        const res = await api.post('/invoices', invoice);
        
        // Update local state to reflect it is now saved
        setInvoice(prev => ({ ...prev, _id: res.data.data._id }));
        
        toast.success('Invoice saved!', { id: 'save' });
        fetchPreviousInvoices();
        fetchNextNum();
      } else {
        toast.success('Invoice is already saved!', { id: 'save' });
      }
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save', { id: 'save' });
      return false;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndPrint = async () => {
    const success = await handleSave();
    if (success) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  return (
    <div id="billing-root" className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 overflow-hidden pb-10">
      
      {/* LEFT PANEL: Controls (Hidden in Print) */}
      <div id="billing-controls" className="w-full md:w-1/2 flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 border-b bg-white flex justify-between items-center shrink-0">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={20} /> Invoice Builder</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1"
            >
              <Clock size={16} /> History
            </button>
            <button 
              onClick={handleSave}
              className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Save size={16} /> Save
            </button>
            <button 
              onClick={handlePrint}
              className="bg-gray-100 hover:bg-gray-200 border text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Download size={16} /> Print/Download
            </button>
            <button 
              onClick={handleSaveAndPrint}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Printer size={16} /> Save & Print
            </button>
          </div>
        </div>
        
        {/* Editor or History View */}
        <div className="flex-1 overflow-y-auto relative">
          
          {/* HISTORY VIEW OVERLAY */}
          {showHistory && (
            <div className="absolute inset-0 bg-white z-20 p-5 overflow-y-auto">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-gray-800">Previous Invoices</h3>
                <button onClick={startNewInvoice} className="text-sm text-red-600 hover:underline font-medium">+ New Invoice</button>
              </div>
              {previousInvoices.length === 0 ? (
                <p className="text-gray-500 text-sm">No invoices found.</p>
              ) : (
                <div className="space-y-2">
                  {previousInvoices.map(inv => (
                    <div 
                      key={inv._id} 
                      onClick={() => loadPreviousInvoice(inv)}
                      className="p-3 border rounded-lg hover:border-red-400 hover:bg-red-50 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <div>
                        <p className="font-bold text-sm text-gray-800">{inv.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">{inv.client.name} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-800">₹{inv.grandTotal.toLocaleString()}</p>
                        <ChevronRight size={16} className="text-gray-400 inline" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EDITOR FORM */}
          <div className="p-5 space-y-6">
            {invoice._id && (
              <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm flex justify-between items-center">
                <span>Viewing saved invoice <strong>{invoice.invoiceNumber}</strong>. Modifying and saving will overwrite it.</span>
                <button onClick={startNewInvoice} className="bg-white px-2 py-1 rounded border shadow-sm text-xs font-bold">Clear</button>
              </div>
            )}
            {/* Meta */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Number</label>
                <input type="text" value={invoice.invoiceNumber} onChange={e => setInvoice({...invoice, invoiceNumber: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-red-400 font-mono bg-gray-50" readOnly={!!invoice._id} />
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
              {/* GSTIN removed from UI for now as requested */}
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
                {/* GST Rate removed from UI */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Flat Discount (₹)</span>
                  <input type="number" min="0" value={invoice.discount} onChange={e => setInvoice({...invoice, discount: Number(e.target.value)})} className="w-24 border rounded p-1 text-sm outline-none text-right" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: A4 Printable Preview */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto bg-gray-100 flex justify-center py-4">
        <div ref={invoiceRef} id="invoice-preview" className="bg-white shadow-lg w-full max-w-[800px] min-h-[1100px] p-12 relative flex flex-col">
          
          {/* Header */}
          <div className="flex justify-between items-end border-b-2 border-red-600 pb-6 mb-8">
            <div>
              {/* Added Logo */}
              <img src="/logo.webp" alt="RED NEWS BHARAT" className="h-16 mb-3 object-contain" />
              <p className="text-xs text-gray-500 font-medium">Digital Media & News Network</p>
              <div className="text-xs text-gray-500 mt-2 leading-relaxed">
                <p>Priyadarshini Parisar Railway Undar Brige Supela Undar Brige Bhilai, Durg, Chhattisgarh 430029</p>
                <p>Email:rednews1985.cg@gmail.com </p>
                <p>Web: www.rednewsbharat.live</p>
                <p>Phone: +91 92013 96145</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-black text-gray-200 tracking-widest uppercase mb-4">INVOICE</h2>
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
                  <p className="font-bold text-lg">{invoice.client.companyName}</p>
                  <p className="font-medium text-gray-600">Attn: {invoice.client.name}</p>
                </>
              ) : (
                <p className="font-bold text-lg">{invoice.client.name || 'Client Name'}</p>
              )}
              {invoice.client.address && <p className="whitespace-pre-wrap mt-1">{invoice.client.address}</p>}
              {invoice.client.phone && <p className="mt-1">Ph: {invoice.client.phone}</p>}
              {invoice.client.email && <p>Email: {invoice.client.email}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1 mb-8">
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
          <div className="flex justify-between items-start mb-8">
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
                  <div className="flex justify-between mb-2 text-green-600 border-b pb-3">
                    <span>Discount</span>
                    <span>-₹{invoice.discount.toLocaleString()}</span>
                  </div>
                )}
                {/* GST is hidden when 0 */}
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between mb-3 text-gray-600 border-b pb-3">
                    <span>GST ({invoice.taxRate}%)</span>
                    <span>₹{invoice.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-gray-200">
                  <span className="text-base font-bold text-gray-800">Grand Total</span>
                  <span className="text-xl font-black text-red-600">₹{invoice.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-auto text-right w-full flex justify-end">
            <div className="text-center">
              <div className="w-48 border-b border-gray-400 mb-2"></div>
              <p className="text-xs font-bold text-gray-800">Authorized Signatory</p>
              <p className="text-[10px] text-gray-500">For RED NEWS BHARAT</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          /* 1. Hide absolutely everything */
          body > * {
            display: none !important;
          }

          /* 2. Show only the Next.js root */
          body > #__next {
            display: block !important;
          }

          /* 3. Hide sidebar and header inside __next */
          body > #__next aside,
          body > #__next header,
          body > #__next nav,
          #billing-controls {
            display: none !important;
          }

          /* 4. Make all wrapper containers non-constraining */
          body, html, #__next, #__next > div, #__next > div > div {
            display: block !important;
            height: auto !important;
            min-height: unset !important;
            overflow: visible !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          /* 5. Show billing root without constraints */
          #billing-root {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }

          /* 6. Show the invoice preview full width */
          #invoice-preview {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20mm !important;
            min-height: unset !important;
          }

          #invoice-preview * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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
