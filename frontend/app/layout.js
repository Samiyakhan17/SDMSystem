import './globals.css';
import { AuthProvider } from '../lib/AuthContext';

export const metadata = {
  title: 'SDMS - Secure Document Management System',
  description: 'Upload, organize, share, and audit your documents securely.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}