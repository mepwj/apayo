interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="32" height="32" rx="6" fill="#DC2626"/>
        
        {/* 병원 십자가 */}
        <rect x="13" y="8" width="6" height="16" rx="1" fill="white"/>
        <rect x="8" y="13" width="16" height="6" rx="1" fill="white"/>
        
        {/* 하트 모양 (건강/치료 상징) */}
        <path 
          d="M16 26C16 26 22 22 22 18C22 16 20.5 14.5 18.5 14.5C17.5 14.5 16.5 15 16 15.5C15.5 15 14.5 14.5 13.5 14.5C11.5 14.5 10 16 10 18C10 22 16 26 16 26Z" 
          fill="#FFB3B3" 
          opacity="0.8"
        />
        
        {/* 의료 펄스 라인 */}
        <path 
          d="M4 4L6 6L8 2L10 8L12 4L14 6" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.7"
        />
      </svg>
    </div>
  );
}