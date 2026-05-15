/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0F172A",     // Slate 900
                secondary: "#3B82F6",   // Blue 500
                accent: "#10B981",      // Emerald 500
                background: "#F8FAFC",  // Slate 50
                surface: "#FFFFFF",
                border: "#E2E8F0",      // Slate 200
                text: {
                    primary: "#1E293B", // Slate 800
                    secondary: "#64748B", // Slate 500
                }
            },
            fontFamily: {
                'sans': ['"Inter"', '"Outfit"', 'sans-serif'],
                'display': ['"Outfit"', 'sans-serif'],
            },
            borderRadius: {
                'none': '0',
                'sm': '0.125rem',
                'DEFAULT': '0.375rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
                'full': '9999px',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
