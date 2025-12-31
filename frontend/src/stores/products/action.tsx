import {
  FETCH_PRODUCTS_REQUEST,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAILURE,
  FETCH_PRODUCT_REQUEST,
  FETCH_PRODUCT_SUCCESS,
  FETCH_PRODUCT_FAILURE,
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  CLEAR_PRODUCTS_ERROR,
} from "./actionType";
import { axiosClient } from "@/axios/axiosClient";
import { AppDispatch } from "../index";

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
  image?: string; // Backward compatibility
  images?: string[];
  description?: string;
  ingredients?: string;
  stock: number;
  status: "available" | "low_stock" | "out_of_stock" | "discontinued";
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

// Pagination parameters interface
export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_field?: string;
  sort_order?: "asc" | "desc";
  status?: string;
  category?: string;
  brand?: string;
}

// Fetch products with pagination
export const fetchProducts = (params?: PaginationParams) => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_PRODUCTS_REQUEST });
  try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append("page", params.page.toString());
            if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
            if (params?.search) queryParams.append("search", params.search);
            if (params?.sort_field) queryParams.append("sort_field", params.sort_field);
            if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
            if (params?.status) queryParams.append("status", params.status);
            if (params?.category) queryParams.append("category", params.category);
            if (params?.brand) queryParams.append("brand", params.brand);

            const response = await axiosClient.get(`/products?${queryParams.toString()}`);
    
    // Backend trả về { data: [...], meta: {...} }
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
      image: prod.image, // Backward compatibility
      images: prod.images || (prod.image ? [prod.image] : []),
      description: prod.description,
      ingredients: prod.ingredients,
      stock: prod.stock || 0,
      status: prod.status || "available",
      createdAt: prod.createdAt,
      updatedAt: prod.updatedAt,
    }));

    const paginationMeta: PaginationMeta = response.data?.meta || {
      current_page: 1,
      per_page: params?.per_page || 5,
      total: products.length,
      last_page: 1,
      from: 1,
      to: products.length,
    };

    dispatch({ 
      type: FETCH_PRODUCTS_SUCCESS, 
      payload: { products, pagination: paginationMeta }
    });
    return { products, pagination: paginationMeta };
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
      message?: string;
    };

    let errorMessage: string | Record<string, string[]> = "Không thể tải danh sách sản phẩm";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: FETCH_PRODUCTS_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Product Stats interface
export interface ProductStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  statusCounts: {
    all: number;
    available: number;
    low_stock: number;
    out_of_stock: number;
    discontinued: number;
  };
}

// Fetch products stats
export const fetchProductsStats = (params?: {
  search?: string;
  status?: string;
  category?: string;
}) => async (dispatch: AppDispatch): Promise<ProductStats> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.category) queryParams.append("category", params.category);

    const response = await axiosClient.get(`/products/stats?${queryParams.toString()}`);
    
    const stats: ProductStats = response.data?.data || {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      statusCounts: {
        all: 0,
        available: 0,
        low_stock: 0,
        out_of_stock: 0,
        discontinued: 0,
      },
    };

    return stats;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
      message?: string;
    };

    console.error("Error fetching products stats:", error);
    
    // Return default stats on error
    return {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      statusCounts: {
        all: 0,
        available: 0,
        low_stock: 0,
        out_of_stock: 0,
        discontinued: 0,
      },
    };
  }
};

// Fetch single product by slug
export const fetchProduct = (slug: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_PRODUCT_REQUEST });
  try {
    const response = await axiosClient.get(`/products/${slug}`);
    
    const productData = response.data.data?.product || response.data.data;
    const product = {
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      category: productData.category,
      categoryId: productData.categoryId,
      categorySlug: productData.categorySlug,
      brand: productData.brand,
      brandId: productData.brandId,
      brandSlug: productData.brandSlug,
      price: productData.price,
      originalPrice: productData.originalPrice,
      image: productData.image, // Backward compatibility
      images: productData.images || (productData.image ? [productData.image] : []),
      description: productData.description,
      ingredients: productData.ingredients,
      stock: productData.stock || 0,
      status: productData.status || "available",
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt,
    };

    dispatch({ type: FETCH_PRODUCT_SUCCESS, payload: product });
    return product;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
      message?: string;
    };

    let errorMessage: string | Record<string, string[]> = "Không thể tải thông tin sản phẩm";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: FETCH_PRODUCT_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Create product
