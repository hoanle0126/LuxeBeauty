import { Heart, Award, Users, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTitle from "@/components/PageTitle";

const About = () => {
  const { t } = useTranslation();
  
  const values = [
    {
      icon: Heart,
      title: t("about.values.dedication.title"),
      description: t("about.values.dedication.desc"),
    },
    {
      icon: Award,
      title: t("about.values.quality.title"),
      description: t("about.values.quality.desc"),
    },
    {
      icon: Sparkles,
      title: t("about.values.innovation.title"),
      description: t("about.values.innovation.desc"),
    },
    {
      icon: Users,
      title: t("about.values.community.title"),
      description: t("about.values.community.desc"),
    },
  ];

  const team = [
    {
      name: "Nguyễn Thị Lan",
      role: "CEO & Founder",
      description: "15 năm kinh nghiệm trong ngành mỹ phẩm, từng làm việc tại các thương hiệu quốc tế.",
    },
    {
      name: "Trần Minh Anh",
      role: "Giám đốc Sản phẩm",
      description: "Chuyên gia về chăm sóc da, có chứng chỉ quốc tế về dược mỹ phẩm.",
    },
    {
      name: "Lê Thị Hương",
      role: "Giám đốc Marketing",
      description: "Chuyên gia digital marketing với hơn 10 năm kinh nghiệm trong lĩnh vực làm đẹp.",
    },
  ];

  const milestones = [
    { year: "2020", title: "Thành lập", description: "Bella Beauty ra đời với sứ mệnh mang vẻ đẹp đến mọi phụ nữ Việt Nam." },
    { year: "2021", title: "1000 khách hàng", description: "Đạt mốc 1000 khách hàng đầu tiên tin tưởng và sử dụng sản phẩm." },
    { year: "2022", title: "Mở rộng", description: "Mở rộng danh mục sản phẩm và phục vụ khách hàng trên toàn quốc." },
    { year: "2024", title: "10,000+ khách hàng", description: "Vượt mốc 10,000 khách hàng thân thiết và nhận được nhiều phản hồi tích cực." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageTitle titleKey="about" />
      <Header />

      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-serif">
                {t("about.title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t("about.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-serif">
                    {t("about.storyTitle")}
                  </h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>{t("about.storyPara1")}</p>
                    <p>{t("about.storyPara2")}</p>
                    <p>{t("about.storyPara3")}</p>
                  </div>
                </div>
                <div className="relative">
                  <Card className="overflow-hidden border-0 shadow-xl">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Target className="w-32 h-32 text-primary/50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
                {t("about.valuesTitle")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("about.valuesDesc")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-8 md:p-12">
                  <div className="text-center mb-8">
                    <Target className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
                      {t("about.missionTitle")}
                    </h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                    <p className="text-center">
                      {t("about.missionDesc")}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <p className="text-foreground">
                          {t("about.missionPoint1")}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <p className="text-foreground">
                          {t("about.missionPoint2")}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <p className="text-foreground">
                          {t("about.missionPoint3")}
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <p className="text-foreground">
                          {t("about.missionPoint4")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
                {t("about.teamTitle")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("about.teamDesc")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Users className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
                {t("about.milestonesTitle")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("about.milestonesDesc")}
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
                {t("about.ctaTitle")}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t("about.ctaDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/products">{t("about.ctaButton1")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/#contact">{t("about.ctaButton2")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;

