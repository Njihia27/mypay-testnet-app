export const metadata = {
  title: "MyPay - Pi Payments",
  description: "Send & Receive Pi easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}