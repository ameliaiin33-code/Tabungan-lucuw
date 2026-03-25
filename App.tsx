
import React, { useState, useEffect } from 'react';
import { Transaction, AppTab, GroundingLink } from './types';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import FlowerDecoration from './components/FlowerDecoration';
import { getFinancialAdvice, searchResources } from './services/geminiService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('tabunganku_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('Tips menabung untuk anak SD');
  const [searchResults, setSearchResults] = useState<{text: string, links: GroundingLink[]}>({ text: '', links: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    localStorage.setItem('tabunganku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    // Removed window.confirm for immediate deletion as requested
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const fetchAdvice = async () => {
    setIsLoadingAdvice(true);
    const advice = await getFinancialAdvice(transactions);
    setAiAdvice(advice);
    setIsLoadingAdvice(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    const results = await searchResources(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const exportTransactionsToCSV = () => {
    const headers = ['ID', 'Tipe', 'Jumlah', 'Kategori', 'Catatan', 'Tanggal'];
    const rows = transactions.map(t => [
      `"${t.id}"`, // Enclose ID in quotes to ensure it's treated as string
      `"${t.type}"`,
      t.amount.toString(),
      `"${t.category}"`,
      `"${t.note.replace(/"/g, '""')}"`, // Handle quotes in notes
      `"${new Date(t.date).toLocaleString()}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transaksi_kebun_tabunganku.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (activeTab === 'ai-tips' && !aiAdvice) {
      fetchAdvice();
    }
    if (activeTab === 'resources' && searchResults.links.length === 0) {
      handleSearch(searchQuery);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen relative pb-24 overflow-x-hidden">
      <FlowerDecoration />
      
      {/* Header */}
      <header className="pt-8 pb-4 px-6 text-center z-10 relative">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold text-purple-600 drop-shadow-sm">
            Kebun Tabunganku 🌻
          </h1>
          <button 
            onClick={copyToClipboard}
            className="p-2 bg-pink-100 rounded-full text-pink-500 hover:bg-pink-200 transition-colors shadow-sm no-print"
            title="Salin Link Aplikasi"
          >
            {copyStatus ? '✅' : '🔗'}
          </button>
        </div>
        <p className="text-pink-400 font-semibold text-sm">Ayo kelola uangmu dengan ceria!</p>
        {copyStatus && <p className="text-[10px] text-green-500 font-bold animate-bounce mt-1">Link berhasil disalin! 🍬</p>}
      </header>

      {/* Main Content */}
      <main className="px-6 max-w-2xl mx-auto z-10 relative">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-pink-300 to-purple-400 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <span className="text-7xl">🐷</span>
              </div>
              <p className="text-pink-50 font-semibold mb-1">Celengan Saya 💰</p>
              <h2 className="text-4xl font-bold mb-4">Rp {totalBalance.toLocaleString()}</h2>
              <div className="flex gap-4">
                <div className="bg-white/20 p-2 rounded-2xl flex-1 backdrop-blur-md text-center">
                  <p className="text-[10px] uppercase font-bold text-pink-50">Masuk</p>
                  <p className="font-bold text-sm">+{transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0).toLocaleString()}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-2xl flex-1 backdrop-blur-md text-center">
                  <p className="text-[10px] uppercase font-bold text-pink-50">Keluar</p>
                  <p className="font-bold text-sm">-{transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 no-print">
              <button 
                onClick={() => setShowForm(true)}
                className="bg-white p-4 rounded-3xl shadow-md border-2 border-pink-100 flex flex-col items-center bouncy"
              >
                <span className="text-3xl mb-1">➕</span>
                <span className="font-bold text-purple-600">Catat Jajan</span>
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className="bg-white p-4 rounded-3xl shadow-md border-2 border-blue-100 flex flex-col items-center bouncy"
              >
                <span className="text-3xl mb-1">📊</span>
                <span className="font-bold text-blue-500">Lihat Laporan</span>
              </button>
            </div>

            {/* Recent History */}
            <section className="no-print">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-gray-600">Catatan Terbaru 📝</h3>
                <button onClick={() => setActiveTab('transactions')} className="text-xs text-pink-500 font-bold hover:underline">Semua &rarr;</button>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${t.type === 'income' ? 'bg-green-100' : 'bg-pink-100'}`}>
                        {t.type === 'income' ? '🎁' : '🍦'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">{t.note || t.category}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{new Date(t.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-pink-500'}`}>
                        {t.type === 'income' ? '+' : '-'}Rp{t.amount.toLocaleString()}
                      </p>
                      <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-red-300 font-bold transition-opacity"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="text-center py-10 opacity-40">
                    <p className="text-4xl mb-2">🎈</p>
                    <p className="font-bold">Kebunmu masih kosong.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4 pb-20 no-print">
            <h3 className="font-bold text-gray-600 px-2 text-xl">Daftar Transaksi 📜</h3>
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${t.type === 'income' ? 'bg-green-100' : 'bg-pink-100'}`}>
                      {t.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-700">{t.note || t.category}</p>
                      <p className="text-xs text-gray-400 font-semibold">{new Date(t.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'income' ? 'text-green-500' : 'text-pink-500'}`}>
                      {t.type === 'income' ? '+' : '-'}Rp{t.amount.toLocaleString()}
                    </p>
                    <button onClick={() => deleteTransaction(t.id)} className="text-[10px] text-red-300 font-bold">Hapus</button>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-10 opacity-40">
                  <p className="text-4xl mb-2">🎈</p>
                  <p className="font-bold">Tidak ada transaksi untuk diunduh.</p>
                </div>
              )}
            </div>
            {transactions.length > 0 && (
              <button
                onClick={exportTransactionsToCSV}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-2xl shadow-lg transition-all bouncy flex items-center justify-center gap-2 mt-6"
                aria-label="Unduh Semua Transaksi (.CSV)"
              >
                Unduh Semua Transaksi (.CSV) 📥
              </button>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <Reports transactions={transactions} totalBalance={totalBalance} />
        )}

        {activeTab === 'ai-tips' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-yellow-100 relative overflow-hidden no-print">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200"></div>
            <div className="flex flex-col items-center text-center">
              <span className="text-7xl mb-6">🧚‍♀️</span>
              <h2 className="text-2xl font-bold text-purple-600 mb-4">Pesan Dari Peri Bunga</h2>
              
              {isLoadingAdvice ? (
                <div className="space-y-4 w-full">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-1/2 mx-auto animate-pulse"></div>
                </div>
              ) : (
                <div className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {aiAdvice || "Wah, kebunmu sangat rapi! Terus pertahankan ya. ✨"}
                </div>
              )}

              <button 
                onClick={fetchAdvice}
                className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg bouncy"
              >
                Minta Tips Baru ✨
              </button>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6 pb-20 no-print">
            <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-blue-100">
              <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Kebun Referensi 🌐</h2>
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => handleSearch('Tips menabung untuk anak')}
                  className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all ${searchQuery.includes('menabung') ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'}`}
                >
                  Tips Menabung 💰
                </button>
                <button 
                  onClick={() => handleSearch('Promo jajan anak terbaru Indonesia')}
                  className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all ${searchQuery.includes('Promo') ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-500'}`}
                >
                  Promo Jajan 🍦
                </button>
                <button 
                  onClick={() => handleSearch('Mainan edukasi murah')}
                  className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all ${searchQuery.includes('Mainan') ? 'bg-green-500 text-white' : 'bg-green-50 text-green-500'}`}
                >
                  Mainan Murah 🧸
                </button>
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center py-10 space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-blue-400 font-bold">Mencari link menarik...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-600 italic text-sm text-center">"{searchResults.text}"</p>
                  <div className="space-y-3">
                    {searchResults.links.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block bg-blue-50 p-4 rounded-2xl border-2 border-transparent hover:border-blue-300 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-blue-700 text-sm line-clamp-1">{link.title}</p>
                            <p className="text-[10px] text-blue-400 mt-1 truncate">{link.uri}</p>
                          </div>
                          <span className="text-2xl group-hover:scale-125 transition-transform">🌸</span>
                        </div>
                      </a>
                    ))}
                    {searchResults.links.length === 0 && !isSearching && (
                      <p className="text-center text-gray-400 text-sm">Klik tombol di atas untuk mencari link! ✨</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl h-20 rounded-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border border-pink-50 flex items-center justify-around px-2 z-50 no-print">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon="🏡" label="Home" 
        />
        <NavButton 
          active={activeTab === 'transactions'} 
          onClick={() => setActiveTab('transactions')} 
          icon="📋" label="List" 
        />
        <div className="relative -top-10">
          <button 
            onClick={() => setShowForm(true)}
            className="w-16 h-16 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-3xl text-white shadow-xl bouncy border-4 border-white"
          >
            ➕
          </button>
        </div>
        <NavButton 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')} 
          icon="📈" label="Report" 
        />
        <NavButton 
          active={activeTab === 'resources'} 
          onClick={() => setActiveTab('resources')} 
          icon="🌐" label="Link" 
        />
      </nav>

      {/* Transaction Modal */}
      {showForm && (
        <TransactionForm 
          onAdd={addTransaction} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center transition-all ${active ? 'scale-110' : 'opacity-50 grayscale'}`}
  >
    <span className="text-2xl">{icon}</span>
    <span className={`text-[10px] font-bold ${active ? 'text-purple-600' : 'text-gray-400'}`}>{label}</span>
    {active && <div className="w-1 h-1 bg-purple-600 rounded-full mt-1"></div>}
  </button>
);

export default App;
