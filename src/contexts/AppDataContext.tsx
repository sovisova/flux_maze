import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Types
export interface Report {
  id: string;
  title: string;
  author: string;
  created: string;
  lastRun: string;
  status: 'active' | 'draft' | 'archived' | 'completed' | 'running' | 'failed';
  type: 'financial' | 'product' | 'marketing' | 'sales';
  description: string;
  recipients: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  lastActive: string;
  permissions: string[];
}

export interface Notification {
  id: string;
  type: 'report' | 'team' | 'alert';
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  revoked: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  connected: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
}

interface AppDataContextType {
  // Reports
  reports: Report[];
  addReport: (report: Omit<Report, 'id'>) => void;
  updateReport: (id: string, data: Partial<Report>) => void;
  duplicateReport: (id: string) => void;
  archiveReport: (id: string) => void;
  deleteReport: (id: string) => void;
  runReport: (id: string) => void;

  // Team
  teamMembers: TeamMember[];
  addTeamMember: (email: string) => void;
  updateMemberPermissions: (id: string, permissions: string[]) => void;
  removeMember: (id: string) => void;

  // Notifications
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;

  // Billing
  currentPlan: string;
  setCurrentPlan: (plan: string) => void;
  invoices: Invoice[];
  paymentMethod: { cardLast4: string; expiry: string } | null;
  updatePaymentMethod: (card: { cardLast4: string; expiry: string }) => void;

  // API Keys
  apiKeys: ApiKey[];
  createApiKey: (name: string) => void;
  revokeApiKey: (id: string) => void;

  // Data Sources
  dataSources: DataSource[];
  selectedDataSource: string;
  setSelectedDataSource: (id: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (data: Partial<Settings>) => void;
}

interface Settings {
  name: string;
  email: string;
  timezone: string;
  darkMode: boolean;
  emailNotifications: boolean;
}

const initialReports: Report[] = [
  { id: '1', title: 'Q4 Revenue Analysis', author: 'Sarah Chen', created: 'Dec 1, 2024', lastRun: '2 hours ago', status: 'completed', type: 'financial', description: 'Quarterly revenue breakdown by segment and region.', recipients: 'team@company.com' },
  { id: '2', title: 'User Retention Report', author: 'Mike Johnson', created: 'Nov 28, 2024', lastRun: '5 hours ago', status: 'completed', type: 'product', description: 'Monthly user retention metrics.', recipients: 'product@company.com' },
  { id: '3', title: 'Marketing Campaign ROI', author: 'Lisa Park', created: 'Nov 25, 2024', lastRun: '1 day ago', status: 'failed', type: 'marketing', description: 'Campaign performance analysis.', recipients: 'marketing@company.com' },
  { id: '4', title: 'Product Usage Metrics', author: 'Tom Wilson', created: 'Nov 22, 2024', lastRun: '2 days ago', status: 'running', type: 'product', description: 'Daily active users and feature usage.', recipients: 'pm@company.com' },
  { id: '5', title: 'Customer Churn Analysis', author: 'Emma Davis', created: 'Nov 20, 2024', lastRun: '3 days ago', status: 'completed', type: 'financial', description: 'Churn rate analysis by segment.', recipients: 'success@company.com' },
  { id: '6', title: 'Sales Pipeline Report', author: 'John Smith', created: 'Nov 18, 2024', lastRun: 'Never', status: 'draft', type: 'sales', description: 'Weekly sales pipeline status.', recipients: 'sales@company.com' },
  { id: '7', title: 'Weekly Performance Summary', author: 'Sarah Chen', created: 'Nov 15, 2024', lastRun: '1 week ago', status: 'active', type: 'product', description: 'Weekly KPI summary for the team.', recipients: 'all@company.com' },
  { id: '8', title: 'Quarterly Business Review', author: 'Mike Johnson', created: 'Nov 10, 2024', lastRun: '2 weeks ago', status: 'active', type: 'financial', description: 'Quarterly business metrics overview.', recipients: 'exec@company.com' },
];

const initialTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', role: 'Admin', lastActive: '2 hours ago', permissions: ['view_reports', 'edit_reports', 'delete_reports', 'manage_team', 'billing', 'api_keys'] },
  { id: '2', name: 'Mike Johnson', email: 'mike@company.com', role: 'Editor', lastActive: '1 day ago', permissions: ['view_reports', 'edit_reports'] },
  { id: '3', name: 'Lisa Park', email: 'lisa@company.com', role: 'Viewer', lastActive: '3 days ago', permissions: ['view_reports'] },
  { id: '4', name: 'Tom Wilson', email: 'tom@company.com', role: 'Editor', lastActive: '5 hours ago', permissions: ['view_reports', 'edit_reports'] },
  { id: '5', name: 'Emma Davis', email: 'emma@company.com', role: 'Viewer', lastActive: '1 week ago', permissions: ['view_reports'] },
];

const initialNotifications: Notification[] = [
  { id: '1', type: 'report', title: 'Report completed', description: 'Q4 Revenue Analysis has finished running.', time: '2 hours ago', read: false, category: 'reports' },
  { id: '2', type: 'team', title: 'New team member', description: 'Emma Davis joined the team.', time: '5 hours ago', read: false, category: 'team' },
  { id: '3', type: 'alert', title: 'Data sync failed', description: 'Connection to BigQuery timed out.', time: '1 day ago', read: true, category: 'alerts' },
  { id: '4', type: 'report', title: 'Scheduled report sent', description: 'Weekly Performance Summary was delivered.', time: '2 days ago', read: true, category: 'ghost-category' },
];

