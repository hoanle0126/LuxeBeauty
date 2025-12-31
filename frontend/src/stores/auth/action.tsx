import { 
  LOGIN_FAILURE, 
  LOGIN_REQUEST, 
  LOGIN_SUCCESS, 
  LOGOUT,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  CLEAR_AUTH_ERROR,
} from "./actionType";
import { axiosClient } from "@/axios/axiosClient";
import { AppDispatch } from "../index";

export const login = (email: string, password: string, rememberMe: boolean = false) => async (dispatch: AppDispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const response = await axiosClient.post("/login", { 
      email, 
      password,
      remember_me: rememberMe 
    });
    
    // Lưu token nếu có (cho tương lai khi dùng Sanctum)
    if (response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    
    // Lưu user vào localStorage
    if (response.data.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    
    dispatch({ type: LOGIN_SUCCESS, payload: response.data });
    return response.data;
  } catch (error: unknown) {
    const errorResponse = error as { 
      response?: { 
        data?: { 
          message?: string;
          errors?: Record<string, string[]>;
        } 
      }; 
      message?: string;
    };
    
    // Xử lý Laravel validation errors
    let errorMessage: string | Record<string, string[]> = "Đăng nhập thất bại";
    if (errorResponse.response?.data?.errors) {
      // Laravel validation errors format: { field: ["message1", "message2"] }
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }
    
    dispatch({ type: LOGIN_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

export const register = (
  fullName: string,
  email: string,
  phone: string,
  password: string,
  confirmPassword: string,
  agreeToTerms: boolean
) => async (dispatch: AppDispatch) => {
  dispatch({ type: REGISTER_REQUEST });
  try {
    const response = await axiosClient.post("/register", {
      name: fullName,
      email,
      phone,
      password,
      confirm_password: confirmPassword,
      agree_to_terms: agreeToTerms,
    });
    
    // Lưu token nếu có
    if (response.data.data?.token) {
      localStorage.setItem("token", response.data.data.token);
    }
    
    // Lưu user vào localStorage
    if (response.data.data?.user) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    
    dispatch({ type: REGISTER_SUCCESS, payload: response.data });
    return response.data;
  } catch (error: unknown) {
    const errorResponse = error as { 
      response?: { 
        data?: { 
          message?: string;
          errors?: Record<string, string[]>;
        } 
      }; 
      message?: string;
    };
    
    // Xử lý Laravel validation errors
    let errorMessage: string | Record<string, string[]> = "Đăng ký thất bại";
    if (errorResponse.response?.data?.errors) {
      // Laravel validation errors format: { field: ["message1", "message2"] }
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }
    
    dispatch({ type: REGISTER_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

export const forgotPassword = (email: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: FORGOT_PASSWORD_REQUEST });
  try {
    const response = await axiosClient.post("/forgot-password", {
      email,
    });
    
    dispatch({ type: FORGOT_PASSWORD_SUCCESS, payload: response.data });
    return response.data;
  } catch (error: unknown) {
    const errorResponse = error as { 
      response?: { 
        data?: { 
          message?: string;
          errors?: Record<string, string[]>;
        } 
      }; 
      message?: string;
    };
    
    // Xử lý Laravel validation errors
    let errorMessage: string | Record<string, string[]> = "Gửi email đặt lại mật khẩu thất bại";
    if (errorResponse.response?.data?.errors) {
      // Laravel validation errors format: { field: ["message1", "message2"] }
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }
    
    dispatch({ type: FORGOT_PASSWORD_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

export const resetPassword = (
  email: string,
  token: string,
  password: string,
  confirmPassword: string
) => async (dispatch: AppDispatch) => {
  dispatch({ type: RESET_PASSWORD_REQUEST });
  try {
    const response = await axiosClient.post("/reset-password", {
      email,
      token,
      password,
      confirm_password: confirmPassword,
    });
    
    dispatch({ type: RESET_PASSWORD_SUCCESS, payload: response.data });
    return response.data;
  } catch (error: unknown) {
    const errorResponse = error as { 
      response?: { 
        data?: { 
          message?: string;
          errors?: Record<string, string[]>;
        } 
      }; 
      message?: string;
    };
    
    // Xử lý Laravel validation errors
    let errorMessage: string | Record<string, string[]> = "Đặt lại mật khẩu thất bại";
    if (errorResponse.response?.data?.errors) {
      // Laravel validation errors format: { field: ["message1", "message2"] }
      errorMessage = errorResponse.response.data.errors;
    } else if (errorResponse.response?.data?.message) {
      errorMessage = errorResponse.response.data.message;
    } else if (errorResponse.message) {
      errorMessage = errorResponse.message;
    }
    
    dispatch({ type: RESET_PASSWORD_FAILURE, payload: { message: errorMessage } });
    throw error;
  }
};

export const clearAuthError = () => (dispatch: AppDispatch) => {
  dispatch({ type: CLEAR_AUTH_ERROR });
};

export const logout = () => (dispatch: AppDispatch) => {
  dispatch({ type: LOGOUT });
};
