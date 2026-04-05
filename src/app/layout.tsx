import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});


export const metadata: Metadata = {
  title: "BillMetry — Get paid faster, from anywhere",
  description:
    "Create professional invoices, send Flutterwave payment links, and receive money directly to your Nigerian bank account. Built for African freelancers.",
  keywords: ["invoice", "freelancer", "Nigeria", "payment", "Flutterwave"],
  openGraph: {
    title: "BillMetry — Get paid faster, from anywhere",
    description: "Professional invoicing and payments for African freelancers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}