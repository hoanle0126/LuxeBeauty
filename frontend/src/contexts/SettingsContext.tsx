import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchPublicSettings } from "@/lib/api";
import { GeneralSettings, ShippingSettings, AppearanceSettings, HomepageSettings } from "@/lib/api";

interface SettingsContextType {
  general: GeneralSettings | null;
  shipping: ShippingSettings | null;
  appearance: AppearanceSettings | null;
  homepage: HomepageSettings | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [general, setGeneral] = useState<GeneralSettings | null>(null);
  const [shipping, setShipping] = useState<ShippingSettings | null>(null);
  const [appearance, setAppearance] = useState<AppearanceSettings | null>(null);
  const [homepage, setHomepage] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all settings groups in parallel
      const [generalData, shippingData, appearanceData, homepageData] = await Promise.all([
        fetchPublicSettings("general").catch(() => ({})),
        fetchPublicSettings("shipping").catch(() => ({})),
        fetchPublicSettings("appearance").catch(() => ({})),
        fetchPublicSettings("homepage").catch(() => ({})),
      ]);

      // Set settings, fallback to empty object if API returns empty
      setGeneral(
        generalData && Object.keys(generalData).length > 0
          ? (generalData as GeneralSettings)
          : null
      );
      setShipping(
        shippingData && Object.keys(shippingData).length > 0
          ? (shippingData as ShippingSettings)
          : null
      );
      setAppearance(
        appearanceData && Object.keys(appearanceData).length > 0
          ? (appearanceData as AppearanceSettings)
          : null
      );
      setHomepage(
        homepageData && Object.keys(homepageData).length > 0
          ? (homepageData as HomepageSettings)
          : null
      );
    } catch (err) {
      console.error("Error loading settings:", err);
      setError(err instanceof Error ? err : new Error("Failed to load settings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refresh = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        general,
        shipping,
        appearance,
        homepage,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

