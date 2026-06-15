import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
      <Navbar />
      <main className="flex-1 w-full pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
