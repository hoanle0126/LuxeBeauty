import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const toggleVisibility = () => {
      // Hiển thị nút khi scroll xuống hơn 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 h-11 w-11 md:h-12 md:w-12 rounded-full shadow-lg transition-all duration-300",
        "bg-primary text-white hover:bg-primary/90",
        "hover:scale-110 active:scale-95",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
      aria-label={t("common.scrollToTop") || "Lên đầu trang"}
      title={t("common.scrollToTop") || "Lên đầu trang"}
    >
      <ArrowUp className="h-4 w-4 md:h-5 md:w-5" />
    </Button>
  );
};

export default ScrollToTopButton;

