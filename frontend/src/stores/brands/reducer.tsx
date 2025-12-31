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
import { Brand, PaginationMeta } from "./action";

interface BrandsState {
  brands: Brand[];
  currentBrand: Brand | null;
  loading: boolean;
  error: string | Record<string, string[]> | null;
  pagination: PaginationMeta | null;
}

const initialState: BrandsState = {
  brands: [],
  currentBrand: null,
  loading: false,
  error: null,
  pagination: null,
};

export const brandsReducer = (state = initialState, action: any): BrandsState => {
  switch (action.type) {
    case FETCH_BRANDS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_BRANDS_SUCCESS:
      return {
        ...state,
        loading: false,
        brands: action.payload.brands || action.payload,
        pagination: action.payload.pagination || null,
        error: null,
      };
    case FETCH_BRANDS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tải danh sách thương hiệu",
      };

    case FETCH_BRAND_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_BRAND_SUCCESS:
      return {
        ...state,
        loading: false,
        currentBrand: action.payload,
        error: null,
      };
    case FETCH_BRAND_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tải thông tin thương hiệu",
      };

    case CREATE_BRAND_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_BRAND_SUCCESS:
      return {
        ...state,
        loading: false,
        brands: [...state.brands, action.payload],
        error: null,
      };
    case CREATE_BRAND_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tạo thương hiệu",
      };

    case UPDATE_BRAND_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_BRAND_SUCCESS:
      return {
        ...state,
        loading: false,
        brands: state.brands.map((brand) =>
          brand.id === action.payload.id ? action.payload : brand
        ),
        currentBrand: action.payload,
        error: null,
      };
    case UPDATE_BRAND_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể cập nhật thương hiệu",
      };

    case DELETE_BRAND_REQUEST:
      return { ...state, loading: true, error: null };
    case DELETE_BRAND_SUCCESS:
      return {
        ...state,
        loading: false,
        brands: state.brands.filter((brand) => brand.slug !== action.payload),
        error: null,
      };
    case DELETE_BRAND_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể xóa thương hiệu",
      };

    case CLEAR_BRANDS_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

