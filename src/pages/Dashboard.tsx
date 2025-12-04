import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { Users, FileText, Clock, Download, MoreHorizontal, ArrowUpRight, Copy, Archive } from 'lucide-react';

const kpiData = [
  { label: 'Active Users', value: '2,847', change: '+12%', icon: Users, filter: 'product' },
  { label: 'Reports Run', value: '1,234', change: '+8%', icon: FileText, filter: 'all' },
  { label: 'Avg. Response Time', value: '1.2s', change: '-15%', icon: Clock, filter: 'financial' },
];

const getChartData = (range: string) => {
  const baseData = [
    { name: 'Mon', reports: 45 },
    { name: 'Tue', reports: 52 },
    { name: 'Wed', reports: 38 },
    { name: 'Thu', reports: 65 },
    { name: 'Fri', reports: 48 },
    { name: 'Sat', reports: 28 },
    { name: 'Sun', reports: 32 },
  ];
  
  if (range === '30d') {
    return baseData.map(d => ({ ...d, reports: Math.floor(d.reports * 1.5) }));
  }
  if (range === '90d') {
    return baseData.map(d => ({ ...d, reports: Math.floor(d.reports * 2.2) }));
  }
  return baseData;
};

const getBarData = (range: string) => {
  const baseData = [
    { team: 'Engineering', usage: 420 },
    { team: 'Product', usage: 380 },
    { team: 'Marketing', usage: 290 },
    { team: 'Sales', usage: 450 },
    { team: 'Design', usage: 180 },
  ];
  
  if (range === '30d') {
    return baseData.map(d => ({ ...d, usage: Math.floor(d.usage * 1.8) }));
  }
  if (range === '90d') {
    return baseData.map(d => ({ ...d, usage: Math.floor(d.usage * 3) }));
  }
  return baseData;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { reports, duplicateReport, archiveReport } = useAppData();
  const [dateRange, setDateRange] = useState('7d');
  const [lineChartData, setLineChartData] = useState(getChartData('7d'));
  const [barChartData, setBarChartData] = useState(getBarData('7d'));

  const handleDateChange = (value: string) => {
    setDateRange(value);
    // UX Issue: No loading state when filters change
    setLineChartData(getChartData(value));
    setBarChartData(getBarData(value));
  };

  const handleExport = (chartName: string) => {
    toast({
      title: 'Exported to CSV (mock)',
      description: `${chartName} data has been exported.`,
    });
  };

  const handleKpiClick = (filter: string) => {
    if (filter === 'all') {
      navigate('/reports');
    } else {
      navigate(`/reports?type=${filter}`);
    }
  };

  const recentReports = reports.slice(0, 5).map(r => ({
    id: r.id,
    title: r.title,
    author: r.author,
    lastRun: r.lastRun,
    status: r.status,
  }));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      active: 'default',
      running: 'secondary',
      failed: 'destructive',
      draft: 'outline',
      archived: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of your reporting activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={handleDateChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiData.map((kpi) => (
          <Card 
            key={kpi.label} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleKpiClick(kpi.filter)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-semibold mt-1">{kpi.value}</p>
                  <p className={`text-sm mt-1 ${kpi.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                    {kpi.change} from last period
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-secondary">
                  <kpi.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Reports per Day</CardTitle>
            {/* UX Issue: Export button only visible on hover */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => handleExport('Reports per Day')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export data</TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Usage by Team</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => handleExport('Usage by Team')}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export data</TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="team" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="usage" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Recent Reports</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="gap-1">
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-muted/50 group"
                  onClick={() => navigate(`/reports/${report.id}`)}
                >
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell className="text-muted-foreground">{report.author}</TableCell>
                  <TableCell className="text-muted-foreground">{report.lastRun}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateReport(report.id); }}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); archiveReport(report.id); }}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
