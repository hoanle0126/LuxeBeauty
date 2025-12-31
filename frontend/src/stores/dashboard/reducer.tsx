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
import {
  DashboardStats,
  RevenueChartData,
  OrdersChartData,
  TopProduct,
  RecentOrder,
} from "./action";

interface DashboardState {
  stats: DashboardStats | null;
  revenueChart: RevenueChartData | null;
  ordersChart: OrdersChartData | null;
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  loading: boolean;
  error: string | Record<string, string[]> | null;
}

const initialState: DashboardState = {
  stats: null,
  revenueChart: null,
  ordersChart: null,
  topProducts: [],
  recentOrders: [],
  loading: false,
  error: null,
};

export const dashboardReducer = (state = initialState, action: any): DashboardState => {
  switch (action.type) {
    case FETCH_DASHBOARD_STATS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_DASHBOARD_STATS_SUCCESS:
      return {
        ...state,
        loading: false,
        stats: action.payload,
        error: null,
      };
    case FETCH_DASHBOARD_STATS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload || "Failed to fetch dashboard stats",
      };

    case FETCH_REVENUE_CHART_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_REVENUE_CHART_SUCCESS:
      return {
        ...state,
        loading: false,
        revenueChart: action.payload,
        error: null,
      };
    case FETCH_REVENUE_CHART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload || "Failed to fetch revenue chart",
      };

    case FETCH_ORDERS_CHART_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_ORDERS_CHART_SUCCESS:
      return {
        ...state,
        loading: false,
        ordersChart: action.payload,
        error: null,
      };
    case FETCH_ORDERS_CHART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload || "Failed to fetch orders chart",
      };

    case FETCH_TOP_PRODUCTS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_TOP_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        topProducts: action.payload,
        error: null,
      };
    case FETCH_TOP_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload || "Failed to fetch top products",
      };

    case FETCH_RECENT_ORDERS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_RECENT_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        recentOrders: action.payload,
        error: null,
      };
    case FETCH_RECENT_ORDERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload || "Failed to fetch recent orders",
      };

    case CLEAR_DASHBOARD_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

