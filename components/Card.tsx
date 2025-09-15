
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = true }) => {
  const paddingClass = padding ? 'p-4' : '';
  return (
    <div
      className={`bg-white/60 backdrop-blur-md rounded-xl shadow-md border border-white/80 ${paddingClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
