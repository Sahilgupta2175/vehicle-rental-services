/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#3b82f6",
                    soft: "#60a5fa",
                    dark: "#2563eb",
                    light: "#93c5fd",
                },
                accent: {
                    DEFAULT: "#f59e0b",
                    dark: "#d97706",
                    light: "#fbbf24",
                },
                success: "#10b981",
                warning: "#ef4444",
                info: "#06b6d4",
                background: {
                    DEFAULT: "#0f172a",
                    card: "#1e293b",
                    light: "#334155",
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
};
