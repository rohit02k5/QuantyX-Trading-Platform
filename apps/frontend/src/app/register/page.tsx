"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../lib/api';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        binanceApiKey: '',
        binanceSecretKey: ''
    });
    const [error, setError] = useState('');
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await authApi.post('/register', formData);
            setAuth(res.data.token, res.data.user);
            router.push('/trade');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#161A1E]">
            <div className="w-full max-w-md p-8 bg-[#1E2026] rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h2>
                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#2B3139] text-white p-3 rounded border border-gray-700/50 focus:border-yellow-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-[#2B3139] text-white p-3 rounded border border-gray-700/50 focus:border-yellow-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Binance Testnet API Key</label>
                        <input
                            type="text"
                            value={formData.binanceApiKey}
                            onChange={(e) => setFormData({ ...formData, binanceApiKey: e.target.value })}
                            className="w-full bg-[#2B3139] text-white p-3 rounded border border-gray-700/50 focus:border-yellow-500 focus:outline-none"
                            placeholder="Recommended"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Binance Testnet Secret Key</label>
                        <input
                            type="password"
                            value={formData.binanceSecretKey}
                            onChange={(e) => setFormData({ ...formData, binanceSecretKey: e.target.value })}
                            className="w-full bg-[#2B3139] text-white p-3 rounded border border-gray-700/50 focus:border-yellow-500 focus:outline-none"
                            placeholder="Recommended"
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#FCD535] text-black font-bold p-3 rounded hover:bg-[#F0B90B] transition-colors">
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-500 text-sm">
                    Already have an account? <Link href="/login" className="text-[#FCD535] hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
}
