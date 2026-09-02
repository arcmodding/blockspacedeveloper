import "./globals.css";

export const metadata = {
  title: "BlockSpace",
  description: "BlockSpace - discover, create, and share interactive worlds.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
