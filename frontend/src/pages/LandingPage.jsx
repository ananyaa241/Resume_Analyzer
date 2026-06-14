import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch, Zap, Shield, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="relative overflow-hidden">
            {/* Hero Section */}
            <section className="pt-20 pb-32 px-4 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-400 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100 mb-6 inline-block">
                            Powered by Groq
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                            Master the <span className="text-blue-600">ATS</span> & Land Your <br className="hidden md:block" /> Dream Job
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                            The ultimate AI-powered resume analyzer that provides instant feedback, keyword optimization, and professional improvements to get you more interviews.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="btn-primary py-4 px-8 text-lg flex items-center gap-2 group">
                                Get Started for Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/login" className="btn-secondary py-4 px-8 text-lg">
                                View Demo
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Choose ResumeAI?</h2>
                        <p className="text-slate-500">Everything you need to beat the Applicant Tracking Systems.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-blue-600" />}
                            title="Instant Analysis"
                            description="Upload your resume and get a detailed ATS score in seconds with AI-driven insights."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
                            title="Keyword Matching"
                            description="Identify missing keywords and skills from the job description to boost your match rate."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-emerald-600" />}
                            title="Grammar Check"
                            description="Comprehensive scans for spelling, grammar, and formatting errors that hurt your application."
                        />
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                    </div>

                    <div className="space-y-12">
                        <StepItem num="01" title="Upload Your Resume" description="Drop your PDF or Word document into our secure analyzer." />
                        <StepItem num="02" title="Add Job Description" description="Paste the JD for the role you're targeting." />
                        <StepItem num="03" title="Get Your Report" description="Receive a deep-dive analysis and AI-optimized bullet points." />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-6">Ready to optimize your career?</h2>
                            <p className="text-blue-100 mb-10 text-lg">Join over 5,000+ applicants who improved their hireability.</p>
                            <Link to="/register" className="bg-white text-blue-600 py-4 px-10 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors">
                                Create Free Account
                            </Link>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <FileSearch className="w-48 h-48" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow group">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
);

const StepItem = ({ num, title, description }) => (
    <div className="flex gap-8 items-start">
        <span className="text-4xl font-black text-blue-600/20">{num}</span>
        <div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-slate-600 text-lg">{description}</p>
        </div>
    </div>
);

export default LandingPage;
