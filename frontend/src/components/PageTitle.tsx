import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";

interface PageTitleProps {
  titleKey: string;
  params?: Record<string, string | number>;
}

/**
 * Component để thay đổi title của trang
 * @param titleKey - Key trong pageTitles translation
 * @param params - Các tham số để thay thế trong title (ví dụ: {{name}}, {{id}})
 */
const PageTitle = ({ titleKey, params }: PageTitleProps) => {
  const { t } = useTranslation();
  const { general, appearance, loading } = useSettings();

  // Lấy title từ translation
  let title = t(`pageTitles.${titleKey}`, params || {});

  // Nếu không tìm thấy translation, fallback về key
  if (title === `pageTitles.${titleKey}`) {
    title = titleKey;
  }

  // Site name để append vào title
  // Nếu settings đang load hoặc chưa có, dùng fallback
  const siteName = (!loading && general?.siteName) ? general.siteName : "Bella Beauty";
  
  // Format: "Page Title - Site Name" (luôn luôn có siteName)
  // Luôn dùng title từ translation, không dùng metaTitle cho page title
  const displayTitle = `${title} - ${siteName}`;

  return (
    <Helmet>
      <title>{displayTitle}</title>
      {appearance?.favicon && (
        <link rel="icon" type="image/x-icon" href={appearance.favicon} />
      )}
      {appearance?.metaDescription && (
        <meta name="description" content={appearance.metaDescription} />
      )}
      {appearance?.metaKeywords && (
        <meta name="keywords" content={appearance.metaKeywords} />
      )}
      {/* Đảm bảo không có title nào khác được append */}
      <meta name="title" content={displayTitle} />
    </Helmet>
  );
};

export default PageTitle;

