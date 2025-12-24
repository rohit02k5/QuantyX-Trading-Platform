import type { Metadata } from 'next';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
    title: 'QuantyX Trading',
    description: 'Real-time testnet trading platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
            <body className="antialiased min-h-screen font-sans bg-background text-foreground selection:bg-primary/20">
                <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
                    <Toaster position="bottom-right" toastOptions={{
                        style: {
                            background: '#1E2026',
                            color: '#EAECEF',
                            border: '1px solid #2B3139',
                            fontFamily: 'var(--font-inter)',
                            fontSize: '14px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#0ECB81',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#F6465D',
                                secondary: '#fff',
                            },
                        }
                    }} />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
