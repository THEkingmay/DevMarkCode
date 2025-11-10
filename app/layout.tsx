import type { Metadata } from "next";
import "./globals.css";
import SessionProviderPage from "./SessionProvider";

export const metadata: Metadata = {
  title: "DevMarkCode",
  description: "For Learning how to code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <SessionProviderPage>
          {children}
        </SessionProviderPage>
      </body>
    </html>
  );
}
