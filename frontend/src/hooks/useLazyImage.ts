import { useState, useEffect, useRef } from "react";

/**
 * Custom hook để lazy load images
 * Sử dụng Intersection Observer API để tải hình ảnh khi chúng sắp xuất hiện trong viewport
 */
export const useLazyImage = (src: string | undefined, options?: IntersectionObserverInit) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Nếu không có src, không cần lazy load
    if (!src) {
      setIsLoaded(true);
      return;
    }

    // Nếu đã load rồi, không cần làm gì
    if (isLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Tải hình ảnh
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
            };
            img.onerror = () => {
              setIsLoaded(true); // Vẫn set loaded để không retry
            };
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Bắt đầu load khi còn cách 50px
        ...options,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, isLoaded, options]);

  return { imgRef, imageSrc, isLoaded, isInView };
};

