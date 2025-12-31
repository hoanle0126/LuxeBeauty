import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { fetchProductsWithFilters, fetchCategories, fetchBrands, Product, Category, Brand } from '@/lib/api';
import useDebounce from '@/hooks/useDebounce';

const SearchCommand = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Debounce search query to avoid too many API calls
  const debouncedSearch = useDebounce(search, 300);

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Load initial data (categories and brands)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingInitial(true);
        setError(null);
        
        // Load categories and brands in parallel
        const [categoriesData, brandsData] = await Promise.all([
          fetchCategories(),
          fetchBrands()
        ]);
        
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Không thể tải dữ liệu tìm kiếm. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingInitial(false);
      }
    };

    if (open) {
      loadInitialData();
    }
  }, [open]);

  // Search products when debounced search changes
  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearch.trim()) {
        setProducts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchProductsWithFilters({
          search: debouncedSearch.trim(),
          per_page: 5, // Limit to 5 products for command palette
        });

        setProducts(response.products);
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Có lỗi xảy ra khi tìm kiếm sản phẩm');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedSearch]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectProduct = (productSlug: string) => {
    setOpen(false);
    setSearch('');
    navigate(`/san-pham/${productSlug}`);
  };

  const handleSelectCategory = (categorySlug: string) => {
    setOpen(false);
    setSearch('');
    navigate(`/products?category=${encodeURIComponent(categorySlug)}`);
  };

  const handleSelectBrand = (brandSlug: string) => {
    setOpen(false);
    setSearch('');
    navigate(`/products?brand=${encodeURIComponent(brandSlug)}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when closing
      setSearch('');
      setProducts([]);
      setError(null);
    }
  };

  const renderContent = () => {
    if (isLoadingInitial) {
      return (
        <div className="py-8 text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground/50 mx-auto mb-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      );
    }

    if (error) {
      return (
        <CommandEmpty>
          <div className="py-4 text-center">
            <p className="text-destructive text-sm mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">Vui lòng thử lại sau</p>
          </div>
        </CommandEmpty>
      );
    }

    if (isLoading && search.trim()) {
      return (
        <div className="py-8 text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground/50 mx-auto mb-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Đang tìm kiếm...</p>
        </div>
      );
    }

    const hasResults = products.length > 0 || 
                      filteredCategories.length > 0 || 
                      filteredBrands.length > 0;

    if (!hasResults && search.trim()) {
      return <CommandEmpty>Không tìm thấy kết quả phù hợp.</CommandEmpty>;
    }

    return (
      <>
        {products.length > 0 && (
          <CommandGroup heading="Sản phẩm">
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.name}
                onSelect={() => handleSelectProduct(product.slug)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {product.brand || product.category || 'Không có thông tin'}
                    </p>
                  </div>
                  <span className="text-sm text-accent font-medium flex-shrink-0 ml-2">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredCategories.length > 0 && search && (
          <CommandGroup heading="Danh mục">
            {filteredCategories.slice(0, 3).map((category) => (
              <CommandItem
                key={category.id}
                value={category.name}
                onSelect={() => handleSelectCategory(category.slug)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{category.name}</span>
                  {category.productCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({category.productCount})
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredBrands.length > 0 && search && (
          <CommandGroup heading="Thương hiệu">
            {filteredBrands.slice(0, 3).map((brand) => (
              <CommandItem
                key={brand.id}
                value={brand.name}
                onSelect={() => handleSelectBrand(brand.slug)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{brand.name}</span>
                  {brand.productCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({brand.productCount})
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!search && (
          <CommandGroup heading="Gợi ý tìm kiếm">
            <CommandItem onSelect={() => setSearch('serum')} className="cursor-pointer">
              🔥 Serum dưỡng da
            </CommandItem>
            <CommandItem onSelect={() => setSearch('chống nắng')} className="cursor-pointer">
              ☀️ Kem chống nắng
            </CommandItem>
            <CommandItem onSelect={() => setSearch('son')} className="cursor-pointer">
              💄 Son môi
            </CommandItem>
          </CommandGroup>
        )}
      </>
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="relative"
      >
        <Search className="w-5 h-5" />
        <span className="sr-only">Tìm kiếm</span>
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoadingInitial}
          />
          {search && !isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
          )}
        </div>
        <CommandList>
          {renderContent()}
        </CommandList>

        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <span className="text-xs">⌘</span>K
          </kbd>
          <span className="ml-2">để mở tìm kiếm nhanh</span>
        </div>
      </CommandDialog>
    </>
  );
};

export default SearchCommand;