import { Link, useLocation } from "react-router-dom";
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
  Gem,
  Bot,
  Sparkles
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
  { name: 'AI Analysis', href: '/ai-analysis', icon: Bot },
  { name: 'Astrological AI', href: '/astrological-ai', icon: Sparkles },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
];

export default function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "sidebar-modern sidebar-transition w-64 bg-background/80 backdrop-blur-xl border-r border-border flex flex-col z-50",
        isMobile ? "fixed inset-y-0 left-0" : "relative",
        isMobile && !isOpen && "-translate-x-full"
      )}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Gem className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Anantya
            </h1>
            <p className="text-sm text-muted-foreground">Premium Gemstones</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || (location.pathname === '/' && item.href === '/dashboard');
          return (
            <Link 
              key={item.name} 
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium group",
                isActive
                  ? "text-primary bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onClick={isMobile ? onToggle : undefined}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-4 py-3 bg-muted/30 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white font-semibold text-sm">RK</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Rajesh Kumar</p>
            <p className="text-xs text-muted-foreground">Sales Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
