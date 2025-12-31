import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/contexts/SettingsContext";
import heroImage from "@/assets/hero-cosmetics.jpg";

const Hero = () => {
  const { t } = useTranslation();
  const { homepage } = useSettings();
  
  // Sử dụng settings nếu có, fallback về translation
  const newCollection = homepage?.heroNewCollection || t("hero.newCollection");
  const title = homepage?.heroTitle || t("hero.title");
  const titleHighlight = homepage?.heroTitleHighlight || t("hero.titleHighlight");
  const subtitle = homepage?.heroSubtitle || t("hero.subtitle");
  const backgroundImage = homepage?.heroBackgroundImage || heroImage;
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Luxury cosmetics collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <span className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium mb-6 animate-fade-in">
            {newCollection}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight font-serif">
            {title}
            <span className="text-primary block">{titleHighlight}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/products">{t("hero.discoverNow")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
