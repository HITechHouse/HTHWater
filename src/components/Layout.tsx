import  { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Map, BarChart2, Info } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Map className="h-8 w-8 text-blue-600" />
                <span className="mr-2 text-xl font-bold text-blue-800">نظام المعلومات الجغرافية السوري</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:space-x-8 md:space-x-reverse">
              <NavLink 
                to="/" 
                className={({ isActive }) =>
                  `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                <Map size={18} />
                <span>الخريطة</span>
              </NavLink>
              
              <NavLink 
                to="/water-analysis" 
                className={({ isActive }) =>
                  `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                <BarChart2 size={18} />
                <span>تحليل المسطحات المائية</span>
              </NavLink>
              
              <NavLink 
                to="/about" 
                className={({ isActive }) =>
                  `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                <Info size={18} />
                <span>حول النظام</span>
              </NavLink>
            </nav>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <NavLink 
                to="/" 
                className={({ isActive }) =>
                  `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Map size={18} />
                <span>الخريطة</span>
              </NavLink>
              
              <NavLink 
                to="/water-analysis" 
                className={({ isActive }) =>
                  `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart2 size={18} />
                <span>تحليل المسطحات المائية</span>
              </NavLink>
              
              <NavLink 
                to="/about" 
                className={({ isActive }) =>
                  `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Info size={18} />
                <span>حول النظام</span>
              </NavLink>
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-1">{children}</main>
      
      {/* Footer */}
      <footer className="bg-white shadow-inner py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} نظام المعلومات الجغرافية السوري. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
 