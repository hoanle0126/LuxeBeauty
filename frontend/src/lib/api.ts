import { axiosClient } from "@/axios/axiosClient";

// Product interface
export interface Product {
  id: number;
  name: string;
  slug: string;
  category?: string;
  categoryId?: number | null;
  categorySlug?: string;
  brand?: string;
  brandId?: number | null;
  brandSlug?: string;
  price: number;
  originalPrice?: number | null;
  image?: string;
  images?: string[];
  description?: string;
  ingredients?: string;
  stock: number;
  status: "available" | "low_stock" | "out_of_stock" | "discontinued";
  createdAt?: string;
  updatedAt?: string;
}

// Category interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  status: "active" | "inactive";
  description?: string;
  thumbnail?: string;
}

// Brand interface
export interface Brand {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  status: "active" | "inactive";
  description?: string;
  thumbnail?: string;
}

// Promotion interface
export interface Promotion {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "expired";
  isUsable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Review interface
export interface Review {
  id: number;
  user: string;
  userId: number;
  avatar?: string;
  rating: number;
  comment: string;
  reply?: string;
  replyDate?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

// Pagination metadata interface
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

// API Response interface
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  success?: boolean;
  message?: string;
}

// Fetch featured products (limit 4)
export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<Product[]>>(
      `/products?per_page=4&sort_field=createdAt&sort_order=desc`
    );
    const dataArray = response.data?.data || [];
    
    return dataArray.map((prod: any) => ({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      category: prod.category,
      categoryId: prod.categoryId,
      categorySlug: prod.categorySlug,
      brand: prod.brand,
      brandId: prod.brandId,
      brandSlug: prod.brandSlug,
      price: prod.price,
      originalPrice: prod.originalPrice,
      image: prod.image || (prod.images && prod.images[0]) || "",
      images: prod.images || (prod.image ? [prod.image] : []),
      description: prod.description,
      ingredients: prod.ingredients,
      stock: prod.stock || 0,
      status: prod.status || "available",
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
};

// Fetch all categories (for backward compatibility)
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<Category[]>>(
      `/categories?per_page=100&status=active`
    );
    const dataArray = response.data?.data || [];
    
    return dataArray.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.productCount || 0,
      status: cat.status || "active",
      description: cat.description,
      thumbnail: cat.thumbnail,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

// Fetch categories with pagination and search
export interface FetchCategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface FetchCategoriesResponse {
  categories: Category[];
  pagination: PaginationMeta;
}

export const fetchCategoriesPaginated = async (params?: FetchCategoriesParams): Promise<FetchCategoriesResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    else queryParams.append("status", "active");

    const response = await axiosClient.get<ApiResponse<Category[]>>(
      `/categories?${queryParams.toString()}`
    );
    
    const dataArray = response.data?.data || [];
    const categories = dataArray.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat.productCount || 0,
      status: cat.status || "active",
      description: cat.description,
      thumbnail: cat.thumbnail,
    }));

    const pagination: PaginationMeta = response.data?.meta || {
      current_page: 1,
      per_page: params?.per_page || 20,
      total: categories.length,
      last_page: 1,
      from: 1,
      to: categories.length,
    };

    return { categories, pagination };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { 
      categories: [], 
      pagination: {
        current_page: 1,
        per_page: params?.per_page || 20,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      }
    };
  }
};

// Fetch all brands (for backward compatibility)
export const fetchBrands = async (): Promise<Brand[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<Brand[]>>(
      `/brands?per_page=100&status=active`
    );
    const dataArray = response.data?.data || [];
    
    return dataArray.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      productCount: brand.productCount || 0,
      status: brand.status || "active",
      description: brand.description,
      thumbnail: brand.thumbnail,
    }));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
};

// Fetch brands with pagination and search
export interface FetchBrandsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: "active" | "inactive";
}

export interface FetchBrandsResponse {
  brands: Brand[];
  pagination: PaginationMeta;
}

export const fetchBrandsPaginated = async (params?: FetchBrandsParams): Promise<FetchBrandsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    else queryParams.append("status", "active");

    const response = await axiosClient.get<ApiResponse<Brand[]>>(
      `/brands?${queryParams.toString()}`
    );
    
    const dataArray = response.data?.data || [];
    const brands = dataArray.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      productCount: brand.productCount || 0,
      status: brand.status || "active",
      description: brand.description,
      thumbnail: brand.thumbnail,
    }));

    const pagination: PaginationMeta = response.data?.meta || {
      current_page: 1,
      per_page: params?.per_page || 20,
      total: brands.length,
      last_page: 1,
      from: 1,
      to: brands.length,
    };

    return { brands, pagination };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { 
      brands: [], 
      pagination: {
        current_page: 1,
        per_page: params?.per_page || 20,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      }
    };
  }
};

