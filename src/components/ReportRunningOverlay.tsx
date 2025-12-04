import { useReportRunner } from '@/contexts/ReportRunnerContext';
import { Progress } from '@/components/ui/progress';
import { FileText, Loader2 } from 'lucide-react';

export function ReportRunningOverlay() {
  const { isRunning, progress, currentReportTitle } = useReportRunner();

  if (!isRunning) return null;

  const getStatusMessage = () => {
    if (progress < 15) return 'Initializing...';
    if (progress < 30) return 'Connecting to data source...';
    if (progress < 50) return 'Fetching records...';
    if (progress < 70) return 'Processing data...';
    if (progress < 85) return 'Generating visualizations...';
    if (progress < 95) return 'Compiling report...';
    if (progress < 100) return 'Finalizing PDF...';
    return 'Complete!';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <FileText className="h-16 w-16 text-primary" />
            <Loader2 className="h-6 w-6 text-primary animate-spin absolute -bottom-1 -right-1" />
          </div>
          <h2 className="text-xl font-semibold text-center">Generating Report</h2>
          <p className="text-muted-foreground text-center text-sm">
            {currentReportTitle}
          </p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{getStatusMessage()}</span>
            <span className="font-medium">{progress}%</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Please wait while your report is being generated. Do not close this window.
        </p>
      </div>
    </div>
  );
}
