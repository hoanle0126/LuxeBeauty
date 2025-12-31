import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Mail,
  Phone,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchContactMessages,
  ContactMessage,
} from "@/lib/api";

type SortField = "id" | "name" | "created_at";
type SortDirection = "asc" | "desc";

const AdminSupport = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "replied">("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<{
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  } | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, replied: 0 });

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Fetch messages from backend
  useEffect(() => {
    const loadMessages = async () => {
      if (!isAuthenticated || !isAdmin) return;

      setIsLoading(true);
      try {
        const response = await fetchContactMessages({
          per_page: itemsPerPage,
          search: searchQuery || undefined,
          status: statusFilter,
          sort_field: sortField,
          sort_order: sortDirection,
        });

        setMessages(response.data);
        setPagination(response.meta);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: t("common.error") || "Lỗi",
          description: t("support.loadFailed") || "Không thể tải danh sách tin nhắn",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [isAuthenticated, isAdmin, searchQuery, statusFilter, sortField, sortDirection, currentPage, itemsPerPage, toast, t]);

  // Fetch stats separately (all messages without filter)
  useEffect(() => {
    const loadStats = async () => {
      if (!isAuthenticated || !isAdmin) return;

      try {
        // Fetch pending messages
        const pendingResponse = await fetchContactMessages({
          per_page: 1,
          status: "pending",
        });

        // Fetch replied messages
        const repliedResponse = await fetchContactMessages({
          per_page: 1,
          status: "replied",
        });

        // Fetch all messages for total
        const allResponse = await fetchContactMessages({
          per_page: 1,
          status: "all",
        });

        setStats({
          total: allResponse.meta.total,
          pending: pendingResponse.meta.total,
          replied: repliedResponse.meta.total,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    loadStats();
  }, [isAuthenticated, isAdmin]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
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

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return t("support.minutesAgo", { count: diffInMinutes }) || `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return t("support.hoursAgo", { count: diffInHours }) || `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return t("support.daysAgo", { count: diffInDays }) || `${diffInDays} ngày trước`;
    } else {
      return formatDate(dateString);
    }
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
            <p className="text-muted-foreground">{t("common.loading") || "Đang tải..."}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">
            {t("support.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("support.description")}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("support.totalMessages")}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("support.totalMessagesDesc")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("support.pending")}</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("support.needsAction")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("support.replied")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.replied}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("support.processed")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("support.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 overflow-x-auto" style={{ flexWrap: 'nowrap' }}>
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[120px]"
                >
                  {t("common.all")}
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("pending");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[140px]"
                >
                  {t("support.statusPending")}
                </Button>
                <Button
                  variant={statusFilter === "replied" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("replied");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[140px]"
                >
                  {t("support.statusReplied")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("id")}
                      >
                        {t("support.code")}
                        {renderSortIcon("id")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("name")}
                      >
                        {t("support.sender")}
                        {renderSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("support.contact")}</TableHead>
                    <TableHead>{t("support.subject")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleSort("created_at")}
                      >
                        {t("support.time")}
                        {renderSortIcon("created_at")}
                      </Button>
                    </TableHead>
                    <TableHead >{t("common.status")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <MessageSquare className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {t("support.noMessages") || "Không có tin nhắn nào"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">
                          #{message.id}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{message.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {message.email}
                              </span>
                            </div>
                            {message.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {message.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate font-medium">
                            {message.subject}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {message.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{getTimeAgo(message.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell><div className="w-[100px]">{getStatusBadge(message.status)}</div></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/support/${message.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("common.view")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t("common.showing") || "Hiển thị"}
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    {t("common.of") || "của"} {pagination.total}
                  </span>
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {[...Array(pagination.last_page)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => setCurrentPage(index + 1)}
                          isActive={currentPage === index + 1}
                          className="cursor-pointer"
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))
                        }
                        className={
                          currentPage === pagination.last_page
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSupport;

