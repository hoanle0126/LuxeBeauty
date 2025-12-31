import { Leaf, Award, Truck, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const Benefits = () => {
  const { t } = useTranslation();
  
  const benefits = [
    {
      icon: Leaf,
      title: t("benefits.natural.title"),
      description: t("benefits.natural.desc"),
    },
    {
      icon: Award,
      title: t("benefits.quality.title"),
      description: t("benefits.quality.desc"),
    },
    {
      icon: Truck,
      title: t("benefits.shipping.title"),
      description: t("benefits.shipping.desc"),
    },
    {
      icon: Shield,
      title: t("benefits.support.title"),
      description: t("benefits.support.desc"),
    },
  ];
  
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-card hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                <benefit.icon className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
