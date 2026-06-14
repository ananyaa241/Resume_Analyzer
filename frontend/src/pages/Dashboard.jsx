import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, ChevronRight, Loader2, AlertCircle, CheckCircle2, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const stages = [
        'Uploading Resume',
        'Extracting Content',
        'Comparing with Job Description',
        'Running ATS Checks',
        'Generating Recommendations'
    ];

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            if (selected.size > 5242880) {
                setError('File size too large (max 5MB)');
                return;
            }
            setFile(selected);
            setError('');
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!file || !jobDescription) {
            setError('Please provide both a resume and a job description.');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);

        try {
            // Simulate progression through stages for better UX
            let stageIdx = 0;
            const stageInterval = setInterval(() => {
                if (stageIdx < stages.length) {
                    setStage(stages[stageIdx]);
                    stageIdx++;
                }
            }, 2000);

            const res = await api.post('/resume/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearInterval(stageInterval);
            console.log("Analysis successful:", res.data._id);
            navigate(`/report/${res.data._id}`);
        } catch (err) {
            console.error("Analysis Error Details:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Something went wrong during analysis.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-3">Resume Analyzer</h1>
                <p className="text-slate-500">Scan your resume against a specific job description to find gaps and optimize your match score.</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Step 1 & 2 Form */}
                <div className="space-y-8">
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div>
                            <h2 className="text-xl font-bold">Upload Resume</h2>
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                                ${file ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}
                            onClick={() => document.getElementById('resume-upload').click()}
                        >
                            <input
                                type="file"
                                id="resume-upload"
                                hidden
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                            />
                            {file ? (
                                <div className="space-y-2">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                                    <p className="font-medium text-slate-900">{file.name}</p>
                                    <p className="text-sm text-slate-500 text-center">Click to change file</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                                    <p className="font-medium text-slate-600">Drag & Drop or Click to Upload</p>
                                    <p className="text-sm text-slate-400">PDF, DOCX (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-card p-6 text-center">
                        <div className="flex items-center gap-3 mb-4 text-left">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div>
                            <h2 className="text-xl font-bold">Start Scanning</h2>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !file || !jobDescription}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3
                                ${loading || !file || !jobDescription ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Analyze Resume'}
                            {!loading && <ChevronRight className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Step 2 JD */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
                            <h2 className="text-xl font-bold">Job Description</h2>
                        </div>
                        <button
                            onClick={() => setJobDescription('Sample: Software Engineer with experience in React, Node.js, and Cloud architectures.')}
                            className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                        >
                            Use Sample
                        </button>
                    </div>

                    <textarea
                        className="flex-grow input-field resize-none p-4 font-mono text-sm"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    ></textarea>

                    <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                        <span>Characters: {jobDescription.length}</span>
                        <span>Min recommended: 200</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600"
                    >
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-medium text-sm">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
                            <h3 className="text-2xl font-bold mb-2">{stage}...</h3>
                            <p className="text-slate-500">Our AI is analyzing every detail to provide you the best feedback.</p>

                            <div className="mt-8 space-y-3">
                                {stages.map((s) => (
                                    <div key={s} className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${stages.indexOf(s) <= stages.indexOf(stage) ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                        <span className={`text-sm ${s === stage ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>{s}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
