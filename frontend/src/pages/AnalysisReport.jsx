import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import CircularScore from '../components/CircularScore';
import {
    CheckCircle2, XCircle, AlertTriangle, ArrowLeft,
    Download, Share2, Award, Target, FileText,
    ChevronDown, ChevronUp, Sparkles, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { HelpCircle, MessageSquare, Brain, Lightbulb } from 'lucide-react';

const AnalysisReport = () => {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showOptimizer, setShowOptimizer] = useState(false);
    const [acceptedSuggestions, setAcceptedSuggestions] = useState([]);
    const [activeSummary, setActiveSummary] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get(`/resume/${id}`);
                setReport(res.data);
                if (res.data.optimizedResume?.summary) {
                    setActiveSummary(res.data.optimizedResume.summary);
                }
            } catch (err) {
                setError('Failed to load report.');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your report...</p>
        </div>
    );

    if (error || !report) return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-slate-500 mb-6">{error || 'Report not found.'}</p>
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
    );

    const radarData = [
        { subject: 'ATS Match', A: report.atsScore, fullMark: 100 },
        { subject: 'Skills', A: report.jobMatchScore, fullMark: 100 },
        { subject: 'Experience', A: report.resumeScore, fullMark: 100 },
        { subject: 'Keywords', A: (report.matchedKeywords.length / (report.matchedKeywords.length + report.missingKeywords.length || 1)) * 100, fullMark: 100 },
        { subject: 'Education', A: report.missingSections.includes('Education') ? 0 : 100, fullMark: 100 },
    ];

    const handleAcceptSuggestion = (index) => {
        setAcceptedSuggestions(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(activeSummary);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const generatePDF = async () => {
        try {
            const doc = new jsPDF();
            const primaryColor = [37, 99, 235]; // Indigo 600
            const secondaryColor = [30, 41, 59]; // Slate 800
            const accentColor = [79, 70, 229]; // Indigo 700
            const lightBg = [248, 250, 252]; // Slate 50
            const successColor = [16, 185, 129]; // Emerald 500

            const title = (report.resumeName || "Resume Report").split('.')[0];

            // Helper to add footer
            const addFooter = (pageNum, totalPages) => {
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.5);
                doc.line(14, 282, 196, 282);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.setFont("helvetica", "normal");
                doc.text("AI Resume Analyzer | Professional Career Insights", 14, 288);
                doc.text(`Page ${pageNum} of ${totalPages}`, 196, 288, { align: 'right' });
            };

            // --- PAGE 1: ANALYSIS OVERVIEW ---

            // Modern 2-Tone Header
            doc.setFillColor(...secondaryColor);
            doc.rect(0, 0, 210, 50, 'F');
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 5, 50, 'F'); // Accent strip

            doc.setFontSize(26);
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.text("ANALYSIS REPORT", 15, 22);

            doc.setFontSize(11);
            doc.setTextColor(203, 213, 225);
            doc.setFont("helvetica", "normal");
            doc.text(title.toUpperCase(), 15, 30);

            // Date badge
            doc.setFillColor(51, 65, 85);
            doc.roundedRect(15, 35, 45, 7, 1, 1, 'F');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text(`DATE: ${new Date().toLocaleDateString()}`, 18, 40);

            // ATS Score Card
            const scoreY = 65;
            doc.setFillColor(...lightBg);
            doc.roundedRect(14, scoreY, 182, 45, 3, 3, 'F');

            // Circular Score
            const centerX = 45;
            const centerY = scoreY + 22.5;

            // Background circle
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(4);
            doc.circle(centerX, centerY, 15, 'S');

            // Progress arc (simplified as a colored circle for stability)
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(4);
            // In a real scenario we'd draw an arc here, but for jspdf stability 
            // and beauty we'll stick to a thick circle with the score inside
            doc.circle(centerX, centerY, 15, 'S');

            doc.setFontSize(22);
            doc.setTextColor(...secondaryColor);
            doc.setFont("helvetica", "bold");
            doc.text(`${report.atsScore}%`, centerX - 9, centerY + 3);

            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text("ATS MATCH SCORE", centerX + 20, scoreY + 15);

            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.setFont("helvetica", "normal");
            const matchText = report.atsScore >= 70 ? "Your resume shows strong alignment with ATS standards." : "Consider optimizing keywords to improve ATS visibility.";
            doc.text(doc.splitTextToSize(matchText, 100), centerX + 20, scoreY + 23);

            // Metrics Grid
            autoTable(doc, {
                startY: scoreY + 55,
                head: [['METRIC', 'SCORE', 'STATUS']],
                body: [
                    ['Resume Strength', `${report.resumeScore}%`, report.resumeScore >= 70 ? 'Optimal' : 'Needs Work'],
                    ['Job Alignment', `${report.jobMatchScore}%`, report.jobMatchScore >= 70 ? 'High' : 'Low'],
                    ['Keyword Density', `${report.matchedKeywords.length} found`, report.missingKeywords.length > 5 ? 'Check Gaps' : 'Good'],
                ],
                theme: 'striped',
                headStyles: { fillColor: secondaryColor, fontSize: 10, cellPadding: 4 },
                styles: { fontSize: 9, cellPadding: 4, font: 'helvetica' },
                columnStyles: {
                    0: { fontStyle: 'bold' },
                    2: { textColor: primaryColor, fontStyle: 'bold' }
                }
            });

            // Gaps & Recommendations
            let currentY = doc.lastAutoTable.finalY + 15;
            doc.setFontSize(14);
            doc.setTextColor(...secondaryColor);
            doc.setFont("helvetica", "bold");
            doc.text("STRATEGIC RECOMMENDATIONS", 14, currentY);

            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(1);
            doc.line(14, currentY + 2, 35, currentY + 2);

            const recs = [
                ['STRENGTHS', (report.highlights || []).slice(0, 3).join('\n\n')],
                ['IMPROVEMENTS', (report.improvements || []).slice(0, 3).join('\n\n')]
            ];

            autoTable(doc, {
                startY: currentY + 8,
                body: recs,
                theme: 'grid',
                styles: { fontSize: 8.5, cellPadding: 6, overflow: 'linebreak' },
                columnStyles: {
                    0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 35, textColor: secondaryColor },
                    1: { cellWidth: 147 }
                },
                margin: { left: 14 }
            });

            // Keyword Cloud Section
            currentY = doc.lastAutoTable.finalY + 12;
            doc.setFillColor(241, 245, 249);
            doc.roundedRect(14, currentY, 182, 30, 2, 2, 'F');

            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.setFont("helvetica", "bold");
            doc.text("CRITICAL MISSING KEYWORDS", 19, currentY + 10);

            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            doc.setFont("helvetica", "italic");
            const kwList = (report.missingKeywords || []).slice(0, 15).join(' • ');
            doc.text(doc.splitTextToSize(kwList, 172), 19, currentY + 18);

            addFooter(1, 2);

            // --- PAGE 2: AI OPTIMIZATIONS ---
            doc.addPage();

            // Header
            doc.setFillColor(...secondaryColor);
            doc.rect(0, 0, 210, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text("AI-DRIVEN CONTENT OPTIMIZATION", 15, 10);

            // Summary Section
            doc.setTextColor(...primaryColor);
            doc.setFontSize(15);
            doc.setFont("helvetica", "bold");
            doc.text("Optimized Professional Summary", 14, 30);

            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(203, 213, 225);
            doc.roundedRect(14, 35, 182, 40, 1, 1, 'F');

            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            doc.setFont("helvetica", "normal");
            const sumText = activeSummary || "Optimized summary not available.";
            doc.text(doc.splitTextToSize(sumText, 172), 19, 45);

            // Experience Section
            currentY = 85;
            doc.setTextColor(...primaryColor);
            doc.setFontSize(15);
            doc.setFont("helvetica", "bold");
            doc.text("Experience Highlighting", 14, currentY);

            const workExp = report.optimizedResume?.workExperience || [];
            const experienceData = workExp.map((exp, i) => [
                { content: `${i + 1}`, styles: { fontStyle: 'bold', halign: 'center' } },
                { content: acceptedSuggestions.includes(i) ? exp.optimized : exp.original }
            ]);

            autoTable(doc, {
                startY: currentY + 8,
                head: [['#', 'REFINED ACHIEVEMENTS & BULLET POINTS']],
                body: experienceData,
                theme: 'striped',
                headStyles: { fillColor: primaryColor, fontSize: 10 },
                styles: { fontSize: 9.5, cellPadding: 6 },
                columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: 170 } },
                margin: { left: 14 }
            });

            addFooter(2, 3);

            // --- PAGE 3: INTERVIEW PREP ---
            if (report.interviewPrep && report.interviewPrep.length > 0) {
                doc.addPage();

                // Header
                doc.setFillColor(...secondaryColor);
                doc.rect(0, 0, 210, 15, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.text("TAILORED INTERVIEW PREPARATION", 15, 10);

                doc.setTextColor(...primaryColor);
                doc.setFontSize(15);
                doc.setFont("helvetica", "bold");
                doc.text("Targeted Interview Questions", 14, 30);

                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.setFont("helvetica", "normal");
                doc.text("Based on your background and the target role, we expect these questions:", 14, 37);

                let currentY = 45;
                report.interviewPrep.forEach((item, i) => {
                    if (currentY > 240) {
                        addFooter(3, 3); // Note: total pages might need dynamic update if it grows
                        doc.addPage();
                        currentY = 30;
                    }

                    doc.setFillColor(248, 250, 252);
                    doc.roundedRect(14, currentY, 182, 45, 2, 2, 'F');

                    doc.setFontSize(8);
                    doc.setTextColor(...primaryColor);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${item.type.toUpperCase()} QUESTION #${i + 1}`, 18, currentY + 8);

                    doc.setFontSize(10);
                    doc.setTextColor(30, 41, 59);
                    doc.text(doc.splitTextToSize(item.question, 172), 18, currentY + 16);

                    doc.setFontSize(8);
                    doc.setTextColor(71, 85, 105);
                    doc.setFont("helvetica", "italic");
                    doc.text("Suggested approach:", 18, currentY + 28);

                    doc.setFontSize(8.5);
                    doc.setTextColor(51, 65, 85);
                    doc.setFont("helvetica", "normal");
                    doc.text(doc.splitTextToSize(item.suggestedAnswer, 172), 18, currentY + 34);

                    currentY += 52;
                });

                addFooter(3, 3);
            }

            doc.save(`${title}_Performance_Report.pdf`);
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert("We encountered an issue generating your beautiful PDF. Error: " + err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{report.resumeName}</h1>
                        <p className="text-slate-500 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Analyzed on {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={generatePDF}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button className="btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2 shadow-lg shadow-blue-200">
                        <Share2 className="w-4 h-4" /> Share Report
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 flex flex-col items-center justify-center text-center col-span-1 md:col-span-1">
                    <CircularScore score={report.atsScore} />
                    <h3 className="mt-4 font-bold text-lg">ATS Match</h3>
                    <p className={`text-sm font-semibold uppercase ${report.atsScore >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {report.atsScore >= 90 ? 'Excellent Match' : report.atsScore >= 70 ? 'Good Match' : 'Weak Match'}
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 col-span-1 md:col-span-3">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" /> Quick Overview
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                        {report.overview}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatItem icon={<Award className="w-5 h-5 text-indigo-500" />} label="Resume Score" value={`${report.resumeScore}%`} />
                        <StatItem icon={<Target className="w-5 h-5 text-emerald-500" />} label="Job Match" value={`${report.jobMatchScore}%`} />
                        <StatItem icon={<FileText className="w-5 h-5 text-blue-500" />} label="Word Count" value={report.extractedText.split(' ').length} />
                    </div>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Visualizations */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm"
                    ref={chartRef}
                >
                    <h3 className="text-xl font-bold mb-6">Competency Radar</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar
                                    name="Resume"
                                    dataKey="A"
                                    stroke="#2563eb"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Keywords */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Keyword Analysis</h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Keywords
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {report.matchedKeywords.map((kw, i) => (
                                    <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" /> Missing Keywords
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {report.missingKeywords.map((kw, i) => (
                                    <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-100">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Key Strengths
                    </h3>
                    <div className="space-y-3">
                        {report.highlights.map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" /> Areas for Improvement
                    </h3>
                    <div className="space-y-3">
                        {report.improvements.map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm border-l-4 border-l-amber-500">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Optimizer Feature */}
            <div className="mt-16 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 grid md:grid-cols-2 items-center gap-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-8 h-8 text-blue-200" />
                            <h2 className="text-3xl font-extrabold tracking-tight italic">AI Resume Optimizer</h2>
                        </div>
                        <p className="text-blue-50 text-lg mb-8 leading-relaxed">
                            Want to boost your ATS score instantly? Our AI can rewrite your work experience and projects to perfectly match the target keywords and power verbs.
                        </p>
                        <button
                            onClick={() => setShowOptimizer(!showOptimizer)}
                            className="bg-white text-blue-600 py-4 px-10 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center gap-3 group"
                        >
                            <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            {showOptimizer ? 'Hide Optimizer' : 'Optimize My Resume'}
                        </button>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            </div>
                            <div className="space-y-3 font-mono text-xs text-blue-100">
                                <div className="p-2 bg-white/5 rounded border border-white/10">
                                    <span className="text-red-300">- Worked on computer vision project</span>
                                </div>
                                <div className="p-2 bg-emerald-500/20 rounded border border-emerald-500/30">
                                    <span className="text-emerald-300">+ Engineered a DINOv2-based semantic segmentation system...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Optimization Preview Section */}
            <AnimatePresence>
                {showOptimizer && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-10 space-y-12 overflow-hidden"
                    >
                        <section>
                            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Wand2 className="w-6 h-6 text-indigo-600" /> AI Suggestions
                            </h3>

                            <div className="space-y-8">
                                {report.optimizedResume.workExperience.map((exp, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="grid md:grid-cols-2 gap-4 relative"
                                    >
                                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300" />
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">Current Version</span>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed italic">"{exp.original}"</p>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                                            <div className="relative bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50 p-6 rounded-2xl shadow-xl">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" /> Recommended
                                                    </span>
                                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                                                        + ATS Boost
                                                    </span>
                                                </div>
                                                <p className="text-slate-900 dark:text-white font-semibold text-sm leading-relaxed">
                                                    "{exp.optimized}"
                                                </p>
                                                <div className="mt-6 flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleAcceptSuggestion(i)}
                                                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        {acceptedSuggestions.includes(i) ? 'Revert' : 'Ignore'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptSuggestion(i)}
                                                        className={`${acceptedSuggestions.includes(i) ? 'bg-emerald-600' : 'bg-blue-600'
                                                            } hover:opacity-90 text-white text-xs font-bold py-2 px-6 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-2`}
                                                    >
                                                        {acceptedSuggestions.includes(i) ? (
                                                            <><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</>
                                                        ) : (
                                                            <><CheckCircle2 className="w-3.5 h-3.5" /> Accept Suggestion</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Connector Icon for desktop */}
                                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 items-center justify-center shadow-lg">
                                            <Wand2 className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-900 text-white p-10 rounded-3xl relative overflow-hidden group shadow-2xl border border-white/5"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="w-24 h-24 text-blue-400 rotate-12" />
                            </div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" /> New Professional Summary
                            </h3>
                            <div className="relative z-10">
                                <textarea
                                    value={activeSummary}
                                    onChange={(e) => setActiveSummary(e.target.value)}
                                    className="w-full bg-transparent text-slate-200 text-lg leading-relaxed italic border-l-4 border-l-yellow-400/50 pl-6 py-2 outline-none focus:border-l-yellow-400 transition-all resize-none h-auto min-h-[100px]"
                                />
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleCopyToClipboard}
                                        className={`${copySuccess ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white'
                                            } hover:bg-white/20 border border-white/20 py-2 px-6 rounded-xl font-bold text-sm transition-all flex items-center gap-2`}
                                    >
                                        {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                                    </button>
                                </div>
                            </div>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Interview Prep - NEW FEATURE */}
            {report.interviewPrep && report.interviewPrep.length > 0 && (
                <div className="mt-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div>
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full uppercase tracking-widest mb-4 inline-block">Next Steps</span>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <Brain className="w-10 h-10 text-indigo-600" /> AI Interview Prep
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Tailored questions and STAR-method answers based on your experience.</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-4">
                            {report.interviewPrep.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`group border-2 rounded-2xl transition-all duration-300 overflow-hidden ${activeQuestion === i
                                        ? 'bg-white dark:bg-slate-800 shadow-2xl shadow-indigo-100 dark:shadow-none border-indigo-500'
                                        : 'bg-indigo-50/10 dark:bg-slate-900/50 border-indigo-100/50 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800/80'
                                        }`}
                                >
                                    <button
                                        onClick={() => setActiveQuestion(activeQuestion === i ? null : i)}
                                        className="w-full p-6 text-left flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 ${activeQuestion === i ? 'bg-indigo-600 text-white scale-110' : 'bg-white dark:bg-slate-800 text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700'
                                                }`}>
                                                {item.type === 'Technical' ? <Brain className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${activeQuestion === i ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                                                    }`}>{item.type} Analysis</span>
                                                <h4 className={`font-bold leading-tight text-lg ${activeQuestion === i || i === 0 ? 'text-slate-800 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                                                    }`}>{item.question}</h4>
                                            </div>
                                        </div>
                                        <div className={`p-2 rounded-full transition-colors ${activeQuestion === i ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                            }`}>
                                            {activeQuestion === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {activeQuestion === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-indigo-50 dark:border-slate-700"
                                            >
                                                <div className="p-8 space-y-6">
                                                    <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-xl">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase">Rationale</span>
                                                        </div>
                                                        <p className="text-sm text-indigo-800 dark:text-indigo-100 leading-relaxed italic">{item.rationale}</p>
                                                    </div>

                                                    <div>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Lightbulb className="w-4 h-4 text-amber-500" />
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Suggested Response (STAR Method)</span>
                                                        </div>
                                                        <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 p-6 rounded-2xl shadow-inner text-sm leading-relaxed font-medium border border-slate-800">
                                                            {item.suggestedAnswer}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        <div className="lg:col-span-4">
                            <div className="sticky top-8 space-y-6">
                                <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-32 h-32" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 relative z-10">Interview Success Tips</h3>
                                    <ul className="space-y-4 relative z-10">
                                        {[
                                            "Research the company's recent engineering blog posts.",
                                            "Prepare at least 3 questions to ask your interviewer.",
                                            "Test your audio/video setup for remote interviews.",
                                            "Practice the STAR method for behavioral questions."
                                        ].map((tip, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-slate-300">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="glass-card p-8 border-dashed border-2 border-indigo-100 dark:border-slate-800 flex flex-col items-center text-center bg-white/50 dark:bg-slate-900/50">
                                    <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                        <Wand2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white mb-2">Want more prep?</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Our AI can conduct a mock interview with you via chat.</p>
                                    <Link
                                        to={`/mock-interview/${id}`}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 transition-all active:scale-95 text-center block"
                                    >
                                        Start Mock Interview
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatItem = ({ icon, label, value }) => (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
            {icon}
            <span className="text-xs font-semibold uppercase">{label}</span>
        </div>
        <div className="text-xl font-bold">{value}</div>
    </div>
);

export default AnalysisReport;
