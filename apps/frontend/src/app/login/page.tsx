"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../lib/api';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await authApi.post('/login', { email, password });
            setAuth(res.data.token, res.data.user);
            router.push('/trade');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#161A1E]">
            <div className="w-full max-w-md p-8 bg-[#1E2026] rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Login to Numatix</h2>
                {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#2B3139] text-white p-3 rounded border border-gray-700/50 focus:border-yellow-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#2B3139] text-white p-3 rounded border border-gray-700/50 focus:border-yellow-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#FCD535] text-black font-bold p-3 rounded hover:bg-[#F0B90B] transition-colors">
                        Log In
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-500 text-sm">
                    Don't have an account? <Link href="/register" className="text-[#FCD535] hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}
