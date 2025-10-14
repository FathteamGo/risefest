'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  const isAdminRoute = pathname?.startsWith('/admin');
  
  return (
    <header className="bg-white bg-opacity-50 backdrop-filter shadow-sm border-b border-gray-200 z-40 relative top-0">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={isAdminRoute ? "/admin/events" : "/"} className="text-xl font-bold text-primary">
              {isAdminRoute ? "EventTicketing Admin" : "EventTicketing"}
            </Link>
          </div>
          
          <nav>
            <ul className="flex space-x-6">
              {isAdminRoute ? (
                <>
                  <li>
                    <Link 
                      href="/admin/events" 
                      className={`${
                        pathname === '/admin/events' 
                          ? 'text-primary font-medium' 
                          : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      Events
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('adminToken');
                        window.location.href = '/admin/login';
                      }}
                      className="text-gray-600 hover:text-primary"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      href="/" 
                      className={`${
                        pathname === '/' 
                          ? 'text-primary font-medium' 
                          : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/events" 
                      className={`${
                        pathname === '/events' 
                          ? 'text-primary font-medium' 
                          : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/admin/login" 
                      className="text-gray-600 hover:text-primary"
                    >
                      Admin
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}