import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface FilterComboboxProps {
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  placeholder: string;
  searchPlaceholder: string;
  allLabel: string;
  total?: number;
  className?: string;
  width?: string;
}

const FilterCombobox = ({
  items,
  selectedValue,
  onSelect,
  loading,
  hasMore,
  onLoadMore,
  placeholder,
  searchPlaceholder,
  allLabel,
  total,
  className = "w-[180px]",
  width = "w-[180px]",
}: FilterComboboxProps) => {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(className, "justify-between")}
        >
          {selectedValue === "all"
            ? allLabel
            : items.find((name) => name === selectedValue) || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(width, "p-0")} align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList
            className="max-h-[300px]"
            onScroll={(e) => {
              const target = e.currentTarget;
              // Load more when scroll near bottom (80% scrolled)
              if (
                target.scrollTop + target.clientHeight >= target.scrollHeight * 0.8 &&
                hasMore &&
                !loading
              ) {
                onLoadMore();
              }
            }}
          >
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                t("common.noResults") || "Không tìm thấy"
              )}
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onSelect("all");
                }}
                className="flex items-center justify-start"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 flex-shrink-0",
                    selectedValue === "all" ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="text-left">{allLabel}</span>
              </CommandItem>
              {items.map((itemName) => (
                <CommandItem
                  key={itemName}
                  value={itemName}
                  onSelect={() => {
                    onSelect(itemName);
                  }}
                  className="flex items-center justify-start"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 flex-shrink-0",
                      selectedValue === itemName ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-left">{itemName}</span>
                </CommandItem>
              ))}
              {loading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!hasMore && items.length > 0 && total && (
                <div className="text-xs text-muted-foreground text-center py-2 px-2">
                  {t("common.showingAll") || `Hiển thị tất cả ${total} mục`}
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FilterCombobox;

