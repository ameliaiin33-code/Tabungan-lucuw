
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  totalBalance: number; // Pass totalBalance from App.tsx
}

const Reports: React.FC<Props> = ({ transactions, totalBalance }) => {
  const [reportType, setReportType] = useState<'summary' | 'cashFlow' | 'balanceSheet'>('summary');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncomePeriod = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpensePeriod = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const cumulativeIncome = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() < selectedYear || (date.getFullYear() === selectedYear && date.getMonth() + 1 <= selectedMonth);
  }).filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const cumulativeExpense = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() < selectedYear || (date.getFullYear() === selectedYear && date.getMonth() + 1 <= selectedMonth);
  }).filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);


  const expenseData = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#8884d8', '#ffc658'];

  const barData = [
    { name: 'Masuk', value: totalIncomePeriod, fill: '#4ade80' },
    { name: 'Keluar', value: totalExpensePeriod, fill: '#f87171' },
  ];

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrint = () => {
    window.print();
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl shadow-inner border-2 border-dashed border-pink-200 report-card">
        <span className="text-6xl mb-4">📊</span>
        <h3 className="text-xl font-bold text-gray-400">Belum ada laporan untukmu.</h3>
        <p className="text-gray-400">Ayo mulai catat jajananmu!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-pink-100 no-print">
        <h3 className="text-lg font-bold text-purple-600 mb-4 text-center">Pilih Periode Laporan 📅</h3>
        <div className="flex justify-around gap-2 mb-4">
          <select
            className="p-2 rounded-xl border border-gray-200 flex-1 font-bold text-gray-700"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index + 1}>{name}</option>
            ))}
          </select>
          <select
            className="p-2 rounded-xl border border-gray-200 flex-1 font-bold text-gray-700"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl mb-4">
          <button
            onClick={() => setReportType('summary')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${reportType === 'summary' ? 'bg-pink-400 text-white shadow-md' : 'text-gray-500'}`}
          >
            Ringkasan 🍩
          </button>
          <button
            onClick={() => setReportType('cashFlow')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${reportType === 'cashFlow' ? 'bg-green-400 text-white shadow-md' : 'text-gray-500'}`}
          >
            Arus Kas 💸
          </button>
          <button
            onClick={() => setReportType('balanceSheet')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${reportType === 'balanceSheet' ? 'bg-blue-400 text-white shadow-md' : 'text-gray-500'}`}
          >
            Posisi Keuangan 📊
          </button>
        </div>
        <button
          onClick={handlePrint}
          id="print-button"
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-2xl shadow-lg transition-all bouncy flex items-center justify-center gap-2"
          aria-label="Cetak Laporan"
        >
          Cetak Laporan Bulan Ini 🖨️
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          (Setelah klik cetak, pilih "Simpan sebagai PDF" di pengaturan printer browser Anda untuk mengunduh laporan.)
        </p>
      </div>

      {reportType === 'summary' && (
        <>
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-pink-100 report-card">
            <h3 className="text-lg font-bold text-purple-600 mb-4">Kebun Pengeluaranmu ({monthNames[selectedMonth-1]} {selectedYear}) 🍩</h3>
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-gray-400">Tidak ada pengeluaran di bulan ini. ✨</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {expenseData.map((item, i) => (
                <div key={item.name} className="flex items-center text-xs">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-bold text-gray-600">{item.name}: </span>
                  <span className="ml-1 text-gray-500">Rp{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-pink-100 report-card">
            <h3 className="text-lg font-bold text-purple-600 mb-4">Perbandingan Dompet ({monthNames[selectedMonth-1]} {selectedYear}) 👛</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 font-bold text-sm">
              <span className="text-green-500">Masuk: Rp{totalIncomePeriod.toLocaleString()}</span>
              <span className="text-red-400">Keluar: Rp{totalExpensePeriod.toLocaleString()}</span>
            </div>
          </div>
        </>
      )}

      {reportType === 'cashFlow' && (
        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-pink-100 report-card">
          <h2 className="text-xl font-bold text-purple-600 mb-4 text-center">Laporan Arus Kas</h2>
          <p className="text-gray-500 text-sm mb-4 text-center">Bulan: {monthNames[selectedMonth-1]} {selectedYear} 💰</p>
          <table className="report-table">
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th className="text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold text-green-600">Arus Kas Masuk</td>
                <td></td>
              </tr>
              <tr>
                <td>  Pemasukan Operasional</td>
                <td className="text-right">{totalIncomePeriod.toLocaleString()}</td>
              </tr>
              <tr className="font-bold bg-green-50">
                <td>Total Arus Kas Masuk</td>
                <td className="text-right">{totalIncomePeriod.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="font-bold text-red-600 pt-4">Arus Kas Keluar</td>
                <td></td>
              </tr>
              <tr>
                <td>  Pengeluaran Operasional</td>
                <td className="text-right">({totalExpensePeriod.toLocaleString()})</td>
              </tr>
              <tr className="font-bold bg-red-50">
                <td>Total Arus Kas Keluar</td>
                <td className="text-right">({totalExpensePeriod.toLocaleString()})</td>
              </tr>
              <tr className="font-bold text-purple-700 bg-purple-50">
                <td>Arus Kas Bersih Bulan Ini</td>
                <td className="text-right">{(totalIncomePeriod - totalExpensePeriod).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <p className="text-center text-gray-400 mt-6">Tidak ada transaksi di bulan ini. 🎈</p>
          )}
        </div>
      )}

      {reportType === 'balanceSheet' && (
        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-blue-100 report-card">
          <h2 className="text-xl font-bold text-blue-600 mb-4 text-center">Laporan Posisi Keuangan</h2>
          <p className="text-gray-500 text-sm mb-4 text-center">Posisi per akhir {monthNames[selectedMonth-1]} {selectedYear} 📊</p>
          <table className="report-table">
            <thead>
              <tr>
                <th>Deskripsi</th>
                <th className="text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold text-green-600">Aset (Harta)</td>
                <td></td>
              </tr>
              <tr>
                <td>  Uang di Celengan (Saldo Akhir)</td>
                <td className="text-right">{totalBalance.toLocaleString()}</td>
              </tr>
              <tr className="font-bold bg-green-50">
                <td>Total Aset</td>
                <td className="text-right">{totalBalance.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="font-bold text-purple-600 pt-4">Ekuitas (Modal Sendiri)</td>
                <td></td>
              </tr>
              <tr>
                <td>  Total Uang Masuk (kumulatif s.d. bulan ini)</td>
                <td className="text-right">{cumulativeIncome.toLocaleString()}</td>
              </tr>
              <tr>
                <td>  Total Uang Keluar (kumulatif s.d. bulan ini)</td>
                <td className="text-right">({cumulativeExpense.toLocaleString()})</td>
              </tr>
              <tr className="font-bold bg-purple-50">
                <td>Total Ekuitas</td>
                <td className="text-right">{(cumulativeIncome - cumulativeExpense).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-center text-gray-400 text-xs mt-6">
            *Laporan ini adalah penyederhanaan. Aset dan liabilitas lain tidak tercatat.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;
