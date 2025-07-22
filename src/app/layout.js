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
      {/* --- THIS IS THE FIX --- */}
      {/* 
        Add the <head> tag here. Next.js will automatically combine 
        these tags with the ones generated from your `metadata` object.
      */}
      <head>
        {/* Preconnect to the most critical third-party domains to save time */}
        <link rel="preconnect" href="https://your-perfect-cv.firebaseapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://apis.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.paddle.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://sandbox-cdn.paddle.com" crossOrigin="anonymous" />
      </head>
      {/* --- END OF FIX --- */}
      
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}