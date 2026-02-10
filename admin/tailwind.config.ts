import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: '#FF6B35',
                    dark: '#E55A2B',
                },
                secondary: {
                    DEFAULT: '#1A1A1A',
                    light: '#2A2A2A',
                },
                accent: {
                    DEFAULT: '#6C757D',
                    light: '#ADB5BD',
                }
            },
        },
    },
    plugins: [],
} satisfies Config;
