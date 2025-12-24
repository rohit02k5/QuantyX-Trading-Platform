import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                input: "var(--input)",
                primary: "var(--primary)",
                buy: "var(--buy)",
                sell: "var(--sell)",
            },
        },
    },
    // Enable dark mode class/attribute
    darkMode: ['class', '[data-theme="dark"]'],
    plugins: [],
};
export default config;
