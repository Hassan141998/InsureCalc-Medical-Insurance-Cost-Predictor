import type { Metadata } from "next";
import { Cormorant_Garamond, Fira_Code, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InsureCalc — Medical Cost Predictor",
  description: "AI-powered medical insurance cost prediction with confidence intervals, cost breakdowns, and savings estimator.",
  keywords: ["insurance", "medical cost", "prediction", "BMI calculator", "health insurance"],
  openGraph: {
    title: "InsureCalc — Know Your Medical Costs",
    description: "Predict your annual medical insurance costs with ML-powered precision.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${firaCode.variable} ${inter.variable}`}>
      <body className="bg-[#001a1a] text-white antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#002a2a", color: "#fff", border: "1px solid #004d4d" },
          }}
        />
        {children}
      </body>
    </html>
  );
}
