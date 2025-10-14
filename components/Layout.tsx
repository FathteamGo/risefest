import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';

export default function Layout({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col app-bg">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <MobileNav />}
    </div>
  );
}