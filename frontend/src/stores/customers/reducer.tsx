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
import { Customer } from "./action";

interface CustomersState {
  customers: Customer[];
  currentCustomer: Customer | null;
  loading: boolean;
  error: string | Record<string, string[]> | null;
}

const initialState: CustomersState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
};

export const customersReducer = (state = initialState, action: any): CustomersState => {
  switch (action.type) {
    case FETCH_CUSTOMERS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_CUSTOMERS_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: action.payload,
        error: null,
      };
    case FETCH_CUSTOMERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tải danh sách khách hàng",
      };

    case FETCH_CUSTOMER_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        currentCustomer: action.payload,
        error: null,
      };
    case FETCH_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tải thông tin khách hàng",
      };

    case CREATE_CUSTOMER_REQUEST:
      return { ...state, loading: true, error: null };
    case CREATE_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: [...state.customers, action.payload],
        error: null,
      };
    case CREATE_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể tạo khách hàng",
      };

    case UPDATE_CUSTOMER_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: state.customers.map((customer) =>
          customer.id === action.payload.id ? action.payload : customer
        ),
        currentCustomer: action.payload,
        error: null,
      };
    case UPDATE_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể cập nhật khách hàng",
      };

    case DELETE_CUSTOMER_REQUEST:
      return { ...state, loading: true, error: null };
    case DELETE_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: state.customers.filter((customer) => customer.id !== action.payload),
        error: null,
      };
    case DELETE_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || "Không thể xóa khách hàng",
      };

    case CLEAR_CUSTOMERS_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

