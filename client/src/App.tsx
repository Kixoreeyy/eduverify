import { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { IssuerPage } from './pages/IssuerPage';
import { HolderPage } from './pages/HolderPage';
import { VerifierPage } from './pages/VerifierPage';
import { StudentsPage } from './pages/StudentsPage';
import { AcademicCapIcon, IdentificationIcon, ShieldCheckIcon, ListBulletIcon } from '@heroicons/react/24/outline';

const NoMetaMaskBanner = () => (
  <div className="fixed top-0 left-0 w-full z-[100] bg-orange-500/90 backdrop-blur text-white flex items-center justify-center gap-4 py-3 px-6 text-sm font-semibold shadow-lg">
    <span>⚠️ MetaMask is required to use this app.</span>
    <a
      href="https://metamask.io/download/"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white text-orange-600 px-4 py-1 rounded-full font-bold hover:bg-orange-100 transition-all"
    >
      Install MetaMask →
    </a>
  </div>
);

const App = () => {
  const { account, error, isConnecting, connectWallet, switchNetwork } = useWallet();
  const [activeTab, setActiveTab] = useState('home');
  const hasMetaMask = typeof window !== 'undefined' && !!window.ethereum;

  const renderContent = () => {
    switch (activeTab) {
      case 'issuer': return <IssuerPage />;
      case 'holder': return <HolderPage />;
      case 'verifier': return <VerifierPage />;
      case 'students': return <StudentsPage />;
      default: return (
        <div className="text-center py-20 space-y-6">
          <h1 className="text-6xl font-black gradient-text">EduVerify</h1>
          <p className="text-xl text-white/60 max-w-xl mx-auto">
            Decentralized identity for the next generation of academic validation.
            Secure, Private, and verifiable.
          </p>
          <div className="flex justify-center gap-6 pt-10 flex-wrap">
            <div className="glass-morphism p-6 rounded-2xl w-48 hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('issuer')}>
              <AcademicCapIcon className="w-10 h-10 mb-4 mx-auto text-blue-400" />
              <h3 className="font-bold">Issuer</h3>
              <p className="text-xs text-white/40 mt-1">Issue credentials</p>
            </div>
            <div className="glass-morphism p-6 rounded-2xl w-48 hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('holder')}>
              <IdentificationIcon className="w-10 h-10 mb-4 mx-auto text-purple-400" />
              <h3 className="font-bold">Holder</h3>
              <p className="text-xs text-white/40 mt-1">Your identity</p>
            </div>
            <div className="glass-morphism p-6 rounded-2xl w-48 hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('verifier')}>
              <ShieldCheckIcon className="w-10 h-10 mb-4 mx-auto text-green-400" />
              <h3 className="font-bold">Verifier</h3>
              <p className="text-xs text-white/40 mt-1">Verify a student</p>
            </div>
            <div className="glass-morphism p-6 rounded-2xl w-48 hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('students')}>
              <ListBulletIcon className="w-10 h-10 mb-4 mx-auto text-yellow-400" />
              <h3 className="font-bold">Students</h3>
              <p className="text-xs text-white/40 mt-1">All registered IDs</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen">
      {!hasMetaMask && <NoMetaMaskBanner />}
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-morphism border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <AcademicCapIcon className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-black tracking-tighter">EDU VERIFY</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-4">
              <button onClick={() => setActiveTab('issuer')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'issuer' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>Admin</button>
              <button onClick={() => setActiveTab('holder')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'holder' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>Student</button>
              <button onClick={() => setActiveTab('verifier')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'verifier' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>Verify</button>
              <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'students' ? 'bg-yellow-500/20 text-yellow-300' : 'text-white/40 hover:text-white'}`}>📋 Students</button>
            </div>

            {account ? (
              <div className="flex flex-col items-end">
                <span className="bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold border border-blue-500/30">
                  {account.substring(0, 6)}...{account.substring(38)}
                </span>
                {error && (
                  <button onClick={switchNetwork} className="text-red-400 text-[10px] mt-1 hover:underline font-bold uppercase tracking-widest">
                    Switch to Sepolia
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="primary-gradient px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {error && activeTab !== 'home' && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <XCircleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
            {error.includes('Sepolia') && (
              <button onClick={switchNetwork} className="ml-auto underline font-bold">Switch Now</button>
            )}
            <button onClick={() => window.open('https://sepoliafaucet.com/')} className="ml-4 text-xs bg-white/10 py-1 px-2 rounded">Get Faucet ETH</button>
          </div>
        )}

        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center text-white/20 text-sm">
        <p>&copy; 2026 EduVerify SSI Protocol. Public Demo v1.0.0</p>
      </footer>
    </div>
  );
};

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

export default App;