// Fetch featured brands (limit 6)
export const fetchFeaturedBrands = async (): Promise<Brand[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<Brand[]>>(
      `/brands?per_page=6&status=active`
    );
    const dataArray = response.data?.data || [];
    
    return dataArray.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      productCount: brand.productCount || 0,
      status: brand.status || "active",
      description: brand.description,
      thumbnail: brand.thumbnail,
    }));
  } catch (error) {
    console.error("Error fetching featured brands:", error);
    return [];
  }
};

// Fetch products with filters
export interface FetchProductsParams {
  page?: number;
  per_page?: number;
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "name-asc";
  search?: string;
}

export interface FetchProductsResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export const fetchProductsWithFilters = async (params?: FetchProductsParams): Promise<FetchProductsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.category) {
      queryParams.append("category", params.category);
    }
    if (params?.brand) {
      queryParams.append("brand", params.brand);
    }
    if (params?.priceMin) queryParams.append("priceMin", params.priceMin.toString());
    if (params?.priceMax) queryParams.append("priceMax", params.priceMax.toString());
    if (params?.search) queryParams.append("search", params.search);
    
    // Debug: log query params
    console.log("Fetching products with filters:", {
      category: params?.category,
      brand: params?.brand,
      priceMin: params?.priceMin,
      priceMax: params?.priceMax,
      sort: params?.sort,
      queryString: queryParams.toString(),
    });
    
    // Map sort to backend sort_field and sort_order
    if (params?.sort) {
      switch (params.sort) {
        case "newest":
          queryParams.append("sort_field", "createdAt");
          queryParams.append("sort_order", "desc");
          break;
        case "price-asc":
          queryParams.append("sort_field", "price");
          queryParams.append("sort_order", "asc");
          break;
        case "price-desc":
          queryParams.append("sort_field", "price");
          queryParams.append("sort_order", "desc");
          break;
        case "name-asc":
          queryParams.append("sort_field", "name");
          queryParams.append("sort_order", "asc");
          break;
      }
    }

    const response = await axiosClient.get<ApiResponse<Product[]>>(
      `/products?${queryParams.toString()}`
    );
    
    const dataArray = response.data?.data || [];
    
    const products = dataArray.map((prod: any) => ({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      category: prod.category,
      categoryId: prod.categoryId,
      categorySlug: prod.categorySlug,
      brand: prod.brand,
      brandId: prod.brandId,
      brandSlug: prod.brandSlug,
      price: prod.price,
      originalPrice: prod.originalPrice,
      image: prod.image || (prod.images && prod.images[0]) || "",
      images: prod.images || (prod.image ? [prod.image] : []),
      description: prod.description,
      ingredients: prod.ingredients,
      stock: prod.stock || 0,
      status: prod.status || "available",
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,
    }));

    const pagination: PaginationMeta = response.data?.meta || {
      current_page: 1,
      per_page: params?.per_page || 12,
      total: products.length,
      last_page: 1,
      from: 1,
      to: products.length,
    };

    return { products, pagination };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], pagination: {
      current_page: 1,
      per_page: params?.per_page || 12,
      total: 0,
      last_page: 1,
      from: null,
      to: null,
    }};
  }
};

// Cart interfaces
export interface CartItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    images: string[];
    price: number;
    originalPrice: number | null;
  };
  quantity: number;
  subtotal: number;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch cart items
export const fetchCart = async (): Promise<CartItem[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<CartItem[]>>('/cart');
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};

