import "./globals.css";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "LabourChowk",
  description: "Ghar ka kaam hai? Aaj available labour dhundo aur contact karo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className={outfit.className}>
      <body>{children}</body>
    </html>
  );
}
