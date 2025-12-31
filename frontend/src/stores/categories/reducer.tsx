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
import { Category, PaginationMeta } from "./action";

interface CategoriesState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | Record<string, string[]> | null;
  pagination: PaginationMeta | null;
}

const initialState: CategoriesState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  pagination: null,
};

export const categoriesReducer = (state = initialState, action: any): CategoriesState => {
  switch (action.type) {
    case FETCH_CATEGORIES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload.categories || action.payload,
        pagination: action.payload.pagination || null,
        error: null,
      };
    case FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tải danh sách danh mục",
      };

    case FETCH_CATEGORY_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        currentCategory: action.payload,
        error: null,
      };
    case FETCH_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tải thông tin danh mục",
      };

    case CREATE_CATEGORY_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: [...state.categories, action.payload],
        error: null,
      };
    case CREATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tạo danh mục",
      };

    case UPDATE_CATEGORY_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id ? action.payload : cat
        ),
        currentCategory: action.payload,
        error: null,
      };
    case UPDATE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể cập nhật danh mục",
      };

    case DELETE_CATEGORY_REQUEST:
      return { ...state, loading: true, error: null };
    case DELETE_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: state.categories.filter((cat) => cat.slug !== action.payload),
        error: null,
      };
    case DELETE_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể xóa danh mục",
      };

    case CLEAR_CATEGORIES_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

