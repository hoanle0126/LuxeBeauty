import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "vi" ? "en" : "vi";
    i18n.changeLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="relative"
      title={currentLanguage === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Icon
        icon={currentLanguage === "vi" ? "circle-flags:vn" : "circle-flags:gb"}
        className="h-6 w-6"
      />
    </Button>
  );
};

export default LanguageSwitcher;

