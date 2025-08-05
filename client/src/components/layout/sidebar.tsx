import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Package, 
  Users, 
  Truck, 
  ShoppingCart, 
  Tag, 
  MessageCircle, 
  TrendingUp, 
  CheckSquare,
  Gem
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Suppliers', href: '/suppliers', icon: Truck },
  { name: 'Sales', href: '/sales', icon: ShoppingCart },
  { name: 'Certifications', href: '/certifications', icon: Tag },
  { name: 'Consultations', href: '/consultations', icon: MessageCircle },
  { name: 'Finance', href: '/finance', icon: TrendingUp },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
];

export default function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "sidebar-transition w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col z-50",
        isMobile ? "fixed inset-y-0 left-0" : "relative",
        isMobile && !isOpen && "-translate-x-full"
      )}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
            <Gem className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Anantya</h1>
            <p className="text-sm text-gray-500">Premium Gemstones</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href || (location === '/' && item.href === '/dashboard');
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium",
                  isActive
                    ? "text-primary bg-blue-50 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={isMobile ? onToggle : undefined}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Rajesh Kumar</p>
            <p className="text-xs text-gray-500">Sales Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
