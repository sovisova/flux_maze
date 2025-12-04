import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { useReportRunner } from '@/contexts/ReportRunnerContext';
import { ArrowLeft, Save, Play, GripVertical, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialSections = [
  { id: '1', metric: 'Revenue', value: '$125,000', change: '+12%' },
  { id: '2', metric: 'Users', value: '8,432', change: '+5%' },
  { id: '3', metric: 'Conversions', value: '342', change: '-2%' },
  { id: '4', metric: 'Avg. Order Value', value: '$89', change: '+8%' },
];

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, updateReport, addReport, addNotification } = useAppData();
  const { startReportRun, isRunning, getRunHistoryForReport, downloadRunPdf } = useReportRunner();
  
  const isNewReport = id === 'new';
  const existingReport = reports.find(r => r.id === id);
  
  const [reportName, setReportName] = useState(existingReport?.title || '');
  const [description, setDescription] = useState(existingReport?.description || '');
  const [recipients, setRecipients] = useState(existingReport?.recipients || '');
  const [reportType, setReportType] = useState<'financial' | 'product' | 'marketing' | 'sales'>(existingReport?.type || 'financial');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [hasChanges, setHasChanges] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [sections, setSections] = useState(initialSections);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [lastGeneratedPdf, setLastGeneratedPdf] = useState<Blob | null>(null);

  useEffect(() => {
    if (existingReport) {
      setReportName(existingReport.title);
      setDescription(existingReport.description);
      setRecipients(existingReport.recipients);
      setReportType(existingReport.type);
    }
  }, [existingReport]);

  const handleFieldChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    setClickCount((prev) => prev + 1);
    
    if (!hasChanges && clickCount === 0) {
      return;
    }

    if (isNewReport) {
      addReport({
        title: reportName || 'Untitled Report',
        author: 'You',
        created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastRun: 'Never',
        status: 'draft',
        type: reportType,
        description,
        recipients,
      });
      navigate('/reports');
    } else if (id) {
      updateReport(id, {
        title: reportName,
        description,
        recipients,
        type: reportType,
      });
    }

    toast({
      title: 'Saved',
      description: 'Report updated successfully.',
      duration: 800,
    });
    setHasChanges(false);
    setClickCount(0);
  };

  const handleRun = async () => {
    if (id && !isNewReport && !isRunning) {
      try {
        const pdfBlob = await startReportRun(id, reportName || 'Untitled Report');
        setLastGeneratedPdf(pdfBlob);
        updateReport(id, { status: 'completed', lastRun: 'Just now' });
        
        // Add notification for completed report
        addNotification({
          type: 'report',
          title: 'Report completed',
          description: `"${reportName}" has finished running and is ready for download.`,
          time: 'Just now',
          read: false,
          category: 'reports',
        });
        
        toast({
          title: 'Report completed',
          description: 'Your report has been generated and is ready for download.',
        });
      } catch (error) {
        toast({
          title: 'Report failed',
          description: 'There was an error generating the report.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDownloadPdf = () => {
    if (lastGeneratedPdf) {
      const url = URL.createObjectURL(lastGeneratedPdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Download started',
        description: 'Your PDF report is being downloaded.',
        duration: 800,
      });
    }
  };

  // Improved drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Add visual feedback
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) return;
    
    const newSections = [...sections];
    const [draggedItem] = newSections.splice(dragIndex, 1);
    newSections.splice(dropIndex, 0, draggedItem);
    
    setSections(newSections);
    setHasChanges(true);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    toast({
      title: 'Reordered',
      description: 'Section order updated.',
      duration: 1500,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/reports">Reports</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/reports">All Reports</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isNewReport ? 'New Report' : reportName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{isNewReport ? 'New Report' : reportName}</h1>
            <p className="text-muted-foreground text-sm">
              {isNewReport ? 'Create a new report' : `Last run ${existingReport?.lastRun || 'Never'}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNewReport && lastGeneratedPdf && (
            <Button variant="outline" className="gap-2" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          )}
          {!isNewReport && (
            <Button variant="outline" className="gap-2" onClick={handleRun} disabled={isRunning}>
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Run Report
            </Button>
          )}
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Report Name</Label>
                <Input
                  id="name"
                  value={reportName}
                  onChange={(e) => handleFieldChange(setReportName, e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Report Type</Label>
                <Select value={reportType} onValueChange={(v: any) => { setReportType(v); setHasChanges(true); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => handleFieldChange(setDescription, e.target.value)}
                  rows={3}
                  placeholder="Describe this report..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <Input
                  id="recipients"
                  value={recipients}
                  onChange={(e) => handleFieldChange(setRecipients, e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">[Video would autoplay here with audio]</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Sections</CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag rows to reorder sections
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((row, index) => (
                    <TableRow 
                      key={row.id} 
                      className={cn(
                        'transition-all cursor-grab active:cursor-grabbing',
                        draggedIndex === index && 'opacity-50',
                        dragOverIndex === index && 'bg-accent border-t-2 border-primary'
                      )}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </TableCell>
                      <TableCell className="font-medium">{row.metric}</TableCell>
                      <TableCell>{row.value}</TableCell>
                      <TableCell className={row.change.startsWith('+') ? 'text-success' : 'text-destructive'}>
                        {row.change}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable scheduling</Label>
                  <p className="text-sm text-muted-foreground">Automatically run this report on a schedule</p>
                </div>
                <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
              </div>
              
              {scheduleEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" defaultValue="09:00" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              {!isNewReport && id ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getRunHistoryForReport(id).length > 0 ? (
                        getRunHistoryForReport(id).map((run) => (
                          <TableRow key={run.id}>
                            <TableCell className="text-muted-foreground">
                              {run.timestamp.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell>{run.user}</TableCell>
                            <TableCell>
                              <span className={cn(
                                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                                run.status === 'completed' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                              )}>
                                {run.status === 'completed' ? 'Completed' : 'Failed'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {run.status === 'completed' && run.pdfBlob && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => downloadRunPdf(run.id)}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download PDF
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No runs yet. Click "Run Report" to generate your first report.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Save the report first to view run history.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
