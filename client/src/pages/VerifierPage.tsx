import { useState } from 'react';
import { ethers } from 'ethers';
import { EDU_VERIFY_ABI, CONTRACT_ADDRESS } from '../lib/contracts';
import { CheckBadgeIcon, XCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export const VerifierPage = () => {
    const [address, setAddress] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const verifyOnChain = async () => {
        if (!ethers.isAddress(address)) return alert('Invalid Ethereum Address');
        setLoading(true);
        setResult(null); // Clear previous results
        try {
            // Priority 1: Use connected wallet provider (faster/more reliable)
            // Priority 2: Use fixed RPC URL
            let provider;
            if (window.ethereum) {
                provider = new ethers.BrowserProvider(window.ethereum);
            } else {
                provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, EDU_VERIFY_ABI, provider);

            // Use getStudent which is a VIEW function (more reliable for checking existance)
            try {
                const studentData = await contract.getStudent(address);
                const [did, commitment, isActive] = studentData;

                setResult({
                    isActive,
                    did: did || 'N/A',
                    commitment,
                    timestamp: new Date().toLocaleString()
                });
            } catch (err: any) {
                // If getStudent reverts, the identity likely doesn't exist
                console.log("Verification failed or identity not found");
                setResult({
                    isActive: false,
                    error: 'Identity not found. Please ensure the student has been registered by an admin first.',
                    timestamp: new Date().toLocaleString()
                });
            }
        } catch (err: any) {
            console.error(err);
            setResult({ error: 'Network connection error. Please check your internet or Sepolia RPC settings.' });
        } finally {
            setLoading(false);
        }
    };

    const revokeCredential = async () => {
        if (!address) return;
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, EDU_VERIFY_ABI, signer);

            const tx = await contract.revokeCredential(address);
            await tx.wait();

            // Re-verify to update UI
            await verifyOnChain();
            alert('Credential revoked successfully!');
        } catch (err: any) {
            console.error(err);
            alert(`Revocation failed: ${err.reason || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="glass-morphism p-8 rounded-3xl">
                <h2 className="text-3xl font-bold mb-6 gradient-text">Public Verification</h2>
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            placeholder="Enter Student Wallet Address (0x...)"
                        />
                        <button
                            onClick={verifyOnChain}
                            disabled={loading}
                            className="absolute right-2 top-2 p-1.5 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                        >
                            <ShieldCheckIcon className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    )}

                    {result && !loading && (
                        <div className={`mt-6 p-6 rounded-2xl border ${result.isActive ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <div className="flex items-center gap-4 mb-4">
                                {result.isActive ? (
                                    <CheckBadgeIcon className="w-12 h-12 text-green-500" />
                                ) : (
                                    <XCircleIcon className="w-12 h-12 text-red-500" />
                                )}
                                <div>
                                    <h3 className="text-xl font-bold">{result.isActive ? 'Verified / Active' : 'Not Verified / Revoked'}</h3>
                                    <p className="text-sm opacity-60">Last Checked: {result.timestamp}</p>
                                </div>
                                {result.isActive && (
                                    <button
                                        onClick={revokeCredential}
                                        disabled={loading}
                                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold transition-all"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                        Revoke
                                    </button>
                                )}
                            </div>

                            {!result.error && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="opacity-60">DID:</span>
                                        <span className="font-mono">{result.did}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="opacity-60">Provider:</span>
                                        <span>Sepolia Testnet</span>
                                    </div>
                                </div>
                            )}
                            {result.error && <p className="text-red-400 font-semibold">{result.error}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
