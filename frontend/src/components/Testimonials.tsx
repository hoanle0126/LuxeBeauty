import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thị Mai",
    role: "Khách hàng thân thiết",
    content: "Sản phẩm tuyệt vời! Da tôi đã cải thiện rõ rệt sau 2 tuần sử dụng serum vitamin C. Sẽ tiếp tục ủng hộ!",
    rating: 5,
  },
  {
    id: 2,
    name: "Trần Hương Giang",
    role: "Beauty Blogger",
    content: "Đây là thương hiệu mỹ phẩm tôi tin tưởng nhất. Thành phần tự nhiên, an toàn và hiệu quả thấy rõ.",
    rating: 5,
  },
  {
    id: 3,
    name: "Lê Minh Anh",
    role: "Makeup Artist",
    content: "Son lì Velvet Rose là must-have của tôi. Màu đẹp, bền màu cả ngày và không gây khô môi.",
    rating: 5,
  },
];

const Testimonials = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium mb-4">
            {t("testimonials.title")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
            {t("testimonials.subtitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
