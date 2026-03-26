import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { EDU_VERIFY_ABI, CONTRACT_ADDRESS } from '../lib/contracts';
import { generateCommitment } from '../utils/zkp';
import { Users } from 'lucide-react';

export const IssuerPage = () => {
    const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
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

    const fetchRegisteredStudents = async () => {
        setLoadingStudents(true);
        try {
            const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, EDU_VERIFY_ABI, provider);
            const filter = contract.filters.Registered();
            const events = await contract.queryFilter(filter);
            
            const studentsList = events.map((event: any) => ({
                student: event.args[0],
                did: event.args[1],
                commitment: event.args[2],
                issuer: event.args[3]
            }));
            setRegisteredStudents(studentsList.reverse());
        } catch (err) {
            console.error("Error fetching registered students:", err);
        } finally {
            setLoadingStudents(false);
        }
    };

    useEffect(() => {
        fetchRegisteredStudents();
    }, []);

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

            setStatus('Sending registration email...');
            try {
                await fetch("https://formsubmit.co/ajax/kishorekishore7299@gmail.com", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        subject: "New Student Registered on EduVerify",
                        message: "A new student has been registered successfully on EduVerify.",
                        studentAddress: studentAddress,
                        did: did,
                        issuer: await signer.getAddress()
                    })
                });
            } catch (emailErr) {
                console.error("Failed to send email:", emailErr);
            }

            setStatus('Success! Credential Issued.');
            setStudentAddress('');
            setDid('');
            setSecret('');
            setIsDuplicate(false);
            fetchRegisteredStudents();
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

            <div className="glass-morphism p-8 rounded-3xl mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-8 h-8 text-blue-400" />
                    <h2 className="text-3xl font-bold gradient-text">Registered Students</h2>
                </div>
                
                {loadingStudents ? (
                    <p className="text-white/50 text-center py-4">Loading students...</p>
                ) : registeredStudents.length === 0 ? (
                    <p className="text-white/50 text-center py-4">No students registered yet.</p>
                ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {registeredStudents.map((student, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <span className="font-mono text-sm text-blue-300 break-all pr-4">{student.student}</span>
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold whitespace-nowrap">
                                        {student.did}
                                    </span>
                                </div>
                                <div className="text-xs text-white/40 font-mono">
                                    Issuer: {student.issuer}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
