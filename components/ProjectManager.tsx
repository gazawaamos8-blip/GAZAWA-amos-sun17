import React, { useState, useEffect } from 'react';
import { FileText, Plus, User, Calendar, DollarSign, Download } from 'lucide-react';
import { getInvoices, saveInvoice } from '../services/storageService';
import { Invoice } from '../types';

const ProjectManager: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [clientName, setClientName] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [items, setItems] = useState<{description: string, quantity: number, price: number}[]>([]);

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  const addItem = () => {
      if(itemDesc && itemPrice) {
          setItems([...items, { description: itemDesc, quantity: 1, price: parseFloat(itemPrice) }]);
          setItemDesc('');
          setItemPrice('');
      }
  };

  const createInvoice = () => {
      if(!clientName || items.length === 0) return;
      const total = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      const newInv: Invoice = {
          id: Date.now().toString(),
          clientName,
          items,
          total,
          status: 'UNPAID',
          date: new Date().toISOString()
      };
      saveInvoice(newInv);
      setInvoices(getInvoices());
      setIsEditing(false);
      // Reset form
      setClientName('');
      setItems([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
          <div>
              <h2 className="text-3xl font-bold text-white">Project & Invoices</h2>
              <p className="text-slate-400">Manage client billing and project documents.</p>
          </div>
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium flex items-center gap-2">
              <Plus size={18} /> New Invoice
          </button>
      </div>

      {isEditing ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-6">Create Invoice</h3>
              <div className="space-y-4">
                  <div>
                      <label className="text-sm text-slate-400">Client Name</label>
                      <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white mt-1"/>
                  </div>
                  
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-sm font-bold text-slate-300">Add Item</h4>
                      <div className="flex gap-2">
                          <input type="text" placeholder="Description" value={itemDesc} onChange={e => setItemDesc(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm"/>
                          <input type="number" placeholder="Price" value={itemPrice} onChange={e => setItemPrice(e.target.value)} className="w-24 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm"/>
                          <button onClick={addItem} className="px-3 bg-indigo-600 rounded-lg text-white">+</button>
                      </div>
                      <div className="space-y-1">
                          {items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-sm text-slate-400 border-b border-slate-800 pb-1">
                                  <span>{it.description}</span>
                                  <span>{it.price}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                      <button onClick={createInvoice} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl">Generate Invoice</button>
                      <button onClick={() => setIsEditing(false)} className="px-6 py-3 bg-slate-800 text-white rounded-xl">Cancel</button>
                  </div>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invoices.map(inv => (
                  <div key={inv.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2 text-white font-medium">
                              <User size={18} className="text-indigo-400"/> {inv.clientName}
                          </div>
                          <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20">{inv.status}</span>
                      </div>
                      <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Calendar size={14}/> {new Date(inv.date).toLocaleDateString()}
                          </div>
                           <div className="flex items-center gap-2 text-lg font-bold text-white">
                              <DollarSign size={18} className="text-emerald-400"/> {inv.total.toLocaleString()}
                          </div>
                      </div>
                      <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
                          <Download size={16}/> Download PDF
                      </button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default ProjectManager;
