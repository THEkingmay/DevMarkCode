import type { Metadata } from 'next';
import './globals.css';
import SessionProviderPage from './SessionProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS

export const metadata: Metadata = {
  title: 'DevMarkCode',
  description: 'For Learning how to code.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProviderPage>
          {children}

          <ToastContainer
            position="top-right" // ตำแหน่ง
            autoClose={3000} // ปิดอัตโนมัติใน 3 วินาที
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light" // หรือ "dark" หรือ "colored"
          />
        </SessionProviderPage>
      </body>
    </html>
  );
}
