import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
        <svg width="100%" height="100%" viewBox="0 0 152 40" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient x1="0%" y1="0%" x2="100%" y2="100%" id="logo-gradient">
                    <stop stopColor="#166534" offset="0%"></stop>
                    <stop stopColor="#34d399" offset="100%"></stop>
                </linearGradient>
            </defs>
            <g fill="url(#logo-gradient)">
                <path d="M22.6,3.9c-2.9-2.2-6.5-3.5-10.4-3.9C7.3-0.5,2.7,1.8,0,6.2l7.1,3.4C7.6,8.7,8.8,8,10.2,8c1.8,0,3.1,1,3.1,2.6 c0,1.2-0.7,2.1-2.4,2.8L7.3,14.9c-3.1,1.2-4.8,3.2-4.8,6c0,3.3,2.5,5.6,6.1,5.6c2.4,0,4.4-1,5.6-2.6l-6.5-4 c-0.6,0.6-1.4,1-2.2,1c-1.3,0-2.1-0.8-2.1-1.9c0-1.2,0.8-1.8,2.7-2.6l3.5-1.5c3.3-1.4,5.1-3.3,5.1-6.5C28.5,9.6,26.4,6.7,22.6,3.9z" />
            </g>
            <text x="38" y="28" fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#14532d">
                Sakhi
                <tspan fill="#d97706" fontWeight="normal"> Connect</tspan>
            </text>
        </svg>
    </div>
);

export default Logo;
