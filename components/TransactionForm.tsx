
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Transaction, TransactionType } from '../types';

interface Props {
  onAdd: (transaction: Transaction) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<Props> = ({ onAdd, onClose }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount: Number(amount),
      category,
      note,
      date: new Date().toISOString(),
    };

    onAdd(newTransaction);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border-4 border-pink-100 relative">
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-pink-400 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
          Catat Uang {type === 'income' ? 'Masuk' : 'Keluar'} 🌸
        </h2>

        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${type === 'expense' ? 'bg-pink-400 text-white shadow-md' : 'text-gray-500'}`}
          >
            Keluar 💸
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${type === 'income' ? 'bg-green-400 text-white shadow-md' : 'text-gray-500'}`}
          >
            Masuk 💰
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1 ml-2">Jumlah (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-pink-300 outline-none text-xl font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1 ml-2">Kategori</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center ${category === cat.name ? 'border-pink-400 bg-pink-50' : 'border-gray-50 bg-gray-50'}`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-bold text-gray-600">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1 ml-2">Catatan (Opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Beli es krim..."
              className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all bouncy"
          >
            Simpan Transaksi ✨
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
