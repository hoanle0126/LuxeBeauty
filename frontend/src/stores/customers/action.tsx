import {
  FETCH_CUSTOMERS_REQUEST,
  FETCH_CUSTOMERS_SUCCESS,
  FETCH_CUSTOMERS_FAILURE,
  FETCH_CUSTOMER_REQUEST,
  FETCH_CUSTOMER_SUCCESS,
  FETCH_CUSTOMER_FAILURE,
  CREATE_CUSTOMER_REQUEST,
  CREATE_CUSTOMER_SUCCESS,
  CREATE_CUSTOMER_FAILURE,
  UPDATE_CUSTOMER_REQUEST,
  UPDATE_CUSTOMER_SUCCESS,
  UPDATE_CUSTOMER_FAILURE,
  DELETE_CUSTOMER_REQUEST,
  DELETE_CUSTOMER_SUCCESS,
  DELETE_CUSTOMER_FAILURE,
  CLEAR_CUSTOMERS_ERROR,
} from "./actionType";
import { axiosClient } from "@/axios/axiosClient";
import { AppDispatch } from "../index";

// Customer interface
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  status: "active" | "blocked";
  isVip: boolean;
  lastOrderDate?: string;
}

// Fetch all customers (Admin only)
export const fetchCustomers = () => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_CUSTOMERS_REQUEST });
  try {
    const response = await axiosClient.get("/admin/customers");
    
    // Laravel Resource Collection trả về { data: [...] }
    const dataArray = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || []);
    
    const customers = dataArray.map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      avatar: customer.avatar,
      address: customer.address,
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      joinedDate: customer.joinedDate || customer.createdAt,
      status: customer.status || "active",
      isVip: customer.isVip || false,
      lastOrderDate: customer.lastOrderDate,
    }));

    dispatch({ type: FETCH_CUSTOMERS_SUCCESS, payload: customers });
    return customers;
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

    let errorMessage: string | Record<string, string[]> = "Không thể tải danh sách khách hàng";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: FETCH_CUSTOMERS_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Fetch single customer by id (Admin only)
export const fetchCustomer = (id: number) => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_CUSTOMER_REQUEST });
  try {
    const response = await axiosClient.get(`/admin/customers/${id}`);
    
    // Backend trả về: { success: true, data: { customer: {...} } }
    const customerData = response.data.data?.customer || response.data.data || response.data;
    
    if (!customerData || !customerData.id) {
      throw new Error('Customer data not found in response');
    }
    
    const customer = {
      id: customerData.id,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || "",
      avatar: customerData.avatar,
      address: customerData.address,
      totalOrders: customerData.totalOrders || 0,
      totalSpent: customerData.totalSpent || 0,
      joinedDate: customerData.joinedDate || customerData.createdAt,
      status: customerData.status || "active",
      isVip: customerData.isVip || false,
      lastOrderDate: customerData.lastOrderDate,
    };

    dispatch({ type: FETCH_CUSTOMER_SUCCESS, payload: customer });
    return customer;
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

    let errorMessage: string | Record<string, string[]> = "Không thể tải thông tin khách hàng";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: FETCH_CUSTOMER_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Create customer
export const createCustomer = (customerData: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  address?: string;
  avatar?: string;
  status?: "active" | "blocked";
}) => async (dispatch: AppDispatch) => {
  dispatch({ type: CREATE_CUSTOMER_REQUEST });
  try {
    const payload: any = {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || null,
      password: customerData.password,
      address: customerData.address || null,
      avatar: customerData.avatar || null,
      status: customerData.status || "active",
    };

    const response = await axiosClient.post("/customers", payload);

    const customerDataResponse = response.data.data?.customer || response.data;
    const customer = {
      id: customerDataResponse.id,
      name: customerDataResponse.name,
      email: customerDataResponse.email,
      phone: customerDataResponse.phone || "",
      avatar: customerDataResponse.avatar,
      address: customerDataResponse.address,
      totalOrders: customerDataResponse.totalOrders || 0,
      totalSpent: customerDataResponse.totalSpent || 0,
      joinedDate: customerDataResponse.joinedDate || customerDataResponse.createdAt,
      status: customerDataResponse.status || "active",
      isVip: customerDataResponse.isVip || false,
      lastOrderDate: customerDataResponse.lastOrderDate,
    };

    dispatch({ type: CREATE_CUSTOMER_SUCCESS, payload: customer });
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

    let errorMessage: string | Record<string, string[]> = "Không thể tạo khách hàng";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: CREATE_CUSTOMER_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Update customer
export const updateCustomer = (
  id: number,
  customerData: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    address?: string;
    avatar?: string;
    status: "active" | "blocked";
  }
) => async (dispatch: AppDispatch) => {
  dispatch({ type: UPDATE_CUSTOMER_REQUEST });
  try {
    const payload: any = {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || null,
      address: customerData.address || null,
      avatar: customerData.avatar || null,
      status: customerData.status,
    };

    // Chỉ thêm password nếu có
    if (customerData.password) {
      payload.password = customerData.password;
    }

    const response = await axiosClient.put(`/admin/customers/${id}`, payload);

    const customerDataResponse = response.data.data?.customer || response.data;
    const customer = {
      id: customerDataResponse.id,
      name: customerDataResponse.name,
      email: customerDataResponse.email,
      phone: customerDataResponse.phone || "",
      avatar: customerDataResponse.avatar,
      address: customerDataResponse.address,
      totalOrders: customerDataResponse.totalOrders || 0,
      totalSpent: customerDataResponse.totalSpent || 0,
      joinedDate: customerDataResponse.joinedDate || customerDataResponse.createdAt,
      status: customerDataResponse.status || "active",
      isVip: customerDataResponse.isVip || false,
      lastOrderDate: customerDataResponse.lastOrderDate,
    };

    dispatch({ type: UPDATE_CUSTOMER_SUCCESS, payload: customer });
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

    let errorMessage: string | Record<string, string[]> = "Không thể cập nhật khách hàng";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: UPDATE_CUSTOMER_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Delete customer
export const deleteCustomer = (id: number) => async (dispatch: AppDispatch) => {
  dispatch({ type: DELETE_CUSTOMER_REQUEST });
  try {
    await axiosClient.delete(`/admin/customers/${id}`);
    dispatch({ type: DELETE_CUSTOMER_SUCCESS, payload: id });
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

    let errorMessage: string | Record<string, string[]> = "Không thể xóa khách hàng";
    if (errorResponse.response?.data?.errors) {
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }

    dispatch({ type: DELETE_CUSTOMER_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

// Clear error
export const clearCustomersError = () => ({
  type: CLEAR_CUSTOMERS_ERROR,
});

