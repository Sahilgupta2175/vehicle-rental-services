/** @type {import('tailwindcss').Config} */
export const content = [
    "./index.html",
    "./src/**/*.{js,jsx}"
];
export const theme = {
    extend: {
        colors: {
            primary: {
                DEFAULT: "#7c3aed",
                soft: "#8b5cf6",
                dark: "#6d28d9",
                light: "#a78bfa",
            },
            accent: {
                DEFAULT: "#ec4899",
                dark: "#db2777",
                light: "#f472b6",
            },
            success: "#10b981",
            warning: "#f59e0b",
            background: {
                DEFAULT: "#0a0118",
                card: "#150828",
                light: "#1e0f3a",
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
};
export const plugins = [];
