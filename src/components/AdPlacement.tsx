import React, { useEffect } from 'react';

export type AdSlotType = 
  | 'top-leaderboard'
  | 'in-article'
  | 'between-sections'
  | 'sidebar'
  | 'bottom-banner';

interface AdPlacementProps {
  slotType: AdSlotType;
  slotId?: string;
  publisherId?: string;
  className?: string;
}

// Configurable environment values
const metaEnv = (import.meta as any).env || {};
const IS_ADSENSE_ENABLED = metaEnv.VITE_ADSENSE_ENABLED === 'true';
const DEFAULT_PUB_ID = metaEnv.VITE_ADSENSE_PUB_ID || 'ca-pub-1591506487952599';

export const AdPlacement: React.FC<AdPlacementProps> = ({
  slotType,
  slotId,
  publisherId = DEFAULT_PUB_ID,
  className = '',
}) => {
  // Only push to adsbygoogle when real ads are enabled and a valid slotId is provided
  useEffect(() => {
    if (IS_ADSENSE_ENABLED && slotId) {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (e) {
        // Silently caught - AdSense library manages ad requests
      }
    }
  }, [slotId]);

  // If ads are not enabled and no slotId is provided, do not render deceptive placeholders
  if (!IS_ADSENSE_ENABLED || !slotId) {
    // Return null to ensure clean, non-intrusive layout without fake placeholders
    return null;
  }

  const isSidebar = slotType === 'sidebar';
  const minHeightClass = isSidebar 
    ? 'min-h-[250px]' 
    : slotType === 'top-leaderboard' 
    ? 'min-h-[90px]' 
    : 'min-h-[100px]';

  return (
    <aside 
      aria-label="Advertisement" 
      className={`w-full my-4 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-full max-w-4xl flex items-center justify-between text-[10px] tracking-wider uppercase font-medium text-slate-400 mb-1 px-1">
        <span>विज्ञापन • ADVERTISEMENT</span>
      </div>

      <div className={`w-full max-w-4xl rounded-lg border border-slate-200/70 bg-white dark:bg-slate-900/20 p-2 flex items-center justify-center text-center overflow-hidden ${minHeightClass}`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
};
