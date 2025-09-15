import React from 'react';

const TranslateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m4.25 16h-6.5A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 01-3-3m0 0a3 3 0 00-3 3m3-3V6m0 9v3m-3-3h6m-3-3a3 3 0 013 3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" transform="translate(0 -1) scale(0.7) translate(10 10)" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-4-4m0 0l-4 4m4-4V3" transform="scale(0.7) translate(10 10)"/>
  </svg>
);

export default TranslateIcon;
