import { useEffect, useState } from "react";

const SunIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="2.5" fill="#888780" />
        {[0, 45, 90, 135].map((deg) => (
            <line
                key={deg}
                x1="6" y1="0.5" x2="6" y2="2"
                stroke="#888780" strokeWidth="1.2" strokeLinecap="round"
                transform={`rotate(${deg} 6 6)`}
            />
        ))}
    </svg>
);

const MoonIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M10.5 7.2A5 5 0 0 1 4.8 1.5a4.5 4.5 0 1 0 5.7 5.7z" fill="#5F5E5A" />
    </svg>
);

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const dark = saved === "dark";
        setIsDark(dark);
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    }, []);

    const toggle = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
        localStorage.setItem("theme", next ? "dark" : "light");
    };

    return (
        <div className="flex items-center gap-2 h-8">
            <div className="flex items-center gap-4">

                {/* Light label */}
                <span
                    className={`text-xs uppercase tracking-widest transition-all duration-200 ${!isDark ? "text-[var(--text)] font-medium" : "text-gray-400 font-normal"
                        }`}
                >
                    Light
                </span>

                {/* Pill toggle */}
                <button
                    onClick={toggle}
                    role="switch"
                    aria-checked={isDark}
                    aria-label="Toggle theme"
                    className={`relative w-16 h-8 rounded-full border border-gray-300 cursor-pointer outline-none 
            transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-blue-400
            ${isDark ? "bg-[var(--card)]" : "bg-[var(--border)]"}`}
                >
                    {/* Knob */}
                    <div
                        className={`absolute top-[3px] left-[3px] w-6 h-6 rounded-full border border-gray-300
              flex items-center justify-center
              transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isDark ? "translate-x-8 bg-[var(--border)]" : "translate-x-0 bg-white"}`}
                    >
                        {isDark ? <MoonIcon /> : <SunIcon />}
                    </div>
                </button>

                {/* Dark label */}
                <span
                    className={`text-xs uppercase tracking-widest transition-all duration-200 ${isDark ? "text-[var(--text)] font-medium" : "text-gray-400 font-normal"
                        }`}
                >
                    Dark
                </span>
            </div>

            {/* Status */}
            <span className="hidden">
                Currently: {isDark ? "dark" : "light"} mode
            </span>
        </div>
    );
};

export default ThemeToggle;