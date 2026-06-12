import type { ReactNode } from "react";
import QueryProvider from "@/components/platform/QueryProvider";

export default function PlatformLayout({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
