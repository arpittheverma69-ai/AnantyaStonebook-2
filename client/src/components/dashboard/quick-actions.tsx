import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  UserPlus, 
  ShoppingCart, 
  BarChart3, 
  RefreshCw, 
  Download 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Stone",
      icon: Plus,
      href: "/inventory",
      description: "Add new gemstone to inventory",
      color: "from-emerald-500 to-green-500"
    },
    {
      title: "Add Client",
      icon: UserPlus,
      href: "/clients",
      description: "Register new client",
      color: "from-blue-500 to-sky-500"
    },
    {
      title: "Record Sale",
      icon: ShoppingCart,
      href: "/sales",
      description: "Create new sale transaction",
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Generate Report",
      icon: BarChart3,
      href: "/finance",
      description: "View business analytics",
      color: "from-orange-500 to-amber-500"
    },
    {
      title: "Sync Data",
      icon: RefreshCw,
      href: "#",
      description: "Synchronize offline data",
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: "Export",
      icon: Download,
      href: "#",
      description: "Export data to CSV",
      color: "from-pink-500 to-rose-500"
    },
  ];

  return (
    <Card className="card-shadow-lg bg-gradient-to-br from-background to-muted/20 border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.href} className="block">
              <Button
                variant="outline"
                className={`w-full flex flex-col items-center justify-center space-y-3 p-4 h-auto min-h-[120px] bg-background/50 backdrop-blur-sm border-border hover:bg-gradient-to-br hover:${action.color} hover:text-white hover:border-transparent transition-all duration-300 group rounded-[var(--radius)]`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 flex-shrink-0`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-center leading-tight px-2">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
