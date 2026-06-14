import type { Metadata } from "next";
import "./globals.css";
import { LoadingProvider } from "@/app/_components/LoadingOverlay";

export const metadata: Metadata = {
  title: "픽베이커",
  description: "베이커리 커뮤니티",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
