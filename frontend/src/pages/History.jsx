import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, Calendar, ChevronRight, Trash2, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/resume/history');
                setScans(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this scan?')) {
            try {
                await api.delete(`/resume/${id}`);
                setScans(scans.filter(s => s._id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filteredScans = scans.filter(s =>
        s.resumeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-2">Scan History</h1>
                    <p className="text-slate-500">Track your progress and access old reports.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search reports..."
                            className="input-field pl-10 w-[200px] md:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : filteredScans.length > 0 ? (
                <div className="grid gap-4">
                    {filteredScans.map((scan, idx) => (
                        <motion.div
                            key={scan._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-200 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                    ${scan.atsScore >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    <span className="font-bold text-lg">{scan.atsScore}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                                        {scan.resumeName}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(scan.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5" />
                                            {scan.jobMatchScore}% Match
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    to={`/report/${scan._id}`}
                                    className="btn-secondary py-2 px-4 flex items-center gap-2 group-hover:border-blue-200"
                                >
                                    View Report <ChevronRight className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(scan._id)}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 glass-card">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No reports found</h3>
                    <p className="text-slate-500 mb-8">Start your first analysis to see it here.</p>
                    <Link to="/dashboard" className="btn-primary">New Analysis</Link>
                </div>
            )}
        </div>
    );
};

export default History;
