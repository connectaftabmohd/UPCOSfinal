import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  subtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  subtitle = true,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* UP Outsource Seva Nigam 3D Emblem Badge */}
      <div 
        className="relative shrink-0 rounded-full overflow-hidden shadow-sm ring-1 ring-slate-300/80 hover:scale-105 transition-transform duration-300 bg-white"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img
          src="/logo.png"
          alt="UP Outsource Seva Nigam Logo"
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight select-none min-w-0">
          <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg md:text-xl font-['Plus_Jakarta_Sans'] whitespace-nowrap">
                UP Outsource
              </span>
              <span className="font-extrabold text-red-600 tracking-tight text-base sm:text-lg md:text-xl font-['Plus_Jakarta_Sans'] whitespace-nowrap">
                Seva Nigam
              </span>
            </div>
            <span className="inline-flex items-center text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white px-1.5 sm:px-2 py-0.5 rounded font-['Plus_Jakarta_Sans'] shrink-0">
              News &amp; Information
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] sm:text-[11px] md:text-xs text-slate-500 font-medium tracking-wide mt-0.5 truncate max-w-[210px] sm:max-w-none">
              आउटसोर्स कर्मचारियों की हर जरूरी खबर, एक जगह
            </span>
          )}
        </div>
      )}
    </div>
  );
};

