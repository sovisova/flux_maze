import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { format } from 'date-fns';
import { CalendarIcon, Database, ChevronRight, Table2, BarChart3, Search, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const sampleData = [
  { id: 1, user_id: 'usr_001', event: 'page_view', timestamp: '2024-12-03 10:30:00', value: 1 },
  { id: 2, user_id: 'usr_002', event: 'signup', timestamp: '2024-12-03 10:31:00', value: 1 },
  { id: 3, user_id: 'usr_001', event: 'purchase', timestamp: '2024-12-03 10:35:00', value: 89 },
  { id: 4, user_id: 'usr_003', event: 'page_view', timestamp: '2024-12-03 10:40:00', value: 1 },
  { id: 5, user_id: 'usr_002', event: 'page_view', timestamp: '2024-12-03 10:45:00', value: 1 },
];

const sourceIcons = { PostgreSQL: Database, BigQuery: BarChart3, Snowflake: Table2 };

export default function DataExplorer() {
  const { dataSources, selectedDataSource, setSelectedDataSource } = useAppData();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [selectedRow, setSelectedRow] = useState<typeof sampleData[0] | null>(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(sampleData);

  const handleRunQuery = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const filtered = sampleData.filter(row => eventFilter === 'all' || row.event === eventFilter);
    setData(filtered);
    setIsLoading(false);
    toast({ title: 'Query executed', description: `Found ${filtered.length} results.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-semibold">Data Explorer</h1><p className="text-muted-foreground text-sm">Query and explore your data sources</p></div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card className="h-fit">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Data Sources</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {dataSources.map((source) => {
                const Icon = sourceIcons[source.type as keyof typeof sourceIcons] || Database;
                return (
                  <button key={source.id} onClick={() => setSelectedDataSource(source.id)}
                    className={cn('w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                      selectedDataSource === source.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted')}>
                    <Icon className="h-4 w-4" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{source.name}</p><p className="text-xs text-muted-foreground">{source.type}</p></div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
              <p className="text-sm text-primary mt-4 cursor-default">+ Add new source</p>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-9 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Filter data..." className="pl-9" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
                </div>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Event type" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Events</SelectItem><SelectItem value="page_view">Page View</SelectItem><SelectItem value="signup">Signup</SelectItem><SelectItem value="purchase">Purchase</SelectItem></SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (dateRange.to ? <>{format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd')}</> : format(dateRange.from, 'LLL dd, y')) : <span>Pick a date range</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={{ from: dateRange.from, to: dateRange.to }} onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })} numberOfMonths={2} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <Button onClick={handleRunQuery} disabled={isLoading}><Play className="mr-2 h-4 w-4" />{isLoading ? 'Running...' : 'Run Query'}</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>User ID</TableHead><TableHead>Event</TableHead><TableHead>Timestamp</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedRow(row)}>
                      <TableCell className="font-mono text-sm">{row.id}</TableCell><TableCell className="font-mono text-sm">{row.user_id}</TableCell>
                      <TableCell>{row.event}</TableCell><TableCell className="text-muted-foreground">{row.timestamp}</TableCell><TableCell>{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <Sheet open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Record Details</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-4">
            <div><p className="text-sm text-muted-foreground">ID</p><p className="font-mono">{selectedRow?.id}</p></div>
            <div><p className="text-sm text-muted-foreground">User ID</p><p className="font-mono">{selectedRow?.user_id}</p></div>
            <div><p className="text-sm text-muted-foreground">Event</p><p>{selectedRow?.event}</p></div>
            <div><p className="text-sm text-muted-foreground">Timestamp</p><p>{selectedRow?.timestamp}</p></div>
            <div><p className="text-sm text-muted-foreground">Value</p><p>{selectedRow?.value}</p></div>
            <Button variant="outline" className="w-full mt-4" onClick={() => toast({ title: 'Deep navigation', description: 'This would open the full record view.' })}>Open full record →</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
