import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { thunk, ThunkDispatch } from "redux-thunk";
import { authReducer } from "./auth/reducer";
import { categoriesReducer } from "./categories/reducer";
import { brandsReducer } from "./brands/reducer";
import { productsReducer } from "./products/reducer";
import { customersReducer } from "./customers/reducer";
import { dashboardReducer } from "./dashboard/reducer";

const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer,
  brands: brandsReducer,
  products: productsReducer,
  customers: customersReducer,
  dashboard: dashboardReducer,
});

export const store = legacy_createStore(rootReducer, applyMiddleware(thunk));

// Type for dispatch with thunk support
export type AppDispatch = ThunkDispatch<ReturnType<typeof rootReducer>, unknown, any>;
export type RootState = ReturnType<typeof rootReducer>;
