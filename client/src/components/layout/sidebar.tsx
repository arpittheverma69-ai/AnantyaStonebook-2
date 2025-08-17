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
  Sparkles,
  Calculator,
  Bell,
  BarChart,
  Home,
  FileText,
  Shield,
  Search,
  Target,
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
  icon: any;
  defaultOpen?: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
}

const navigationGroups: NavigationGroup[] = [
  {
    title: "Overview",
    icon: Home,
    defaultOpen: true,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
      { name: 'Profile', href: '/profile', icon: Users },
    ]
  },
  {
    title: "Core Business",
    icon: Gem,
    defaultOpen: true,
    items: [
      { name: 'Inventory', href: '/inventory', icon: Package },
      { name: 'Sales', href: '/sales', icon: ShoppingCart },
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Suppliers', href: '/suppliers', icon: Truck },
    ]
  },
  {
    title: "Services & Consultations",
    icon: MessageCircle,
    defaultOpen: false,
    items: [
      { name: 'Consultations', href: '/consultations', icon: MessageCircle },
      { name: 'Client Follow-up', href: '/client-follow-up', icon: Bell },
      { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    ]
  },
  {
    title: "Quality & Compliance",
    icon: Shield,
    defaultOpen: false,
    items: [
      { name: 'Certifications', href: '/certifications', icon: Tag },
      { name: 'Docs & Compliance', href: '/docs-compliance', icon: FileText },
    ]
  },
  {
    title: "AI & Intelligence",
    icon: Bot,
    defaultOpen: false,
    items: [
      { name: 'AI Analysis', href: '/ai-analysis', icon: Bot },
      { name: 'Astrological AI', href: '/astrological-ai', icon: Sparkles },
      { name: 'Inventory Intelligence', href: '/inventory-intelligence', icon: BarChart },
    ]
  },
  {
    title: "Tools & Analytics",
    icon: Target,
    defaultOpen: false,
    items: [
      { name: 'Valuation Calculator', href: '/valuation-calculator', icon: Calculator },
      { name: 'Quality Comparison', href: '/quality-comparison', icon: Calculator },
      { name: 'Market Price Tracker', href: '/market-price-tracker', icon: TrendingUp },
      { name: 'Bulk Purchase Optimizer', href: '/bulk-optimizer', icon: TrendingUp },
      { name: 'Scan & Find', href: '/scan-find', icon: Search },
    ]
  },
  {
    title: "Finance & Reporting",
    icon: BarChart,
    defaultOpen: false,
    items: [
      { name: 'Finance', href: '/finance', icon: TrendingUp },
      { name: 'Reporting & Analytics', href: '/reporting-analytics', icon: BarChart3 },
    ]
  },
];

export default function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(navigationGroups.filter(g => g.defaultOpen).map(g => g.title))
  );

  const toggleGroup = (groupTitle: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupTitle)) {
      newOpenGroups.delete(groupTitle);
    } else {
      newOpenGroups.add(groupTitle);
    }
    setOpenGroups(newOpenGroups);
  };

  const isActive = (href: string) => {
    return location.pathname === href || (location.pathname === '/' && href === '/dashboard');
  };

  return (
    <aside 
      className={cn(
        "sidebar-modern sidebar-transition w-64 bg-background/80 backdrop-blur-xl border-r border-border flex flex-col z-50 h-screen overflow-hidden",
        isMobile ? "fixed inset-y-0 left-0" : "relative",
        isMobile && !isOpen && "-translate-x-full"
      )}
    >
      {/* Logo Section */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Gem className="text-white text-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent leading-tight truncate">
              Anantya
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Premium Gemstones</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 min-h-0 overflow-y-auto p-2 md:p-3 space-y-2">
        {navigationGroups.map((group, index) => {
          const isGroupOpen = openGroups.has(group.title);
          const hasActiveItem = group.items.some(item => isActive(item.href));
          
          return (
            <div key={group.title} className="space-y-1">
              {index > 0 && (
                <div className="h-px bg-border/30 mx-2 my-1" />
              )}
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 font-medium group min-h-[40px]",
                  hasActiveItem
                    ? "text-primary bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <group.icon className={cn(
                    "w-4 h-4 transition-all duration-300 flex-shrink-0",
                    hasActiveItem ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="text-sm font-semibold">{group.title}</span>
                </div>
                {isGroupOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all duration-300" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all duration-300" />
                )}
              </button>
              
              {/* Group Items */}
              <div 
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isGroupOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="ml-4 space-y-1 border-l border-border/30 pl-3 pt-1">
                  {group.items.map((item) => {
                    const isItemActive = isActive(item.href);
                    return (
                      <Link 
                        key={item.name} 
                        to={item.href}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 font-medium group min-h-[36px]",
                          isItemActive
                            ? "text-primary bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 shadow-md"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-sm"
                        )}
                        onClick={isMobile ? onToggle : undefined}
                      >
                        <div className="flex items-center space-x-2.5">
                          <item.icon className={cn(
                            "w-4 h-4 transition-all duration-300 flex-shrink-0",
                            isItemActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )} />
                          <span className="text-sm truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center space-x-2.5 px-2 py-2 bg-muted/30 rounded-lg">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-white font-semibold text-xs">
              {(user?.email || user?.user_metadata?.full_name || 'U')
                .toString()
                .trim()
                .slice(0,1)
                .toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground leading-tight truncate">
              {user?.user_metadata?.full_name || user?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.user_metadata?.role || 'Member'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
