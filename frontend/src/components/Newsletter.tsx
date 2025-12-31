import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { subscribeNewsletter } from "@/lib/api";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeNewsletter(email);
      toast({
        title: i18n.language === "vi" ? "Đăng ký thành công!" : "Subscribed successfully!",
        description: i18n.language === "vi" ? "Cảm ơn bạn đã đăng ký nhận tin từ Bella Beauty." : "Thank you for subscribing to Bella Beauty.",
      });
      setEmail("");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
        (i18n.language === "vi" ? "Có lỗi xảy ra khi đăng ký" : "Error subscribing");
      toast({
        title: i18n.language === "vi" ? "Lỗi" : "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-serif">
            {t("newsletter.title")}
          </h2>
          <p className="text-white/80 mb-8">
            {t("newsletter.subtitle")}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder={t("newsletter.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-primary-foreground text-foreground border-0"
              required
            />
            <Button type="submit" variant="secondary" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (t("common.loading") || "Đang xử lý...") : t("newsletter.subscribe")}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
