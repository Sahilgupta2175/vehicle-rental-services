/** @type {import('tailwindcss').Config} */
export const content = [
    "./index.html",
    "./src/**/*.{js,jsx}"
];
export const theme = {
    extend: {
        colors: {
            primary: {
                DEFAULT: "#4f46e5",
                soft: "#6366f1",
                dark: "#3730a3",
            },
            accent: "#f97316",
            background: "#0f172a",
            card: "#020617",
        },
    },
};
export const plugins = [];
