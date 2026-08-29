declare module "react-simple-maps" {
  import type { ComponentType, ReactNode } from "react";

  export interface Geography {
    rsmKey: string;
    properties: Record<string, unknown>;
  }

  export const ComposableMap: ComponentType<{
    projection?: string;
    className?: string;
    children?: ReactNode;
  }>;

  export const ZoomableGroup: ComponentType<{ children?: ReactNode }>;

  export const Geographies: ComponentType<{
    geography: string;
    children: (props: { geographies: Geography[] }) => ReactNode;
  }>;

  export const Geography: ComponentType<{
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: Record<string, Record<string, string | number>>;
  }>;
}
