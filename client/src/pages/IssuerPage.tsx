import { useState } from 'react';
import { ethers } from 'ethers';
import { EDU_VERIFY_ABI, CONTRACT_ADDRESS } from '../lib/contracts';
import { generateCommitment } from '../utils/zkp';

export const IssuerPage = () => {
    const [studentAddress, setStudentAddress] = useState('');
    const [did, setDid] = useState('');
    const [secret, setSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [isDuplicate, setIsDuplicate] = useState(false);

    const checkDuplicate = async (addr: string) => {
        if (!ethers.isAddress(addr)) return;
        try {
            const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, EDU_VERIFY_ABI, provider);
            await contract.getStudent(addr);
            // If getStudent doesn't revert, the student exists
            setIsDuplicate(true);
            setStatus('Invalid: this wallet address is already registered.');
        } catch (err) {
            // Revert means the student DOES NOT exist (good for registration)
            setIsDuplicate(false);
            setStatus('');
        }
    };

    const handleAddressChange = async (val: string) => {
        setStudentAddress(val);
        if (ethers.isAddress(val)) {
            await checkDuplicate(val);
        } else {
            setIsDuplicate(false);
            setStatus('');
        }
    };

    const issueCredential = async () => {
        if (!studentAddress || !did || !secret) return alert('Fill all fields');
        if (isDuplicate) return alert('Invalid: this wallet address is already registered.');

        setLoading(true);
        setStatus('Preparing transaction...');
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, EDU_VERIFY_ABI, signer);

            const commitment = generateCommitment(did, secret);

            setStatus('Sending to Sepolia...');
            const tx = await contract.registerDID(studentAddress, did, commitment);

            setStatus('Waiting for confirmation...');
            await tx.wait();

            setStatus('Success! Credential Issued.');
            setStudentAddress('');
            setDid('');
            setSecret('');
            setIsDuplicate(false);
        } catch (err: any) {
            console.error(err);
            setStatus(`Error: ${err.reason || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const revokeCredential = async () => {
        if (!studentAddress) return alert('Need student address to revoke');
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, EDU_VERIFY_ABI, signer);

            const tx = await contract.revokeCredential(studentAddress);
            await tx.wait();
            setStatus('Revoked successfully');
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="glass-morphism p-8 rounded-3xl">
                <h2 className="text-3xl font-bold mb-6 gradient-text">Issuer Dashboard</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Student Wallet Address</label>
                        <input
                            value={studentAddress}
                            onChange={(e) => handleAddressChange(e.target.value)}
                            className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDuplicate ? 'border-red-500 ring-red-500/20' : 'border-white/10'}`}
                            placeholder="0x..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Digital ID (DID)</label>
                        <input
                            value={did}
                            onChange={(e) => setDid(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="EDU2024001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Secret (for ZKP Commitment)</label>
                        <input
                            type="password"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Keep this secret"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={issueCredential}
                            disabled={loading || isDuplicate}
                            className={`flex-1 secondary-gradient hover:opacity-90 py-3 rounded-xl font-bold transition-all disabled:opacity-50 ${isDuplicate ? 'grayscale' : ''}`}
                        >
                            {isDuplicate ? 'Already Registered' : 'Issue Credential'}
                        </button>
                        <button
                            onClick={revokeCredential}
                            disabled={loading}
                            className="px-6 border border-red-500/50 text-red-400 hover:bg-red-500/10 py-3 rounded-xl font-bold transition-all"
                        >
                            Revoke
                        </button>
                    </div>
                    {status && (
                        <p className={`mt-4 text-center text-sm font-semibold animate-pulse ${isDuplicate ? 'text-red-400' : 'text-blue-400'}`}>
                            {status}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
