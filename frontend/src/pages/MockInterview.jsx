import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, User, Bot, ArrowLeft, RefreshCcw,
    MessageSquare, AlertCircle, Sparkles, Loader2
} from 'lucide-react';
import axios from 'axios';

const MockInterview = () => {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [scan, setScan] = useState(null);
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchScan = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/resume/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setScan(data);

                // Initial AI Greeting
                const initialMessage = {
                    role: "assistant",
                    content: `Hello! I'm your AI Interviewer. I've reviewed your resume for the **${data.jobDescription.split('\n')[0].substring(0, 50)}...** position. Are you ready to start the mock interview?`
                };
                setMessages([initialMessage]);
            } catch (err) {
                console.error("Error fetching scan info:", err);
            }
        };
        fetchScan();
    }, [id]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMessage = { role: "user", content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsThinking(true);

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/resume/mock-interview/${id}`,
                { messages: newMessages },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch (err) {
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "I'm sorry, I encountered an error. Let's try again."
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-10">
            <div className="max-w-4xl mx-auto px-4 h-[calc(100vh-140px)] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to={`/report/${id}`} className="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-600" /> AI Mock Interview
                            </h1>
                            <p className="text-xs text-slate-400">Personalized for: {scan?.resumeName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <RefreshCcw className="w-3 h-3" /> Restart
                    </button>
                </div>

                {/* Chat Container */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col relative">

                    {/* Backdrop decoration */}
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                        <Sparkles className="w-64 h-64 text-indigo-600" />
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
                                            }`}>
                                            {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${m.role === 'user'
                                                ? 'bg-slate-800 text-slate-100 rounded-tr-none'
                                                : 'bg-indigo-50 text-slate-800 border border-indigo-100 rounded-tl-none'
                                            }`}>
                                            {m.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isThinking && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-3 items-center text-slate-400 text-xs bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Interviewer is thinking...
                                </div>
                            </motion.div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your response here..."
                                disabled={isThinking}
                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:bg-slate-100"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isThinking}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 text-center flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MockInterview;
