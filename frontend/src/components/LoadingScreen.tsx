import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoadingScreenProps {
  isLoading: boolean;
}

const LoadingScreen = ({ isLoading }: LoadingScreenProps) => {
  const { t } = useTranslation();
  
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("common.loading") || "Đang tải..."}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;

