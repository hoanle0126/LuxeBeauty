import {
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  FETCH_CATEGORY_REQUEST,
  FETCH_CATEGORY_SUCCESS,
  FETCH_CATEGORY_FAILURE,
  CREATE_CATEGORY_REQUEST,
  CREATE_CATEGORY_SUCCESS,
  CREATE_CATEGORY_FAILURE,
  UPDATE_CATEGORY_REQUEST,
  UPDATE_CATEGORY_SUCCESS,
  UPDATE_CATEGORY_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE,
  CLEAR_CATEGORIES_ERROR,
} from "./actionType";
import { axiosClient } from "@/axios/axiosClient";
import { AppDispatch } from "../index";

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

// Pagination metadata interface
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

// Fetch categories with pagination
export const fetchCategories = (params?: {
  page?: number;
  per_page?: number;
  search?: string;
  sort_field?: string;
  sort_order?: "asc" | "desc";
}) => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_CATEGORIES_REQUEST });
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page) queryParams.append("per_page", params.per_page.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_field) queryParams.append("sort_field", params.sort_field);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await axiosClient.get(`/categories?${queryParams.toString()}`);
    
    // Backend trả về { success: true, data: [...], meta: {...} }
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

    const paginationMeta: PaginationMeta = response.data?.meta || {
      current_page: 1,
      per_page: params?.per_page || 5,
      total: categories.length,
      last_page: 1,
      from: 1,
      to: categories.length,
    };

    dispatch({ 
      type: FETCH_CATEGORIES_SUCCESS, 
      payload: { categories, pagination: paginationMeta }
    });
    return { categories, pagination: paginationMeta };
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

    let errorMessage: string | Record<string, string[]> = "Không thể tải danh sách danh mục";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: FETCH_CATEGORIES_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Fetch single category by slug
export const fetchCategory = (slug: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_CATEGORY_REQUEST });
  try {
    const response = await axiosClient.get(`/categories/${slug}`);
    
    const category = {
      id: response.data.data.category.id,
      name: response.data.data.category.name,
      slug: response.data.data.category.slug,
      productCount: response.data.data.category.productCount || 0,
      status: response.data.data.category.status || "active",
      description: response.data.data.category.description,
      thumbnail: response.data.data.category.thumbnail,
    };

    dispatch({ type: FETCH_CATEGORY_SUCCESS, payload: category });
    return category;
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

    let errorMessage: string | Record<string, string[]> = "Không thể tải thông tin danh mục";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: FETCH_CATEGORY_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Create category
export const createCategory = (categoryData: {
  name: string;
  description?: string;
  thumbnail?: string;
  status?: "active" | "inactive";
}) => async (dispatch: AppDispatch) => {
  dispatch({ type: CREATE_CATEGORY_REQUEST });
  try {
    const payload: any = {
      name: categoryData.name,
      description: categoryData.description || null,
      thumbnail: categoryData.thumbnail || null,
      status: categoryData.status || "active",
    };

    const response = await axiosClient.post("/categories", payload);

    const category = {
      id: response.data.data.category.id,
      name: response.data.data.category.name,
      slug: response.data.data.category.slug,
      productCount: response.data.data.category.productCount || 0,
      status: response.data.data.category.status || "active",
      description: response.data.data.category.description,
      thumbnail: response.data.data.category.thumbnail,
    };

    dispatch({ type: CREATE_CATEGORY_SUCCESS, payload: category });
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

    let errorMessage: string | Record<string, string[]> = "Không thể tạo danh mục";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: CREATE_CATEGORY_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Update category
export const updateCategory = (
  slug: string,
  categoryData: {
    name: string;
    description?: string;
    thumbnail?: string;
    status: "active" | "inactive";
  }
) => async (dispatch: AppDispatch) => {
  dispatch({ type: UPDATE_CATEGORY_REQUEST });
  try {
    const payload: any = {
      name: categoryData.name,
      description: categoryData.description || null,
      thumbnail: categoryData.thumbnail || null,
      status: categoryData.status,
    };

    const response = await axiosClient.put(`/categories/${slug}`, payload);

    const category = {
      id: response.data.data.category.id,
      name: response.data.data.category.name,
      slug: response.data.data.category.slug,
      productCount: response.data.data.category.productCount || 0,
      status: response.data.data.category.status || "active",
      description: response.data.data.category.description,
      thumbnail: response.data.data.category.thumbnail,
    };

    dispatch({ type: UPDATE_CATEGORY_SUCCESS, payload: category });
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

    let errorMessage: string | Record<string, string[]> = "Không thể cập nhật danh mục";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: UPDATE_CATEGORY_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Delete category
export const deleteCategory = (slug: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: DELETE_CATEGORY_REQUEST });
  try {
    await axiosClient.delete(`/categories/${slug}`);
    dispatch({ type: DELETE_CATEGORY_SUCCESS, payload: slug });
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

    let errorMessage: string | Record<string, string[]> = "Không thể xóa danh mục";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: DELETE_CATEGORY_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Clear error
export const clearCategoriesError = () => ({
  type: CLEAR_CATEGORIES_ERROR,
});

