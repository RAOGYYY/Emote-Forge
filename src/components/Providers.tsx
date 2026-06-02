"use client";

import { ProProvider } from "@/lib/pro";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ProProvider>{children}</ProProvider>;
}