const initialInvoices: Invoice[] = [
  { id: 'INV-001', date: 'Dec 1, 2024', amount: '$79.00', status: 'Paid' },
  { id: 'INV-002', date: 'Nov 1, 2024', amount: '$79.00', status: 'Paid' },
  { id: 'INV-003', date: 'Oct 1, 2024', amount: '$79.00', status: 'Paid' },
];

const initialApiKeys: ApiKey[] = [
  { id: '1', name: 'Production Key', key: 'sk_live_...abc123', created: 'Nov 15, 2024', revoked: false },
  { id: '2', name: 'Development Key', key: 'sk_test_...xyz789', created: 'Oct 20, 2024', revoked: false },
];

const initialDataSources: DataSource[] = [
  { id: '1', name: 'Production Database', type: 'PostgreSQL', connected: true },
  { id: '2', name: 'Analytics Warehouse', type: 'BigQuery', connected: true },
  { id: '3', name: 'User Events', type: 'Snowflake', connected: true },
];

const initialChatMessages: ChatMessage[] = [
  { id: '1', type: 'bot', text: 'Hi! How can I help you today?' },
];

const initialSettings = {
  name: '',
  email: '',
  timezone: 'utc',
  darkMode: false,
  emailNotifications: true,
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [currentPlan, setCurrentPlan] = useState('pro');
  const [invoices] = useState<Invoice[]>(initialInvoices);
  const [paymentMethod, setPaymentMethod] = useState<{ cardLast4: string; expiry: string } | null>({ cardLast4: '4242', expiry: '12/25' });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [dataSources] = useState<DataSource[]>(initialDataSources);
  const [selectedDataSource, setSelectedDataSource] = useState('1');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [settings, setSettings] = useState(initialSettings);

  // Report actions
  const addReport = (report: Omit<Report, 'id'>) => {
    const newReport = { ...report, id: Date.now().toString() };
    setReports([newReport, ...reports]);
    toast({ title: 'Report created', description: `"${report.title}" has been created.` });
  };

  const updateReport = (id: string, data: Partial<Report>) => {
    setReports(reports.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const duplicateReport = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      const newReport = { ...report, id: Date.now().toString(), title: `${report.title} (Copy)`, status: 'draft' as const };
      setReports([newReport, ...reports]);
      toast({ title: 'Report duplicated', description: `"${newReport.title}" has been created.` });
    }
  };

  const archiveReport = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'archived' } : r));
    toast({ title: 'Report archived', description: 'The report has been moved to archives.' });
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    toast({ title: 'Report deleted', description: 'The report has been permanently deleted.' });
  };

  const runReport = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'running', lastRun: 'Just now' } : r));
    toast({ title: 'Report running', description: 'Your report is being generated...' });
    setTimeout(() => {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
      toast({ title: 'Report completed', description: 'Your report has finished running.' });
    }, 3000);
  };

  // Team actions
  const addTeamMember = (email: string) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role: 'Viewer',
      lastActive: 'Just invited',
      permissions: ['view_reports'],
    };
    setTeamMembers([...teamMembers, newMember]);
    toast({ title: 'Invitation sent', description: `An invitation has been sent to ${email}.` });
  };

  const updateMemberPermissions = (id: string, permissions: string[]) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, permissions } : m));
  };

  const removeMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    toast({ title: 'Member removed', description: 'The team member has been removed.' });
  };

  // Notification actions
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast({ title: 'All notifications marked as read' });
  };

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = { ...notification, id: Date.now().toString() };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Payment actions
  const updatePaymentMethod = (card: { cardLast4: string; expiry: string }) => {
    setPaymentMethod(card);
    toast({ title: 'Payment method updated', description: 'Your payment information has been saved.' });
  };

  // API Key actions
  const createApiKey = (name: string) => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name,
      key: `sk_${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 8)}`,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      revoked: false,
    };
    setApiKeys([...apiKeys, newKey]);
    toast({ title: 'API key created', description: `"${name}" has been created.` });
  };

  const revokeApiKey = (id: string) => {
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, revoked: true } : k));
    toast({ title: 'API key revoked', description: 'The API key has been revoked.' });
  };

  // Chat actions
  const sendChatMessage = (text: string) => {
    const userMessage: ChatMessage = { id: Date.now().toString(), type: 'user', text };
    setChatMessages(prev => [...prev, userMessage]);

    // Generic canned response after delay
    setTimeout(() => {
      const responses = [
        'Thanks for your question! Our system will review it and get back to you shortly.',
        'I understand. Let me look into that for you. A support agent will follow up soon.',
        'Great question! I\'ve noted this down. Someone from our team will reach out.',
        'Thanks for reaching out! We\'ll get back to you within 24 hours.',
      ];
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: responses[Math.floor(Math.random() * responses.length)],
      };
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  // Settings actions
  const updateSettings = (data: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...data }));
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
  };

  return (
    <AppDataContext.Provider value={{
      reports,
      addReport,
      updateReport,
      duplicateReport,
      archiveReport,
      deleteReport,
      runReport,
      teamMembers,
      addTeamMember,
      updateMemberPermissions,
      removeMember,
      notifications,
      markAsRead,
      markAllAsRead,
      addNotification,
      currentPlan,
      setCurrentPlan,
      invoices,
      paymentMethod,
      updatePaymentMethod,
      apiKeys,
      createApiKey,
      revokeApiKey,
      dataSources,
      selectedDataSource,
      setSelectedDataSource,
      chatMessages,
      sendChatMessage,
      settings,
      updateSettings,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
