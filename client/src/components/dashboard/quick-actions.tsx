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
import { Link } from "wouter";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Stone",
      icon: Plus,
      href: "/inventory",
      description: "Add new gemstone to inventory"
    },
    {
      title: "Add Client",
      icon: UserPlus,
      href: "/clients",
      description: "Register new client"
    },
    {
      title: "Record Sale",
      icon: ShoppingCart,
      href: "/sales",
      description: "Create new sale transaction"
    },
    {
      title: "Generate Report",
      icon: BarChart3,
      href: "/finance",
      description: "View business analytics"
    },
    {
      title: "Sync Data",
      icon: RefreshCw,
      href: "#",
      description: "Synchronize offline data"
    },
    {
      title: "Export",
      icon: Download,
      href: "#",
      description: "Export data to CSV"
    },
  ];

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="flex flex-col items-center space-y-2 p-4 h-auto hover:bg-primary hover:text-white hover:border-primary transition-all group"
              >
                <action.icon className="h-6 w-6 group-hover:text-white text-primary" />
                <span className="text-sm font-medium">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
