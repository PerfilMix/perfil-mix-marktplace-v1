
import { useState, useEffect } from 'react';
import { useBanners } from '@/hooks/useBanners';
import { ExternalLink } from 'lucide-react';

const DashboardBanner = () => {
  const { getActiveBannersByType } = useBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const dashboardBanners = getActiveBannersByType('dashboard');

  // Auto-rotate banners every 5 seconds if multiple banners
  useEffect(() => {
    if (dashboardBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dashboardBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [dashboardBanners.length]);

  if (dashboardBanners.length === 0) {
    return null;
  }

  const currentBanner = dashboardBanners[currentIndex];

  const handleBannerClick = () => {
    if (currentBanner.linkUrl) {
      window.open(currentBanner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 ${
          currentBanner.linkUrl ? 'cursor-pointer group' : ''
        }`}
        onClick={handleBannerClick}
        style={{ aspectRatio: '9/16' }}
      >
        <img
          src={currentBanner.imageData}
          alt="Dashboard Banner"
          className={`w-full h-full object-cover transition-all duration-300 ${
            currentBanner.linkUrl ? 'group-hover:scale-105 group-hover:brightness-110' : ''
          }`}
        />
        
        {/* Link indicator */}
        {currentBanner.linkUrl && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
              <ExternalLink className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {/* Carousel indicators */}
        {dashboardBanners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {dashboardBanners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardBanner;
