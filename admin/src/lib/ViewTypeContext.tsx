import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type ViewType = "resort" | "tent" | "tourist-spot";

interface ViewTypeContextType {
  viewType: ViewType;
  setViewType: (type: ViewType) => void;
}

const ViewTypeContext = createContext<ViewTypeContextType | undefined>(undefined);

export const ViewTypeProvider = ({ children }: { children: ReactNode }) => {
  const [viewType, setViewType] = useState<ViewType>("resort");

  return (
    <ViewTypeContext.Provider value={{ viewType, setViewType }}>
      {children}
    </ViewTypeContext.Provider>
  );
};

export const useViewType = () => {
  const context = useContext(ViewTypeContext);
  if (!context) {
    throw new Error("useViewType must be used within ViewTypeProvider");
  }
  return context;
};
