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

// Load user từ localStorage khi khởi tạo
const loadUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error parsing stored user:", error);
    localStorage.removeItem("user");
  }
  return null;
};

const initialState = {
  loading: false,
  user: loadUserFromStorage(),
  error: null as string | Record<string, string[]> | null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.data?.user || null,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Đăng nhập thất bại",
        user: null,
      };
    case REGISTER_REQUEST:
      return { ...state, loading: true, error: null };
    case REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.data?.user || null,
        error: null,
      };
    case REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Đăng ký thất bại",
        user: null,
      };
    case FORGOT_PASSWORD_REQUEST:
      return { ...state, loading: true, error: null };
    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case FORGOT_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Gửi email đặt lại mật khẩu thất bại",
      };
    case RESET_PASSWORD_REQUEST:
      return { ...state, loading: true, error: null };
    case RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case RESET_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Đặt lại mật khẩu thất bại",
      };
    case LOGOUT:
      // Clear user và token khi logout
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
        error: null,
        loading: false,
      };
    case CLEAR_AUTH_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};
