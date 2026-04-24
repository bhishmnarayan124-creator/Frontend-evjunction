/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                'clash': ['Clash Display', 'sans-serif'],
                'cabinet': ['Cabinet Grotesk', 'sans-serif'],
            },
            colors: {
                // EVJunctions custom colors
                'ev-bg': '#05090f',
                'ev-bg2': '#0b1423',
                'ev-bg3': '#0e1c30',
                'ev-card': '#0d1928',
                'ev-card-hover': '#132235',
                'ev-accent': '#00e5a0',
                'ev-accent-dim': 'rgba(0, 229, 160, 0.1)',
                'ev-blue': '#2196f3',
                'ev-purple': '#8b5cf6',
                'ev-orange': '#ff6b35',
                'ev-danger': '#ef4444',
                'ev-text': '#e2edf8',
                'ev-text2': '#94a3b8',
                'ev-text3': '#64748b',
                'ev-border': 'rgba(255, 255, 255, 0.08)',
                // Shadcn compatible
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                'ev-glow': '0 0 20px rgba(0, 229, 160, 0.5)',
                'ev-glow-sm': '0 0 10px rgba(0, 229, 160, 0.3)',
                'ev-card': '0 8px 32px rgba(0, 0, 0, 0.2)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(0, 229, 160, 0.3)' },
                    '50%': { boxShadow: '0 0 20px rgba(0, 229, 160, 0.6)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'pulse-glow': 'pulse-glow 2s infinite'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
