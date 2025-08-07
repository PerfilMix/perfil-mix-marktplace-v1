import { memo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createIntersectionObserver } from "@/utils/performance";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  lazy?: boolean;
}

export const OptimizedImage = memo(({
  src,
  alt,
  className,
  fallback = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRTVFN0VCIi8+Cjwvc3ZnPgo=",
  lazy = true,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy || shouldLoad) return;

    const observer = createIntersectionObserver(
      (entry) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer?.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (observer && imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [lazy, shouldLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(false);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder/Loading state */}
      {(!isLoaded || error) && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={shouldLoad ? (error ? fallback : src) : fallback}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";