import { useState } from 'react';
import { generateProof } from '../utils/zkp';

export const HolderPage = () => {
    const [did, setDid] = useState('');
    const [secret, setSecret] = useState('');
    const [proof, setProof] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateProof = async () => {
        if (!did || !secret) return;
        setLoading(true);
        try {
            const generated = await generateProof(did, secret);
            setProof(generated);
        } catch (err) {
            alert('Proof generation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="glass-morphism p-8 rounded-3xl">
                <h2 className="text-3xl font-bold mb-6 gradient-text">Holder (Student) Wallet</h2>
                <p className="text-white/60 mb-8 italic">Generate a Zero-Knowledge Proof locally to verify your status without revealing your secret.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Your DID</label>
                        <input
                            value={did}
                            onChange={(e) => setDid(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="EDU2024001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Your Secret</label>
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="The secret used during issuance"
                        />
                    </div>
                    <button
                        onClick={handleGenerateProof}
                        disabled={loading}
                        className="w-full primary-gradient hover:opacity-90 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {loading ? 'Computing Proof (ZK)...' : 'Generate ZK Proof'}
                    </button>

                    {proof && (
                        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <h3 className="text-green-400 font-bold mb-2">Proof Generated Successfully!</h3>
                            <div className="text-xs font-mono break-all text-white/40 space-y-1">
                                <p>Status: Computed Locally</p>
                                <p>Commitment: {proof.commitment}</p>
                                <p>Proof Data: {proof.proof.substring(0, 64)}...</p>
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(JSON.stringify(proof))}
                                className="mt-4 text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition-all"
                            >
                                Copy Full Proof Data
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