// Add product to cart
export const addToCart = async (productId: number, quantity: number = 1): Promise<CartItem> => {
  try {
    const response = await axiosClient.post<ApiResponse<CartItem>>('/cart', {
      product_id: productId,
      quantity: quantity,
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (cartItemId: number, quantity: number): Promise<CartItem> => {
  try {
    const response = await axiosClient.put<ApiResponse<CartItem>>(`/cart/${cartItemId}`, {
      quantity: quantity,
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// Remove cart item
export const removeCartItem = async (cartItemId: number): Promise<void> => {
  try {
    await axiosClient.delete(`/cart/${cartItemId}`);
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

// Clear cart
export const clearCart = async (): Promise<void> => {
  try {
    await axiosClient.delete('/cart');
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// Order interfaces
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string | null;
  quantity: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Order {
  id: number;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string | null;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingEmail?: string | null;
  notes: string | null;
  items: OrderItem[];
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_email: string;
  payment_method?: string;
  notes?: string;
  shipping_fee?: number;
  promotion_code?: string;
  discount?: number;
}

// Fetch user orders
export const fetchOrders = async (params?: {
  page?: number;
  per_page?: number;
}): Promise<{ orders: Order[]; pagination: PaginationMeta }> => {
  try {
    const response = await axiosClient.get<ApiResponse<Order[]>>('/orders', {
      params,
    });
    return {
      orders: response.data?.data || [],
      pagination: response.data?.meta || {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      orders: [],
      pagination: {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      },
    };
  }
};

// Fetch order by ID
export const fetchOrder = async (id: number): Promise<Order | null> => {
  try {
    const response = await axiosClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

// Create order
export const createOrder = async (data: CreateOrderRequest): Promise<Order> => {
  try {
    const response = await axiosClient.post<ApiResponse<Order>>('/orders', data);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Admin: Fetch all orders
export const fetchAdminOrders = async (params?: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
}): Promise<{ orders: Order[]; pagination: PaginationMeta }> => {
  try {
    const response = await axiosClient.get<ApiResponse<Order[]>>('/admin/orders', {
      params,
    });
    return {
      orders: response.data?.data || [],
      pagination: response.data?.meta || {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      },
    };
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return {
      orders: [],
      pagination: {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      },
    };
  }
};

// Admin: Fetch order by ID
export const fetchAdminOrder = async (id: number): Promise<Order | null> => {
  try {
    const response = await axiosClient.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching admin order:", error);
    return null;
  }
};

// Admin: Update order status
export const updateOrderStatus = async (
  id: number,
  data: {
    status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  }
): Promise<Order> => {
  try {
    const response = await axiosClient.put<ApiResponse<Order>>(`/admin/orders/${id}`, data);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (id: number): Promise<Order> => {
  try {
    const response = await axiosClient.post<ApiResponse<Order>>(`/orders/${id}/cancel`);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};

// Admin: Delete order
export const deleteAdminOrder = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/admin/orders/${id}`);
  } catch (error) {
    console.error("Error deleting admin order:", error);
    throw error;
  }
};

// Settings interfaces
export interface Settings {
  general?: GeneralSettings;
  shipping?: ShippingSettings;
  appearance?: AppearanceSettings;
  [key: string]: any;
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface ShippingSettings {
  freeShippingThreshold: string;
  shippingFee: string;
  estimatedDeliveryDays: string;
}

export interface AppearanceSettings {
  favicon: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  primaryColor: string;
}

export interface HomepageSettings {
  heroNewCollection: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
}

// Public: Get settings (no auth required)
export const fetchPublicSettings = async (group?: string): Promise<Settings> => {
  try {
    const url = group ? `/settings?group=${group}` : '/settings';
    const response = await axiosClient.get<ApiResponse<Settings>>(url);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching public settings:", error);
    throw error;
  }
};

// Admin: Get settings
export const fetchSettings = async (group?: string): Promise<Settings> => {
  try {
    const url = group ? `/admin/settings?group=${group}` : '/admin/settings';
    const response = await axiosClient.get<ApiResponse<Settings>>(url);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

// Admin: Update settings
export const updateSettings = async (
  settings: Settings,
  group: 'general' | 'notifications' | 'shipping' | 'appearance' = 'general'
): Promise<Settings> => {
  try {
    const response = await axiosClient.put<ApiResponse<{ updated: Settings; errors: any }>>(
      '/admin/settings',
      {
        settings,
        group,
      }
    );
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data.updated;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};

// Contact interface
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Contact: Send contact message
export const submitContact = async (data: ContactFormData): Promise<void> => {
  try {
    const response = await axiosClient.post<ApiResponse<{ id: number }>>('/contact', data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Failed to send contact message");
    }
  } catch (error) {
    console.error("Error submitting contact:", error);
    throw error;
  }
};

// Notification interface
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  readAt: string | null;
  createdAt: string;
}

// Admin: Get notifications
export const fetchNotifications = async (params?: {
  per_page?: number;
  unread_only?: boolean;
}): Promise<{ data: Notification[]; meta: PaginationMeta }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.unread_only) queryParams.append('unread_only', 'true');
    
    const url = `/admin/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosClient.get<ApiResponse<Notification[]>>(url);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return {
      data: response.data.data,
      meta: response.data.meta || {} as PaginationMeta,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Admin: Get unread notifications count
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const response = await axiosClient.get<ApiResponse<{ count: number }>>('/admin/notifications/unread-count');
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data.count;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    throw error;
  }
};

// Admin: Mark notification as read
export const markNotificationAsRead = async (id: number): Promise<void> => {
  try {
    await axiosClient.put(`/admin/notifications/${id}/read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Admin: Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await axiosClient.put('/admin/notifications/mark-all-read');
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Admin: Delete notification
export const deleteNotification = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/admin/notifications/${id}`);
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Contact Message interface
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "pending" | "replied";
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Admin: Get contact messages
export const fetchContactMessages = async (params?: {
  per_page?: number;
  search?: string;
  status?: "all" | "pending" | "replied";
  sort_field?: "id" | "name" | "created_at";
  sort_order?: "asc" | "desc";
}): Promise<{ data: ContactMessage[]; meta: PaginationMeta }> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.sort_field) queryParams.append('sort_field', params.sort_field);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    
    const url = `/admin/support${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosClient.get<ApiResponse<ContactMessage[]>>(url);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return {
      data: response.data.data,
      meta: response.data.meta || {} as PaginationMeta,
    };
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    throw error;
  }
};

// Admin: Get contact message detail
export const fetchContactMessage = async (id: number): Promise<ContactMessage> => {
  try {
    const response = await axiosClient.get<ApiResponse<ContactMessage>>(`/admin/support/${id}`);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching contact message:", error);
    throw error;
  }
};

// Admin: Update contact message status
export const updateContactMessageStatus = async (
  id: number,
  status: "pending" | "replied"
): Promise<ContactMessage> => {
  try {
    const response = await axiosClient.put<ApiResponse<ContactMessage>>(
      `/admin/support/${id}/status`,
      { status }
    );
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error updating contact message status:", error);
    throw error;
  }
};

// Admin: Reply to contact message
export const replyToContactMessage = async (
  id: number,
  reply: string
): Promise<ContactMessage> => {
  try {
    const response = await axiosClient.post<ApiResponse<ContactMessage>>(
      `/admin/support/${id}/reply`,
      { reply }
    );
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error replying to contact message:", error);
    throw error;
  }
};

// Admin: Fetch all promotions
export const fetchAdminPromotions = async (params?: {
  page?: number;
  per_page?: number;
  status?: string;
  type?: string;
  search?: string;
  sort_field?: string;
  sort_order?: 'asc' | 'desc';
}): Promise<{ promotions: Promotion[]; pagination: PaginationMeta }> => {
  try {
    const response = await axiosClient.get<ApiResponse<Promotion[]>>('/admin/promotions', {
      params,
    });
    return {
      promotions: response.data?.data || [],
      pagination: response.data?.meta || {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      },
    };
  } catch (error) {
    console.error("Error fetching admin promotions:", error);
    return {
      promotions: [],
      pagination: {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      },
    };
  }
};

// Admin: Fetch promotion by ID
export const fetchAdminPromotion = async (id: number): Promise<Promotion | null> => {
  try {
    const response = await axiosClient.get<ApiResponse<Promotion>>(`/admin/promotions/${id}`);
    return response.data?.data || null;
  } catch (error) {
    console.error("Error fetching admin promotion:", error);
    return null;
  }
};

// Admin: Create promotion
export const createAdminPromotion = async (data: {
  code: string;
  name: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  start_date: string;
  end_date: string;
  status?: "active" | "inactive" | "expired";
}): Promise<Promotion> => {
  try {
    const response = await axiosClient.post<ApiResponse<Promotion>>('/admin/promotions', data);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error creating promotion:", error);
    throw error;
  }
};

// Admin: Update promotion
export const updateAdminPromotion = async (
  id: number,
  data: {
    code: string;
    name: string;
    description?: string;
    type: "percentage" | "fixed";
    value: number;
    min_order_amount?: number | null;
    max_discount_amount?: number | null;
    usage_limit?: number | null;
    start_date: string;
    end_date: string;
    status?: "active" | "inactive" | "expired";
  }
): Promise<Promotion> => {
  try {
    const response = await axiosClient.put<ApiResponse<Promotion>>(`/admin/promotions/${id}`, data);
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error updating promotion:", error);
    throw error;
  }
};

// Admin: Delete promotion
export const deleteAdminPromotion = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/admin/promotions/${id}`);
  } catch (error) {
    console.error("Error deleting admin promotion:", error);
    throw error;
  }
};

// Public: Validate promotion code
export interface ValidatePromotionResponse {
  promotion: Promotion;
  discount: number;
  final_amount: number;
}

export const validatePromotionCode = async (
  code: string,
  orderAmount: number
): Promise<ValidatePromotionResponse> => {
  try {
    const response = await axiosClient.post<ApiResponse<ValidatePromotionResponse>>(
      '/promotions/validate',
      {
        code: code.toUpperCase().trim(),
        order_amount: orderAmount,
      }
    );
    if (!response.data?.data) {
      throw new Error("No data returned from API");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error validating promotion code:", error);
    throw error;
  }
};

// Public: Subscribe to newsletter
export const subscribeNewsletter = async (email: string): Promise<void> => {
  try {
    await axiosClient.post('/newsletter/subscribe', {
      email: email.trim().toLowerCase(),
    });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    throw error;
  }
};

// Fetch reviews for a product
export interface FetchReviewsParams {
  page?: number;
  per_page?: number;
}

export interface FetchReviewsResponse {
  reviews: Review[];
  pagination: PaginationMeta;
}

export const fetchReviews = async (productSlug: string, params?: FetchReviewsParams): Promise<FetchReviewsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());

    const response = await axiosClient.get<ApiResponse<Review[]>>(
      `/products/${productSlug}/reviews?${queryParams.toString()}`
    );
    
    const dataArray = response.data?.data || [];
    const reviews = dataArray.map((review: any) => ({
      id: review.id,
      user: review.user,
      userId: review.userId,
      avatar: review.avatar,
      rating: review.rating,
      comment: review.comment,
      reply: review.reply,
      replyDate: review.replyDate,
      date: review.date,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    const pagination: PaginationMeta = response.data?.meta || {
      current_page: 1,
      per_page: params?.per_page || 5,
      total: reviews.length,
      last_page: 1,
      from: 1,
      to: reviews.length,
    };

    return { reviews, pagination };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { 
      reviews: [], 
      pagination: {
        current_page: 1,
        per_page: params?.per_page || 5,
        total: 0,
        last_page: 1,
        from: null,
        to: null,
      }
    };
  }
};

// Submit a review for a product
export interface SubmitReviewParams {
  rating: number;
  comment: string;
}

export const submitReview = async (productSlug: string, params: SubmitReviewParams): Promise<Review> => {
  try {
    const response = await axiosClient.post<ApiResponse<Review>>(
      `/products/${productSlug}/reviews`,
      {
        rating: params.rating,
        comment: params.comment,
      }
    );
    
    if (!response.data.data) {
      throw new Error("No data returned from API");
    }
    
    return {
      id: response.data.data.id,
      user: response.data.data.user,
      userId: response.data.data.userId,
      avatar: response.data.data.avatar,
      rating: response.data.data.rating,
      comment: response.data.data.comment,
      reply: response.data.data.reply,
      replyDate: response.data.data.replyDate,
      date: response.data.data.date,
      createdAt: response.data.data.createdAt,
      updatedAt: response.data.data.updatedAt,
    };
  } catch (error) {
    console.error("Error submitting review:", error);
    throw error;
  }
};

// Admin: Reply to a review
export const replyToReview = async (productSlug: string, reviewId: number, reply: string): Promise<Review> => {
  try {
    const response = await axiosClient.post<ApiResponse<Review>>(
      `/products/${productSlug}/reviews/${reviewId}/reply`,
      {
        reply: reply,
      }
    );
    
    if (!response.data.data) {
      throw new Error("No data returned from API");
    }
    
    return {
      id: response.data.data.id,
      user: response.data.data.user,
      userId: response.data.data.userId,
      avatar: response.data.data.avatar,
      rating: response.data.data.rating,
      comment: response.data.data.comment,
      reply: response.data.data.reply,
      replyDate: response.data.data.replyDate,
      date: response.data.data.date,
      createdAt: response.data.data.createdAt,
      updatedAt: response.data.data.updatedAt,
    };
  } catch (error) {
    console.error("Error replying to review:", error);
    throw error;
  }
};

