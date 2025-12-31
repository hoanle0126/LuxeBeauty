import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartAPI,
  type CartItem as APICartItem,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export interface CartItem {
  id: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number
  ) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Convert API cart item to local cart item format
  const convertToLocalCartItem = (apiItem: APICartItem): CartItem => {
    return {
      id: apiItem.id,
      slug: apiItem.product.slug,
      name: apiItem.product.name,
      image:
        apiItem.product.image ||
        (apiItem.product.images && apiItem.product.images[0]) ||
        "",
      price: apiItem.product.price,
      quantity: apiItem.quantity,
    };
  };

  // Load cart from backend
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      // Nếu chưa đăng nhập, giữ local state (có thể load từ localStorage)
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        try {
          setItems(JSON.parse(localCart));
        } catch (error) {
          console.error("Error parsing local cart:", error);
        }
      }
      return;
    }

    setIsLoading(true);
    try {
      const apiItems = await fetchCart();
      const localItems = apiItems.map(convertToLocalCartItem);
      setItems(localItems);
    } catch (error: any) {
      console.error("Error loading cart:", error);
      // Nếu lỗi 401, có thể user chưa đăng nhập thực sự
      if (error?.response?.status === 401) {
        // Giữ local state
        const localCart = localStorage.getItem("cart");
        if (localCart) {
          try {
            setItems(JSON.parse(localCart));
          } catch (e) {
            console.error("Error parsing local cart:", e);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart when component mounts or authentication changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Save to localStorage when items change (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items));
    } else if (!isAuthenticated && items.length === 0) {
      localStorage.removeItem("cart");
    }
  }, [items, isAuthenticated]);

  const addItem = async (
    item: Omit<CartItem, "quantity">,
    quantity: number = 1
  ) => {
    if (!isAuthenticated) {
      // Local state cho user chưa đăng nhập
      setItems((prev) => {
        const existingItem = prev.find((i) => i.id === item.id);
        if (existingItem) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      toast({
        title: t("productCard.addedToCart"),
        description: item.name,
      });
      return;
    }

    // Sync với backend - KHÔNG set isLoading
    try {
      await addToCart(item.id, quantity);
      // Cập nhật local state ngay lập tức
      setItems((prev) => {
        const existingItem = prev.find((i) => i.id === item.id);
        if (existingItem) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      toast({
        title: t("productCard.addedToCart"),
        description: item.name,
      });
      // Đồng bộ với backend trong background
      loadCart().catch((error) => {
        console.error("Error syncing cart after add:", error);
      });
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      const errorMessage =
        error?.response?.data?.message || t("common.error") || "Có lỗi xảy ra";
      toast({
        title: t("common.error") || "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      // Rollback local state nếu có lỗi
      loadCart().catch((e) => console.error("Error reloading cart:", e));
    }
  };

  const removeItem = async (id: number) => {
    if (!isAuthenticated) {
      // Local state
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    // Sync với backend - KHÔNG set isLoading
    try {
      await removeCartItem(id);
      // Cập nhật local state ngay lập tức
      setItems((prev) => prev.filter((item) => item.id !== id));
      // Đồng bộ với backend trong background
      loadCart().catch((error) => {
        console.error("Error syncing cart after remove:", error);
      });
    } catch (error: any) {
      console.error("Error removing cart item:", error);
      const errorMessage =
        error?.response?.data?.message || t("common.error") || "Có lỗi xảy ra";
      toast({
        title: t("common.error") || "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      // Rollback local state nếu có lỗi
      loadCart().catch((e) => console.error("Error reloading cart:", e));
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    if (!isAuthenticated) {
      // Local state
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
      return;
    }

    // Sync với backend - KHÔNG set isLoading
    try {
      await updateCartItem(id, quantity);
      // Cập nhật local state ngay lập tức để UI phản hồi nhanh
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
      // Đồng bộ với backend trong background
      loadCart().catch((error) => {
        console.error("Error syncing cart after update:", error);
      });
    } catch (error: any) {
      console.error("Error updating cart item:", error);
      const errorMessage =
        error?.response?.data?.message || t("common.error") || "Có lỗi xảy ra";
      toast({
        title: t("common.error") || "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      // Rollback local state nếu có lỗi
      loadCart().catch((e) => console.error("Error reloading cart:", e));
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      // Local state
      setItems([]);
      return;
    }

    // Sync với backend - KHÔNG set isLoading
    try {
      await clearCartAPI();
      // Cập nhật local state ngay lập tức
      setItems([]);
      // Đồng bộ với backend trong background (thực ra không cần vì đã clear)
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      const errorMessage =
        error?.response?.data?.message || t("common.error") || "Có lỗi xảy ra";
      toast({
        title: t("common.error") || "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      // Rollback local state nếu có lỗi
      loadCart().catch((e) => console.error("Error reloading cart:", e));
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
