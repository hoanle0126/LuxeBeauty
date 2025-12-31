import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Send,
  Archive,
  Loader2,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchContactMessage,
  updateContactMessageStatus,
  replyToContactMessage,
  ContactMessage,
} from "@/lib/api";

const AdminSupportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [status, setStatus] = useState<ContactMessage["status"]>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Load message data
  useEffect(() => {
    const loadMessage = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await fetchContactMessage(Number(id));
        setMessage(data);
        setStatus(data.status);
      } catch (error: any) {
        console.error("Error loading message:", error);
        toast({
          title: t("supportDetail.notFound") || "Không tìm thấy",
          description: t("supportDetail.notFoundDesc") || "Không tìm thấy tin nhắn này",
          variant: "destructive",
        });
        navigate("/admin/support");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessage();
  }, [id, navigate, toast, t]);

  // Handle send reply
  const handleSendReply = async () => {
    if (!replyContent.trim() || !message) return;

    setIsSending(true);
    try {
      const updatedMessage = await replyToContactMessage(message.id, replyContent);
      setMessage(updatedMessage);
      setStatus(updatedMessage.status);
      setReplyContent("");

      toast({
        title: t("supportDetail.replySent") || "Đã gửi phản hồi",
        description: t("supportDetail.replySentDesc") || "Phản hồi đã được gửi thành công",
      });
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: error?.response?.data?.message || t("supportDetail.replyFailed") || "Không thể gửi phản hồi",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle update status
  const handleUpdateStatus = async (newStatus: ContactMessage["status"]) => {
    if (!message) return;

    try {
      const updatedMessage = await updateContactMessageStatus(message.id, newStatus);
      setMessage(updatedMessage);
      setStatus(updatedMessage.status);

      toast({
        title: t("supportDetail.statusUpdated") || "Đã cập nhật trạng thái",
        description: t("supportDetail.statusUpdatedDesc", {
          status: newStatus === "pending" ? t("support.statusPending") : t("support.statusReplied")
        }) || `Trạng thái đã được cập nhật thành ${newStatus === "pending" ? "Chờ xử lý" : "Đã trả lời"}`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: error?.response?.data?.message || t("supportDetail.statusUpdateFailed") || "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: ContactMessage["status"]) => {
    if (status === "pending") {
      return (
        <Badge variant="destructive">{t("support.statusPending")}</Badge>
      );
    }
    return (
      <Badge className="bg-green-600 hover:bg-green-700 text-white">
        {t("support.statusReplied")}
      </Badge>
    );
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("supportDetail.loading")}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdmin || !message) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/support")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                {t("supportDetail.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("supportDetail.description")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={status}
              onValueChange={(value: ContactMessage["status"]) =>
                handleUpdateStatus(value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("support.statusPending")}</SelectItem>
                <SelectItem value="replied">{t("support.statusReplied")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("supportDetail.senderInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{message.name}</p>
                    <p className="text-sm text-muted-foreground">{t("supportDetail.customer")}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{t("supportDetail.email")}</p>
                      <p className="font-medium break-all">{message.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{t("supportDetail.phone")}</p>
                      <p className="font-medium">{message.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{t("supportDetail.dateSent")}</p>
                      <p className="font-medium">{formatDate(message.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{t("common.status")}</p>
                      <div className="mt-1">{getStatusBadge(status)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message & Replies */}
          <div className="lg:col-span-2 space-y-6">
            {/* Original Message */}
            <Card>
              <CardHeader>
                <CardTitle>{message.subject}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  <Separator />
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-foreground">
                      {message.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reply */}
            {message.reply && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("supportDetail.reply") || "Phản hồi"}</h3>
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user?.fullName || user?.name || "Admin"}</p>
                            <p className="text-xs text-muted-foreground">
                              {t("supportDetail.admin") || "Quản trị viên"}
                            </p>
                          </div>
                        </div>
                        {message.repliedAt && (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(message.repliedAt)}
                          </span>
                        )}
                      </div>
                      <Separator />
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-foreground">
                          {message.reply}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reply Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t("supportDetail.sendReply")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={t("supportDetail.replyPlaceholder")}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[150px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setReplyContent("")}
                    disabled={!replyContent.trim() || isSending}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleSendReply}
                    disabled={!replyContent.trim() || isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("supportDetail.sending")}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t("supportDetail.sendReplyButton")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupportDetail;

