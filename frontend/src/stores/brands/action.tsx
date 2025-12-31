import {
  FETCH_BRANDS_REQUEST,
  FETCH_BRANDS_SUCCESS,
  FETCH_BRANDS_FAILURE,
  FETCH_BRAND_REQUEST,
  FETCH_BRAND_SUCCESS,
  FETCH_BRAND_FAILURE,
  CREATE_BRAND_REQUEST,
  CREATE_BRAND_SUCCESS,
  CREATE_BRAND_FAILURE,
  UPDATE_BRAND_REQUEST,
  UPDATE_BRAND_SUCCESS,
  UPDATE_BRAND_FAILURE,
  DELETE_BRAND_REQUEST,
  DELETE_BRAND_SUCCESS,
  DELETE_BRAND_FAILURE,
  CLEAR_BRANDS_ERROR,
} from "./actionType";
import { axiosClient } from "@/axios/axiosClient";
import { AppDispatch } from "../index";

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

// Pagination metadata interface
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

// Fetch brands with pagination
export const fetchBrands = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  sort_field?: string;
  sort_order?: "asc" | "desc";
}) => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_BRANDS_REQUEST });
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_field) queryParams.append("sort_field", params.sort_field);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await axiosClient.get(`/brands?${queryParams.toString()}`);
    
    // Backend trả về { success: true, data: [...], meta: {...} }
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

    const paginationMeta: PaginationMeta = response.data?.meta || {
      current_page: 1,
      per_page: params?.per_page || 5,
      total: brands.length,
      last_page: 1,
      from: 1,
      to: brands.length,
    };

    dispatch({ 
      type: FETCH_BRANDS_SUCCESS, 
      payload: { brands, pagination: paginationMeta }
    });
    return { brands, pagination: paginationMeta };
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

    let errorMessage: string | Record<string, string[]> = "Không thể tải danh sách thương hiệu";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: FETCH_BRANDS_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Fetch single brand by slug
export const fetchBrand = (slug: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_BRAND_REQUEST });
  try {
    const response = await axiosClient.get(`/brands/${slug}`);
    
    const brand = {
      id: response.data.data.brand.id,
      name: response.data.data.brand.name,
      slug: response.data.data.brand.slug,
      productCount: response.data.data.brand.productCount || 0,
      status: response.data.data.brand.status || "active",
      description: response.data.data.brand.description,
      thumbnail: response.data.data.brand.thumbnail,
    };

    dispatch({ type: FETCH_BRAND_SUCCESS, payload: brand });
    return brand;
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

    let errorMessage: string | Record<string, string[]> = "Không thể tải thông tin thương hiệu";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: FETCH_BRAND_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Create brand
export const createBrand = (brandData: {
  name: string;
  description?: string;
  thumbnail?: string;
  status?: "active" | "inactive";
}) => async (dispatch: AppDispatch) => {
  dispatch({ type: CREATE_BRAND_REQUEST });
  try {
    const payload: any = {
      name: brandData.name,
      description: brandData.description || null,
      thumbnail: brandData.thumbnail || null,
      status: brandData.status || "active",
    };

    const response = await axiosClient.post("/brands", payload);

    const brand = {
      id: response.data.data.brand.id,
      name: response.data.data.brand.name,
      slug: response.data.data.brand.slug,
      productCount: response.data.data.brand.productCount || 0,
      status: response.data.data.brand.status || "active",
      description: response.data.data.brand.description,
      thumbnail: response.data.data.brand.thumbnail,
    };

    dispatch({ type: CREATE_BRAND_SUCCESS, payload: brand });
    return response.data;
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

    let errorMessage: string | Record<string, string[]> = "Không thể tạo thương hiệu";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: CREATE_BRAND_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Update brand
export const updateBrand = (
  slug: string,
  brandData: {
    name: string;
    description?: string;
    thumbnail?: string;
    status: "active" | "inactive";
  }
) => async (dispatch: AppDispatch) => {
  dispatch({ type: UPDATE_BRAND_REQUEST });
  try {
    const payload: any = {
      name: brandData.name,
      description: brandData.description || null,
      thumbnail: brandData.thumbnail || null,
      status: brandData.status,
    };

    const response = await axiosClient.put(`/brands/${slug}`, payload);

    const brand = {
      id: response.data.data.brand.id,
      name: response.data.data.brand.name,
      slug: response.data.data.brand.slug,
      productCount: response.data.data.brand.productCount || 0,
      status: response.data.data.brand.status || "active",
      description: response.data.data.brand.description,
      thumbnail: response.data.data.brand.thumbnail,
    };

    dispatch({ type: UPDATE_BRAND_SUCCESS, payload: brand });
    return response.data;
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

    let errorMessage: string | Record<string, string[]> = "Không thể cập nhật thương hiệu";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: UPDATE_BRAND_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Delete brand
export const deleteBrand = (slug: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: DELETE_BRAND_REQUEST });
  try {
    await axiosClient.delete(`/brands/${slug}`);
    dispatch({ type: DELETE_BRAND_SUCCESS, payload: slug });
    return { success: true };
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

    let errorMessage: string | Record<string, string[]> = "Không thể xóa thương hiệu";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: DELETE_BRAND_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Clear error
export const clearBrandsError = () => ({
  type: CLEAR_BRANDS_ERROR,
});

