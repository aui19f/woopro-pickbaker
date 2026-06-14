"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface LoadingContextType {
  setLoading: (v: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({ setLoading: () => {} });

export function usePageLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  // Safety: auto-clear if navigation redirects back to same path (spinner would be stuck)
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <LoadingContext.Provider value={{ setLoading }}>
      {children}
      {loading && (
        <div className="fixed inset-0 bg-black/20 z-200 flex items-center justify-center pointer-events-auto">
          <div className="w-12 h-12 rounded-full border-[3px] border-stone-200 border-t-point animate-spin" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}
