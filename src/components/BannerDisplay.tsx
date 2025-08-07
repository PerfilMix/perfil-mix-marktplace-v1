
import { useBanners } from '@/hooks/useBanners';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BannerDisplay = memo(() => {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { getActiveBannersByType } = useBanners();

  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get banners based on device type
  const deviceType = isMobile ? 'mobile' : 'desktop';
  const activeBanners = getActiveBannersByType(deviceType);

  // Removed debug logging for performance

  // Reset index when banners change or device type changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeBanners.length, deviceType]);

  // Auto-advance banners every 5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + activeBanners.length) % activeBanners.length;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % activeBanners.length;
    setCurrentIndex(newIndex);
  };

  // Show loading state until mounted
  if (!mounted) {
    return (
      <div className="bg-tech-card/95 backdrop-blur-sm rounded-xl border border-tech-accent/20 shadow-lg shadow-tech-highlight/5 mb-8 overflow-hidden">
        <div 
          className="w-full bg-gray-800 animate-pulse" 
          style={{ height: isMobile ? '150px' : '200px' }} 
        />
      </div>
    );
  }

  // Don't render anything if no banners for current device type
  if (activeBanners.length === 0) {
    return null;
  }

  const currentBanner = activeBanners[currentIndex];

  return (
    <div className="bg-tech-card/95 backdrop-blur-sm rounded-xl border border-tech-accent/20 shadow-lg shadow-tech-highlight/5 mb-8 overflow-hidden">
      <div className="relative group">
        {currentBanner.linkUrl ? (
          <a 
            href={currentBanner.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block"
          >
            <img 
              src={currentBanner.imageData} 
              alt="Banner" 
              className="w-full object-cover transition-all duration-700 ease-in-out" 
              style={{ height: isMobile ? '150px' : '200px' }} 
            />
          </a>
        ) : (
          <img 
            src={currentBanner.imageData} 
            alt="Banner" 
            className="w-full object-cover transition-all duration-700 ease-in-out" 
            style={{ height: isMobile ? '150px' : '200px' }} 
          />
        )}

        {/* Navigation arrows - only show if more than 1 banner */}
        {activeBanners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Dots indicator - only show if more than 1 banner */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white scale-110 shadow-lg' 
                    : 'bg-white/60 hover:bg-white/80 hover:scale-105'
                }`}
                aria-label={`Ir para banner ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Banner counter - top right */}
        {activeBanners.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1}/{activeBanners.length}
          </div>
        )}

      </div>
    </div>
  );
});

BannerDisplay.displayName = "BannerDisplay";

export default BannerDisplay;
