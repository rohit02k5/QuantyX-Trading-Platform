"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Key, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        binanceApiKey: '',
        binanceSecretKey: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await authApi.post('/register', formData);
            setAuth(res.data.token, res.data.user);
            toast.success('Account created successfully!');
            router.push('/trade');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0E14] to-black relative overflow-hidden py-10">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg z-10 p-4"
            >
                <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Top Glow Accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-4">
                            <h1 className="text-4xl font-black tracking-tighter text-white">
                                QUANTY<span className="text-primary">X</span>
                            </h1>
                        </Link>
                        <p className="text-gray-400 text-sm">Join the elite trading community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                                    placeholder="trader@quantyx.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 pb-2">
                            <p className="flex items-center gap-2 text-xs text-yellow-500 mb-4 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                                <ShieldCheck className="w-4 h-4" />
                                Optional: Binance Testnet Keys for Real Execution
                            </p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Binance API Key (Optional)</label>
                                    <div className="relative group">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={formData.binanceApiKey}
                                            onChange={(e) => setFormData({ ...formData, binanceApiKey: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                            placeholder="Enter API Key"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Binance Secret Key (Optional)</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            value={formData.binanceSecretKey}
                                            onChange={(e) => setFormData({ ...formData, binanceSecretKey: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                                            placeholder="Enter Secret Key"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary hover:text-yellow-300 font-medium hover:underline transition-colors">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
