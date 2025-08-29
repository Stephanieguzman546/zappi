import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Zappi — напиши в WhatsApp без сохранения контакта",
  description: "Zappi — сервис-мост между номером телефона и WhatsApp. Введи номер, нажми кнопку и сразу открой чат без лишних действий. Быстро, удобно и бесплатно.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Bootstrap CSS */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
          crossOrigin="anonymous" 
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.min.css"
          crossOrigin="anonymous"
        />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"/>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
