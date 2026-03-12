import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { EDU_VERIFY_ABI, CONTRACT_ADDRESS } from '../lib/contracts';

interface StudentRecord {
    address: string;
    did: string;
    isActive: boolean;
    registeredAt: string;
    txHash: string;
}

export const StudentsPage = () => {
    const [students, setStudents] = useState<StudentRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all');

    const fetchAllStudents = async () => {
        setLoading(true);
        setError('');
        try {
            let provider: ethers.Provider;
            if (window.ethereum) {
                provider = new ethers.BrowserProvider(window.ethereum);
            } else {
                provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, EDU_VERIFY_ABI, provider);

            // Query all Registered events from block 0
            const filter = contract.filters.Registered();
            const events = await contract.queryFilter(filter, 0, 'latest');

            const studentList: StudentRecord[] = [];

            for (const event of events) {
                const log = event as ethers.EventLog;
                const studentAddr = log.args[0] as string;
                const did = log.args[1] as string;

                // Get block timestamp
                const block = await provider.getBlock(log.blockNumber);
                const timestamp = block
                    ? new Date(Number(block.timestamp) * 1000).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })
                    : 'Unknown';

                // Get current active status
                let isActive = false;
                try {
                    const data = await contract.getStudent(studentAddr);
                    isActive = data[2] as boolean;
                } catch {
                    isActive = false;
                }

                studentList.push({
                    address: studentAddr,
                    did,
                    isActive,
                    registeredAt: timestamp,
                    txHash: log.transactionHash,
                });
            }

            // Latest first
            setStudents(studentList.reverse());
        } catch (err: any) {
            console.error(err);
            setError('Failed to fetch students. Check your network connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllStudents();
    }, []);

    const filtered = students.filter((s) => {
        const matchSearch =
            s.did.toLowerCase().includes(search.toLowerCase()) ||
            s.address.toLowerCase().includes(search.toLowerCase());
        const matchFilter =
            filter === 'all' ||
            (filter === 'active' && s.isActive) ||
            (filter === 'revoked' && !s.isActive);
        return matchSearch && matchFilter;
    });

    const activeCount = students.filter((s) => s.isActive).length;
    const revokedCount = students.filter((s) => !s.isActive).length;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="glass-morphism p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h2 className="text-3xl font-bold gradient-text">Student Registry</h2>
                        <p className="text-white/40 text-sm mt-1">All credentials issued on Sepolia blockchain</p>
                    </div>
                    <button
                        onClick={fetchAllStudents}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div
                        onClick={() => setFilter('all')}
                        className={`cursor-pointer p-4 rounded-2xl border text-center transition-all ${filter === 'all' ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                        <p className="text-3xl font-black">{students.length}</p>
                        <p className="text-sm text-white/40 mt-1">Total Students</p>
                    </div>
                    <div
                        onClick={() => setFilter('active')}
                        className={`cursor-pointer p-4 rounded-2xl border text-center transition-all ${filter === 'active' ? 'bg-green-500/20 border-green-500/30' : 'bg-green-500/5 border-green-500/10 hover:bg-green-500/10'}`}
                    >
                        <p className="text-3xl font-black text-green-400">{activeCount}</p>
                        <p className="text-sm text-white/40 mt-1">Active</p>
                    </div>
                    <div
                        onClick={() => setFilter('revoked')}
                        className={`cursor-pointer p-4 rounded-2xl border text-center transition-all ${filter === 'revoked' ? 'bg-red-500/20 border-red-500/30' : 'bg-red-500/5 border-red-500/10 hover:bg-red-500/10'}`}
                    >
                        <p className="text-3xl font-black text-red-400">{revokedCount}</p>
                        <p className="text-sm text-white/40 mt-1">Revoked</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by DID or wallet address..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* Loading Skeleton */}
            {loading && students.length === 0 && (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-morphism p-5 rounded-2xl animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-white/10 rounded w-1/3" />
                                    <div className="h-3 bg-white/5 rounded w-1/2" />
                                </div>
                                <div className="w-20 h-6 bg-white/10 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
                <div className="text-center py-20 glass-morphism rounded-3xl">
                    <div className="text-5xl mb-4">🎓</div>
                    <h3 className="text-xl font-bold mb-2">
                        {students.length === 0 ? 'No Students Registered Yet' : 'No Matches Found'}
                    </h3>
                    <p className="text-white/40 text-sm">
                        {students.length === 0
                            ? 'Go to Admin tab and issue a credential to get started.'
                            : 'Try a different search term or filter.'}
                    </p>
                </div>
            )}

            {/* Student List */}
            {!loading && filtered.length > 0 && (
                <div className="space-y-3">
                    {filtered.map((student, idx) => (
                        <div
                            key={student.address}
                            className="glass-morphism p-5 rounded-2xl hover:bg-white/5 transition-all group"
                        >
                            <div className="flex items-center gap-4 flex-wrap">
                                {/* Index Badge */}
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60 flex-shrink-0">
                                    {idx + 1}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-white text-lg">{student.did}</span>
                                        <span
                                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${student.isActive
                                                    ? 'bg-green-500/15 text-green-400 border-green-500/25'
                                                    : 'bg-red-500/15 text-red-400 border-red-500/25'
                                                }`}
                                        >
                                            {student.isActive ? '✓ Active' : '✗ Revoked'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                                        <span className="font-mono">
                                            {student.address.substring(0, 10)}...{student.address.substring(34)}
                                        </span>
                                        <span>🕐 {student.registeredAt}</span>
                                    </div>
                                </div>

                                {/* Etherscan Link */}
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${student.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
                                    title="View on Etherscan"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Etherscan
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
