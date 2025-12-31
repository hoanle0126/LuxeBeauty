import { useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";

/**
 * Component để cập nhật CSS variables khi settings thay đổi
 * Đặc biệt là primaryColor
 */
const SettingsTheme = () => {
  const { appearance } = useSettings();
  
  useEffect(() => {
    if (!appearance?.primaryColor) {
      return;
    }
    
    // Convert hex color to HSL
    const hex = appearance.primaryColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    const hDeg = Math.round(h * 360);
    const sPercent = Math.round(s * 100);
    const lPercent = Math.round(l * 100);

    // Update CSS variables
    document.documentElement.style.setProperty("--primary", `${hDeg} ${sPercent}% ${lPercent}%`);
    
    // Set primary lightness for auto contrast calculation
    document.documentElement.style.setProperty("--primary-l", `${lPercent}`);
    
    // Calculate auto contrast text color for primary background
    // Nếu lightness < 50% (màu tối) -> dùng chữ trắng (100%)
    // Nếu lightness >= 50% (màu sáng) -> dùng chữ đen (0%)
    const autoTextL = lPercent < 50 ? 100 : 0;
    document.documentElement.style.setProperty("--primary-text-auto", `${autoTextL}%`);
    
    // Calculate primary-foreground (lighter version for contrast)
    const foregroundL = lPercent > 50 ? 17 : 97;
    document.documentElement.style.setProperty("--primary-foreground", `${hDeg} ${sPercent}% ${foregroundL}%`);
    
    // Update ring color (same as primary)
    document.documentElement.style.setProperty("--ring", `${hDeg} ${sPercent}% ${lPercent}%`);
    
    // Update sidebar-primary
    document.documentElement.style.setProperty("--sidebar-primary", `${hDeg} ${sPercent}% ${lPercent}%`);
    
    // Update sidebar-primary-foreground
    document.documentElement.style.setProperty("--sidebar-primary-foreground", `${hDeg} ${sPercent}% ${foregroundL}%`);
    
    // Update sidebar-ring
    document.documentElement.style.setProperty("--sidebar-ring", `${hDeg} ${sPercent}% ${lPercent}%`);
  }, [appearance?.primaryColor]);

  return null;
};

export default SettingsTheme;

