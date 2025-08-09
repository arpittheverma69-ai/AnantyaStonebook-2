import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Instagram, Facebook, Twitter, Search, Users, Target, BarChart3 } from "lucide-react";
import { useState } from "react";

interface PlatformData {
  name: string;
  visits: number;
  growth: number;
  conversion: number;
  engagement: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const platformData: PlatformData[] = [
  {
    name: "Instagram",
    visits: 1240,
    growth: 12.5,
    conversion: 3.2,
    engagement: 8.7,
    icon: <Instagram className="h-4 w-4" />,
    color: "text-pink-600",
    bgColor: "bg-gradient-to-br from-pink-500/10 to-purple-500/10"
  },
  {
    name: "Facebook",
    visits: 890,
    growth: 8.3,
    conversion: 2.1,
    engagement: 6.2,
    icon: <Facebook className="h-4 w-4" />,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10"
  },
  {
    name: "X (Twitter)",
    visits: 567,
    growth: 15.2,
    conversion: 4.1,
    engagement: 9.3,
    icon: <Twitter className="h-4 w-4" />,
    color: "text-black dark:text-white",
    bgColor: "bg-gradient-to-br from-gray-500/10 to-black/10 dark:from-gray-400/10 dark:to-white/10"
  },
  {
    name: "Google",
    visits: 2156,
    growth: 5.8,
    conversion: 6.7,
    engagement: 4.1,
    icon: <Search className="h-4 w-4" />,
    color: "text-green-600",
    bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-500/10"
  }
];

const totalVisits = platformData.reduce((sum, platform) => sum + platform.visits, 0);
const avgGrowth = platformData.reduce((sum, platform) => sum + platform.growth, 0) / platformData.length;
const avgConversion = platformData.reduce((sum, platform) => sum + platform.conversion, 0) / platformData.length;
const bestPlatform = platformData.reduce((best, platform) => 
  platform.conversion > best.conversion ? platform : best
);

export default function SocialTraffic() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformData | null>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? 
      <TrendingUp className="h-3 w-3 text-green-600" /> : 
      <TrendingDown className="h-3 w-3 text-red-600" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <Card className="card-shadow-lg bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Social Media Traffic</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {formatNumber(totalVisits)} visits
            </Badge>
            <Badge variant="outline" className="text-xs">
              {avgGrowth.toFixed(1)}% growth
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Platform Cards */}
        <div className="grid grid-cols-2 gap-2">
          {platformData.map((platform) => (
            <Dialog key={platform.name}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className={`h-auto p-2 ${platform.bgColor} hover:${platform.bgColor} border border-border/50 hover:border-border transition-all duration-200`}
                  onClick={() => setSelectedPlatform(platform)}
                >
                  <div className="flex flex-col items-start w-full space-y-1.5">
                    <div className="flex items-center gap-1.5 w-full">
                      <div className={`p-1 rounded-md ${platform.bgColor}`}>
                        <div className={platform.color}>{platform.icon}</div>
                      </div>
                      <span className="text-xs font-medium truncate">{platform.name}</span>
                      <div className="ml-auto flex items-center gap-1">
                        {getGrowthIcon(platform.growth)}
                        <span className={`text-xs font-medium ${getGrowthColor(platform.growth)}`}>
                          {platform.growth > 0 ? '+' : ''}{platform.growth}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Visits</span>
                        <span className="font-medium">{formatNumber(platform.visits)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Conv.</span>
                        <span className="font-medium">{platform.conversion}%</span>
                      </div>
                      <Progress value={platform.conversion} className="h-1" />
                    </div>
                  </div>
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                      <div className={platform.color}>{platform.icon}</div>
                    </div>
                    {platform.name} Analytics
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{formatNumber(platform.visits)}</div>
                      <div className="text-xs text-muted-foreground">Total Visits</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{platform.conversion}%</div>
                      <div className="text-xs text-muted-foreground">Conversion Rate</div>
                    </div>
                  </div>

                  {/* Growth & Engagement */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Growth Rate</span>
                      </div>
                      <span className={`text-sm font-bold ${getGrowthColor(platform.growth)}`}>
                        {platform.growth > 0 ? '+' : ''}{platform.growth}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Engagement Rate</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{platform.engagement}%</span>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Performance Indicators</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Traffic Share</span>
                        <span className="font-medium">{((platform.visits / totalVisits) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(platform.visits / totalVisits) * 100} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Conversion Efficiency</span>
                        <span className="font-medium">{platform.conversion > avgConversion ? 'Above Avg' : 'Below Avg'}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Growth Trend</span>
                        <span className={`font-medium ${getGrowthColor(platform.growth)}`}>
                          {platform.growth > avgGrowth ? 'Outperforming' : 'Underperforming'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendations</h4>
                    <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                      {platform.growth < avgGrowth && (
                        <li>• Increase content frequency to boost growth</li>
                      )}
                      {platform.conversion < avgConversion && (
                        <li>• Optimize landing pages for better conversion</li>
                      )}
                      {platform.engagement < 8 && (
                        <li>• Engage more with audience through comments</li>
                      )}
                      <li>• Monitor competitor strategies on this platform</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Traffic</p>
            <p className="text-sm font-semibold">{formatNumber(totalVisits)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Avg Conversion</p>
            <p className="text-sm font-semibold">{avgConversion.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Best Platform</p>
            <p className="text-sm font-semibold">{bestPlatform.name}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Reports
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            <Target className="h-3 w-3 mr-1" />
            Goals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
