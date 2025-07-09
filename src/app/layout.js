import { Inter } from 'next/font/google';
import './globals.css';
import ClientLayout from './ClientLayout'; // Import our new client component

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Your Perfect CV',
  description: 'Create a professional CV with the power of AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}