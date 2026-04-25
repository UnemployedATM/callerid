import { Bebas_Neue } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

export const metadata = {
  title: "Bidaman",
  description: "Crafted answers for your home.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={bebasNeue.variable}>
      <body>{children}</body>
    </html>
  );
}
