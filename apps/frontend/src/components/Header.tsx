"use client";
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export default function Header() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="h-[60px] glass-header text-foreground flex items-center justify-between px-6 z-50 sticky top-0">
            <div className="flex items-center gap-8">
                <Link href="/trade" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-bold text-lg shadow-[0_0_10px_rgba(252,213,53,0.5)] group-hover:shadow-[0_0_20px_rgba(252,213,53,0.8)] transition-all">
                        Q
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-white bg-clip-text text-transparent group-hover:to-primary transition-all">
                        QUANTYX
                    </span>
                </Link>

                <nav className="hidden md:flex gap-1 text-sm font-medium">
                    <Link href="/trade" className="px-3 py-2 text-foreground rounded hover:bg-white/5 hover:text-primary transition-colors">Trade</Link>
                    <Link href="/markets" className="px-3 py-2 text-muted hover:text-foreground hover:bg-white/5 rounded transition-colors">Markets</Link>
                    <Link href="/derivatives" className="px-3 py-2 text-muted hover:text-foreground hover:bg-white/5 rounded transition-colors">Derivatives</Link>
                    <Link href="/earn" className="px-3 py-2 text-muted hover:text-foreground hover:bg-white/5 rounded transition-colors">Earn</Link>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                {/* Tickers (Mock) */}
                <div className="hidden lg:flex gap-4 text-xs font-mono mr-4 text-muted border-r border-border pr-4">
                    <div className="flex gap-2">
                        <span>BTC</span>
                        <span className="text-buy">$67,231.00</span>
                    </div>
                    <div className="flex gap-2">
                        <span>ETH</span>
                        <span className="text-sell">$3,102.45</span>
                    </div>
                    <div className="flex gap-2">
                        <span>BNB</span>
                        <span className="text-buy">$598.20</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_infinite]"></div>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Testnet Active</span>
                </div>

                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full hover:bg-white/10 text-muted hover:text-primary transition-colors"
                >
                    {theme === 'dark' ? '🌞' : '🌙'}
                </button>

                <div className="h-6 w-px bg-border mx-2"></div>

                {user ? (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                            <span className="text-xs font-bold text-foreground">{user.email.split('@')[0]}</span>
                            <span className="text-[10px] text-muted font-mono">UID: {user.id.substring(0, 6)}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-white/5 hover:bg-red-500/20 text-muted hover:text-red-500 px-3 py-1.5 rounded text-xs font-bold transition-all border border-transparent hover:border-red-500/30"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Link href="/login" className="px-4 py-1.5 rounded text-sm font-bold text-foreground hover:bg-white/10 transition-colors">
                            Log In
                        </Link>
                        <Link href="/register" className="bg-primary hover:bg-primary/90 text-black px-4 py-1.5 rounded text-sm font-bold shadow-[0_0_15px_rgba(252,213,53,0.3)] hover:shadow-[0_0_20px_rgba(252,213,53,0.5)] transition-all">
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}
