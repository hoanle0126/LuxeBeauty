import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Xử lý gửi form liên hệ
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const faqItems = [
    {
      question: "Làm thế nào để đặt hàng?",
      answer: "Bạn có thể đặt hàng trực tuyến bằng cách thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Hoặc gọi điện đến hotline 1900 1234 để được hỗ trợ đặt hàng.",
    },
    {
      question: "Thời gian giao hàng là bao lâu?",
      answer: "Thời gian giao hàng từ 2-5 ngày làm việc đối với khu vực nội thành Hà Nội và TP.HCM. Các tỉnh thành khác từ 3-7 ngày làm việc. Thời gian có thể thay đổi tùy vào địa chỉ giao hàng và tình hình thực tế.",
    },
    {
      question: "Chính sách đổi trả như thế nào?",
      answer: "Chúng tôi chấp nhận đổi trả trong vòng 30 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ bao bì, phụ kiện đi kèm.",
    },
    {
      question: "Có hỗ trợ thanh toán trả góp không?",
      answer: "Có, chúng tôi hỗ trợ thanh toán trả góp qua thẻ tín dụng của các ngân hàng đối tác. Vui lòng liên hệ hotline để biết thêm chi tiết.",
    },
    {
      question: "Làm thế nào để kiểm tra tình trạng đơn hàng?",
      answer: "Bạn có thể đăng nhập vào tài khoản để theo dõi đơn hàng hoặc liên hệ hotline 1900 1234 với mã đơn hàng để được hỗ trợ.",
    },
    {
      question: "Sản phẩm có chính hãng không?",
      answer: "Tất cả sản phẩm tại LuxeBeauty đều là hàng chính hãng, có đầy đủ giấy tờ chứng nhận xuất xứ và được nhập khẩu trực tiếp từ các thương hiệu uy tín.",
    },
  ];

  const contactMethods = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Hotline hỗ trợ",
      details: "1900 1234",
      description: "Thứ 2 - Chủ nhật: 8:00 - 22:00",
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: "support@luxebeauty.vn",
      description: "Phản hồi trong vòng 24 giờ",
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Văn phòng",
      details: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      description: "Thứ 2 - Thứ 6: 8:00 - 17:00",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Chat trực tuyến",
      details: "Live Chat",
      description: "Có sẵn 24/7 trên website",
    },
  ];

  const supportTopics = [
    {
      title: "Đặt hàng & Thanh toán",
      description: "Hướng dẫn đặt hàng, phương thức thanh toán",
      icon: <ShoppingBag className="h-8 w-8" />,
      link: "#",
    },
    {
      title: "Vận chuyển & Giao hàng",
      description: "Thời gian giao hàng, phí vận chuyển",
      icon: <Truck className="h-8 w-8" />,
      link: "#",
    },
    {
      title: "Đổi trả & Hoàn tiền",
      description: "Chính sách đổi trả, điều kiện hoàn tiền",
      icon: <RefreshCw className="h-8 w-8" />,
      link: "#",
    },
    {
      title: "Sản phẩm & Thành phần",
      description: "Thông tin sản phẩm, thành phần, hướng dẫn sử dụng",
      icon: <Package className="h-8 w-8" />,
      link: "#",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Hỗ trợ khách hàng | LuxeBeauty</title>
        <meta name="description" content="Trung tâm hỗ trợ khách hàng LuxeBeauty - FAQ, liên hệ và giải đáp thắc mắc" />
      </Helmet>

      <Header />
      
      <main className="min-h-screen bg-background pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Tìm câu trả lời trong FAQ hoặc liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi
              </p>
              <div className="relative max-w-xl mx-auto">
                <Input
                  type="search"
                  placeholder="Tìm kiếm câu hỏi thường gặp..."
                  className="pl-12 pr-4 py-6 text-base"
                />
                <HelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Support Topics Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Chủ đề hỗ trợ phổ biến</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportTopics.map((topic, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        {topic.icon}
                      </div>
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                    </div>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-between group">
                      Xem chi tiết
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10">Câu hỏi thường gặp (FAQ)</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-background border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Liên hệ với chúng tôi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {contactMethods.map((method, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        {method.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg mb-2">{method.title}</CardTitle>
                    <CardDescription className="text-sm mb-1">{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-semibold text-primary">{method.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Gửi yêu cầu hỗ trợ</CardTitle>
                  <CardDescription>
                    Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Nguyễn Văn A"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="example@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="0987 654 321"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Chủ đề *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Vấn đề cần hỗ trợ"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Nội dung *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full md:w-auto">
                      Gửi yêu cầu hỗ trợ
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Clock className="h-6 w-6" />
                    Thời gian làm việc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Hotline hỗ trợ</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Thứ 2 - Thứ 6</span>
                          <span className="font-medium">8:00 - 22:00</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Thứ 7 - Chủ nhật</span>
                          <span className="font-medium">8:00 - 20:00</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Văn phòng</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Thứ 2 - Thứ 6</span>
                          <span className="font-medium">8:00 - 17:00</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Thứ 7</span>
                          <span className="font-medium">8:00 - 12:00</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Chủ nhật</span>
                          <span className="font-medium">Nghỉ</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

// Import thêm các icon cần thiết
import { ShoppingBag, Truck, RefreshCw, Package } from "lucide-react";

export default SupportPage;