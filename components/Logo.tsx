import React from 'react';


const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center space-x-3 ${className}`}>
        {/* Sakhi avatar */}
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-amber-200 border-2 border-green-700 shadow">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                <circle cx="19" cy="19" r="19" fill="#fff7e6" />
                <ellipse cx="19" cy="15.5" rx="8.5" ry="9.5" fill="#fbbf24" />
                <ellipse cx="19" cy="22" rx="11" ry="7" fill="#fde68a" />
                <ellipse cx="19" cy="15.5" rx="6.5" ry="7.5" fill="#f59e42" />
                <circle cx="19" cy="17" r="4.2" fill="#fff" />
                <circle cx="19" cy="18.5" r="2.1" fill="#166534" />
                {/* Smile */}
                <path d="M15 22c1.5 2 6.5 2 8 0" stroke="#166534" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                {/* Bindi */}
                <circle cx="19" cy="12.5" r="0.7" fill="#d97706" />
            </svg>
        </span>
        <span className="font-extrabold text-2xl md:text-3xl text-green-900 tracking-tight font-sans">
            Sakhi
            <span className="font-semibold text-amber-600"> Connect</span>
        </span>
    </div>
);

export default Logo;
