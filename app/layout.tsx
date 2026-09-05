import "./globals.css";

export const metadata = {
  title: "LabourChowk",
  description: "Kaam wale aur thekedar yahin milte hain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}