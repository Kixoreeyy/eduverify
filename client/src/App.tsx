import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { IssuerPage } from './pages/IssuerPage';
import { HolderPage } from './pages/HolderPage';
import { VerifierPage } from './pages/VerifierPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/issuer" element={<IssuerPage />} />
            <Route path="/holder" element={<HolderPage />} />
            <Route path="/verifier" element={<VerifierPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
