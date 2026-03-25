import "./globals.css";

import type { Metadata } from "next";

import { Providers } from "@/app/providers";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "CargoShield foundation shell",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
