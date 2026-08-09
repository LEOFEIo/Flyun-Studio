import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./linear-layout.css";
import "./dinq-theme.css";
import "./cohere-theme.css";
import { ThemeToggle } from "./components/theme-toggle";

const deploymentUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(deploymentUrl),
  title: {
    default: "飞云 FEIYUN — AI 人才智能系统",
    template: "%s · 飞云 FEIYUN",
  },
  description:
    "从真实工作、公开证据与长期轨迹中理解稀缺 AI 人才，让每一个判断都能回到来源。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "飞云 FEIYUN — AI 人才智能系统",
    description: "从真实工作、公开证据与长期轨迹中理解稀缺 AI 人才。",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "飞云 AI 人才智能产品预览",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "飞云 FEIYUN — AI 人才智能系统",
    description: "从真实工作，看见真正的人才。",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#071829" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-theme="light" data-lang="zh" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('feiyun-theme');var t=s==='light'||s==='dark'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');var l=localStorage.getItem('feiyun-language');document.documentElement.dataset.theme=t;document.documentElement.dataset.lang=l==='en'?'en':'zh';document.documentElement.lang=l==='en'?'en':'zh-CN';document.documentElement.style.colorScheme=t}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
