import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LoadingProvider } from "@/app/_components/LoadingOverlay";
import SplashScreen from "@/app/_components/SplashScreen";

export const metadata: Metadata = {
  title: "픽베이커",
  description: "베이커리 커뮤니티",
  icons: {
    icon: "/icons/pickbaker.png",
    apple: "/icons/pickbaker.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "픽베이커",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <SplashScreen />
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
