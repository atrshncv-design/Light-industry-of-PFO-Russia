import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ситуация в лёгкой промышленности ПФО",
  description: "Интерактивная карта ситуации в лёгкой промышленности Приволжского федерального округа",
  keywords: ["ПФО", "лёгкая промышленность", "карта", "Приволжский федеральный округ"],
  icons: {
    icon: "/pfo-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </body>
    </html>
  );
}
