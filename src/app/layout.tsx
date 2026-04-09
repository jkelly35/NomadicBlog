import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Nomadic Performance | Performance Coaching Blog",
  description:
    "Evidence-based performance coaching for athletes who refuse to accept ordinary. Training science, nutrition, mental performance, and recovery strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0f1117] text-zinc-200">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
