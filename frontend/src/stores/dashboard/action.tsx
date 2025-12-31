import {
  FETCH_DASHBOARD_STATS_REQUEST,
  FETCH_DASHBOARD_STATS_SUCCESS,
  FETCH_DASHBOARD_STATS_FAILURE,
  FETCH_REVENUE_CHART_REQUEST,
  FETCH_REVENUE_CHART_SUCCESS,
  FETCH_REVENUE_CHART_FAILURE,
  FETCH_ORDERS_CHART_REQUEST,
  FETCH_ORDERS_CHART_SUCCESS,
  FETCH_ORDERS_CHART_FAILURE,
  FETCH_TOP_PRODUCTS_REQUEST,
  FETCH_TOP_PRODUCTS_SUCCESS,
  FETCH_TOP_PRODUCTS_FAILURE,
  FETCH_RECENT_ORDERS_REQUEST,
  FETCH_RECENT_ORDERS_SUCCESS,
  FETCH_RECENT_ORDERS_FAILURE,
  CLEAR_DASHBOARD_ERROR,
} from "./actionType";
import { axiosClient } from "@/axios/axiosClient";
import { AppDispatch } from "../index";

// Dashboard Stats interface
export interface DashboardStats {
  revenue: {
    total: number;
    currentMonth: number;
    change: number;
    trend: "up" | "down";
  };
  orders: {
    total: number;
    currentMonth: number;
    change: number;
    trend: "up" | "down";
  };
  customers: {
    total: number;
    currentMonth: number;
    change: number;
    trend: "up" | "down";
  };
  products: {
    total: number;
    currentMonth: number;
    change: number;
    trend: "up" | "down";
  };
}

// Revenue Chart Data
export interface RevenueChartData {
  months: string[];
  revenues: number[];
}

// Orders Chart Data
export interface OrdersChartData {
  months: string[];
  orders: number[];
}

// Top Product
export interface TopProduct {
  id: number;
  name: string;
  sold: number;
  revenue: number;
}

// Recent Order
export interface RecentOrder {
  id: number;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

// Fetch dashboard stats
export const fetchDashboardStats = () => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_DASHBOARD_STATS_REQUEST });
  try {
    const response = await axiosClient.get("/admin/dashboard/stats");
    const stats: DashboardStats = response.data.data;
    
    dispatch({ type: FETCH_DASHBOARD_STATS_SUCCESS, payload: stats });
    return stats;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
    };
    
    const errorMessage = errorResponse.response?.data?.message || "Failed to fetch dashboard stats";
    
    dispatch({ type: FETCH_DASHBOARD_STATS_FAILURE, payload: errorMessage });
    throw error;
  }
};

// Fetch revenue chart data
export const fetchRevenueChart = () => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_REVENUE_CHART_REQUEST });
  try {
    const response = await axiosClient.get("/admin/dashboard/revenue-chart");
    const data: RevenueChartData = response.data.data;
    
    dispatch({ type: FETCH_REVENUE_CHART_SUCCESS, payload: data });
    return data;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
    };
    
    const errorMessage = errorResponse.response?.data?.message || "Failed to fetch revenue chart";
    
    dispatch({ type: FETCH_REVENUE_CHART_FAILURE, payload: errorMessage });
    throw error;
  }
};

// Fetch orders chart data
export const fetchOrdersChart = () => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_ORDERS_CHART_REQUEST });
  try {
    const response = await axiosClient.get("/admin/dashboard/orders-chart");
    const data: OrdersChartData = response.data.data;
    
    dispatch({ type: FETCH_ORDERS_CHART_SUCCESS, payload: data });
    return data;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
    };
    
    const errorMessage = errorResponse.response?.data?.message || "Failed to fetch orders chart";
    
    dispatch({ type: FETCH_ORDERS_CHART_FAILURE, payload: errorMessage });
    throw error;
  }
};

// Fetch top products
export const fetchTopProducts = () => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_TOP_PRODUCTS_REQUEST });
  try {
    const response = await axiosClient.get("/admin/dashboard/top-products");
    const products: TopProduct[] = response.data.data || [];
    
    dispatch({ type: FETCH_TOP_PRODUCTS_SUCCESS, payload: products });
    return products;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
    };
    
    const errorMessage = errorResponse.response?.data?.message || "Failed to fetch top products";
    
    dispatch({ type: FETCH_TOP_PRODUCTS_FAILURE, payload: errorMessage });
    throw error;
  }
};

// Fetch recent orders
export const fetchRecentOrders = () => async (dispatch: AppDispatch) => {
  dispatch({ type: FETCH_RECENT_ORDERS_REQUEST });
  try {
    const response = await axiosClient.get("/admin/dashboard/recent-orders");
    const orders: RecentOrder[] = response.data.data || [];
    
    dispatch({ type: FETCH_RECENT_ORDERS_SUCCESS, payload: orders });
    return orders;
  } catch (error: unknown) {
    const errorResponse = error as {
      response?: {
        data?: {
          message?: string;
          errors?: Record<string, string[]>;
        };
      };
    };
    
    const errorMessage = errorResponse.response?.data?.message || "Failed to fetch recent orders";
    
    dispatch({ type: FETCH_RECENT_ORDERS_FAILURE, payload: errorMessage });
    throw error;
  }
};

// Clear dashboard error
export const clearDashboardError = () => (dispatch: AppDispatch) => {
  dispatch({ type: CLEAR_DASHBOARD_ERROR });
};