export const createProduct = (data: {
  name: string;
  categoryId?: number | null;
  brandId?: number | null;
  price: number;
  originalPrice?: number | null;
  images?: string[];
  description?: string;
  stock?: number;
  status?: "available" | "low_stock" | "out_of_stock" | "discontinued";
}) => async (dispatch: AppDispatch) => {
  dispatch({ type: CREATE_PRODUCT_REQUEST });
  try {
    const payload: Record<string, any> = {
      name: data.name,
      price: data.price,
      images: data.images || [],
      stock: data.stock || 0,
      status: data.status || "available",
    };

    // Luôn gửi các field optional (kể cả null) để backend xử lý đúng
    payload.categoryId = data.categoryId !== undefined ? data.categoryId : null;
    payload.brandId = data.brandId !== undefined ? data.brandId : null;
    payload.originalPrice = data.originalPrice !== undefined ? data.originalPrice : null;
    payload.description = data.description !== undefined ? data.description : null;
    payload.ingredients = data.ingredients !== undefined ? data.ingredients : null;

    const response = await axiosClient.post("/products", payload);
    
    const productData = response.data.data?.product || response.data.data;
    const product = {
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      category: productData.category,
      categoryId: productData.categoryId,
      categorySlug: productData.categorySlug,
      brand: productData.brand,
      brandId: productData.brandId,
      brandSlug: productData.brandSlug,
      price: productData.price,
      originalPrice: productData.originalPrice,
      image: productData.image, // Backward compatibility
      images: productData.images || (productData.image ? [productData.image] : []),
      description: productData.description,
      ingredients: productData.ingredients,
      stock: productData.stock || 0,
      status: productData.status || "available",
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt,
    };

    dispatch({ type: CREATE_PRODUCT_SUCCESS, payload: product });
    return product;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
      message?: string;
    };

    let errorMessage: string | Record<string, string[]> = "Không thể tạo sản phẩm";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: CREATE_PRODUCT_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Update product
export const updateProduct = (
  slug: string,
  data: {
    name: string;
    categoryId?: number | null;
    brandId?: number | null;
    price: number;
    originalPrice?: number | null;
    images?: string[];
    description?: string;
    ingredients?: string;
    stock: number;
    status: "available" | "low_stock" | "out_of_stock" | "discontinued";
  }
) => async (dispatch: AppDispatch) => {
  dispatch({ type: UPDATE_PRODUCT_REQUEST });
  try {
    const payload: Record<string, any> = {
      name: data.name,
      price: data.price,
      images: data.images || [],
      stock: data.stock,
      status: data.status,
    };

    // Luôn gửi các field optional (kể cả null) để backend xử lý đúng
    payload.categoryId = data.categoryId !== undefined ? data.categoryId : null;
    payload.brandId = data.brandId !== undefined ? data.brandId : null;
    payload.originalPrice = data.originalPrice !== undefined ? data.originalPrice : null;
    payload.description = data.description !== undefined ? data.description : null;
    payload.ingredients = data.ingredients !== undefined ? data.ingredients : null;

    const response = await axiosClient.put(`/products/${slug}`, payload);
    
    const productData = response.data.data?.product || response.data.data;
    const product = {
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      category: productData.category,
      categoryId: productData.categoryId,
      categorySlug: productData.categorySlug,
      brand: productData.brand,
      brandId: productData.brandId,
      brandSlug: productData.brandSlug,
      price: productData.price,
      originalPrice: productData.originalPrice,
      image: productData.image, // Backward compatibility
      images: productData.images || (productData.image ? [productData.image] : []),
      description: productData.description,
      ingredients: productData.ingredients,
      stock: productData.stock || 0,
      status: productData.status || "available",
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt,
    };

    dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: product });
    return product;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
      message?: string;
    };

    let errorMessage: string | Record<string, string[]> = "Không thể cập nhật sản phẩm";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: UPDATE_PRODUCT_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Delete product
export const deleteProduct = (slug: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: DELETE_PRODUCT_REQUEST });
  try {
    await axiosClient.delete(`/products/${slug}`);
    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: slug });
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
      message?: string;
    };

    let errorMessage: string | Record<string, string[]> = "Không thể xóa sản phẩm";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: DELETE_PRODUCT_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Clear error
export const clearProductsError = () => ({
  type: CLEAR_PRODUCTS_ERROR,
});

