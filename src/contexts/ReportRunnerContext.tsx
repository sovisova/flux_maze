import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ReportRunRecord {
  id: string;
  reportId: string;
  reportTitle: string;
  timestamp: Date;
  status: 'completed' | 'failed';
  pdfBlob: Blob | null;
  user: string;
}

interface ReportRunnerContextType {
  isRunning: boolean;
  progress: number;
  currentReportId: string | null;
  currentReportTitle: string;
  runHistory: ReportRunRecord[];
  startReportRun: (id: string, title: string) => Promise<Blob>;
  cancelRun: () => void;
  getRunHistoryForReport: (reportId: string) => ReportRunRecord[];
  downloadRunPdf: (runId: string) => void;
}

const ReportRunnerContext = createContext<ReportRunnerContextType | undefined>(undefined);

// Generate mock PDF content
function generateMockPDF(title: string): Blob {
  // Create a simple PDF structure
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 700 Td
(${title}) Tj
0 -40 Td
/F1 12 Tf
(Report Generated: ${new Date().toLocaleString()}) Tj
0 -30 Td
(Status: Completed) Tj
0 -30 Td
(Total Revenue: $125,432.00) Tj
0 -30 Td
(Active Users: 8,432) Tj
0 -30 Td
(Conversion Rate: 3.2%) Tj
0 -30 Td
(Average Order Value: $89.50) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000518 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
595
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

export function ReportRunnerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [currentReportTitle, setCurrentReportTitle] = useState('');
  const [cancelRequested, setCancelRequested] = useState(false);
  const [runCountPerReport, setRunCountPerReport] = useState<Record<string, number>>({});
  const [runHistory, setRunHistory] = useState<ReportRunRecord[]>([
    // Initial mock history
    { id: 'run-1', reportId: '1', reportTitle: 'Q4 Revenue Analysis', timestamp: new Date('2024-12-03T10:30:00'), status: 'completed', pdfBlob: generateMockPDF('Q4 Revenue Analysis'), user: 'Sarah Chen' },
    { id: 'run-2', reportId: '1', reportTitle: 'Q4 Revenue Analysis', timestamp: new Date('2024-12-02T15:15:00'), status: 'completed', pdfBlob: generateMockPDF('Q4 Revenue Analysis'), user: 'Mike Johnson' },
    { id: 'run-3', reportId: '2', reportTitle: 'User Retention Report', timestamp: new Date('2024-12-01T09:00:00'), status: 'completed', pdfBlob: generateMockPDF('User Retention Report'), user: 'Sarah Chen' },
  ]);

  const startReportRun = async (id: string, title: string): Promise<Blob> => {
    // Track run count for this report
    const currentRunCount = (runCountPerReport[id] || 0) + 1;
    setRunCountPerReport(prev => ({ ...prev, [id]: currentRunCount }));
    
    setIsRunning(true);
    setProgress(0);
    setCurrentReportId(id);
    setCurrentReportTitle(title);
    setCancelRequested(false);

    // Determine behavior based on run count
    // 1st run: smooth and fast
    // 2nd run: fails
    // 3rd+ run: very slow but completes
    const shouldFail = currentRunCount === 2;
    const isVerySlow = currentRunCount >= 3;
    const delayMultiplier = isVerySlow ? 4 : 1;

    // Simulate report generation with progress
    return new Promise((resolve, reject) => {
      const baseStages = [
        { progress: 15, delay: 800, message: 'Connecting to data source...' },
        { progress: 30, delay: 1200, message: 'Fetching records...' },
        { progress: 50, delay: 1500, message: 'Processing data...' },
        { progress: 70, delay: 1000, message: 'Generating visualizations...' },
        { progress: 85, delay: 800, message: 'Compiling report...' },
        { progress: 95, delay: 600, message: 'Finalizing PDF...' },
        { progress: 100, delay: 400, message: 'Complete!' },
      ];
      
      const stages = baseStages.map(s => ({ ...s, delay: s.delay * delayMultiplier }));
      const failAtStage = shouldFail ? 3 : -1; // Fail at "Processing data" stage

      let stageIndex = 0;

      const runNextStage = () => {
        if (cancelRequested) {
          setIsRunning(false);
          setProgress(0);
          setCurrentReportId(null);
          reject(new Error('Report generation cancelled'));
          return;
        }

        // Fail on second run at stage 3
        if (shouldFail && stageIndex === failAtStage) {
          const failedRun: ReportRunRecord = {
            id: `run-${Date.now()}`,
            reportId: id,
            reportTitle: title,
            timestamp: new Date(),
            status: 'failed',
            pdfBlob: null,
            user: 'You',
          };
          setRunHistory(prev => [failedRun, ...prev]);
          
          setIsRunning(false);
          setProgress(0);
          setCurrentReportId(null);
          reject(new Error('Data processing failed: Connection timeout'));
          return;
        }

        if (stageIndex >= stages.length) {
          // Generate and return the PDF
          const pdfBlob = generateMockPDF(title);
          
          // Add to run history
          const newRun: ReportRunRecord = {
            id: `run-${Date.now()}`,
            reportId: id,
            reportTitle: title,
            timestamp: new Date(),
            status: 'completed',
            pdfBlob,
            user: 'You',
          };
          setRunHistory(prev => [newRun, ...prev]);
          
          setIsRunning(false);
          setProgress(0);
          setCurrentReportId(null);
          resolve(pdfBlob);
          return;
        }

        const stage = stages[stageIndex];
        setProgress(stage.progress);
        stageIndex++;

        setTimeout(runNextStage, stage.delay);
      };

      runNextStage();
    });
  };

  const cancelRun = () => {
    setCancelRequested(true);
  };

  const getRunHistoryForReport = (reportId: string): ReportRunRecord[] => {
    return runHistory.filter(run => run.reportId === reportId);
  };

  const downloadRunPdf = (runId: string) => {
    const run = runHistory.find(r => r.id === runId);
    if (run?.pdfBlob) {
      const url = URL.createObjectURL(run.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${run.reportTitle}-${run.timestamp.toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <ReportRunnerContext.Provider value={{
      isRunning,
      progress,
      currentReportId,
      currentReportTitle,
      runHistory,
      startReportRun,
      cancelRun,
      getRunHistoryForReport,
      downloadRunPdf,
    }}>
      {children}
    </ReportRunnerContext.Provider>
  );
}

export function useReportRunner() {
  const context = useContext(ReportRunnerContext);
  if (context === undefined) {
    throw new Error('useReportRunner must be used within a ReportRunnerProvider');
  }
  return context;
}
