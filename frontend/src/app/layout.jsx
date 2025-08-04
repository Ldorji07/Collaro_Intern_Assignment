import ClientThemeProvider from '../components/ThemeProvider';

export const metadata = {
  title: "Collaro Dashboard",
  description: "Bespoke clothing company customer dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientThemeProvider>
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}