import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { Bell, FileText, Users, AlertCircle, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeIcons = {
  report: FileText,
  team: Users,
  alert: AlertCircle,
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useAppData();
  const [popupOpen, setPopupOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackCompany, setFeedbackCompany] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackErrors, setFeedbackErrors] = useState<Record<string, string>>({});
  const [feedbackAttempted, setFeedbackAttempted] = useState(false);

  // UX Issue: Timed popup after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setPopupOpen(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    // Navigate based on type
    if (notification.type === 'report') navigate('/reports');
    else if (notification.type === 'team') navigate('/team');
    else if (notification.type === 'alert') navigate('/data-explorer');
  };

  const handleCategoryClick = (category: string) => {
    if (category === 'ghost-category') {
      toast({ title: 'No content', description: 'This category has no items.' });
    }
  };

  const handleFeedbackSubmit = () => {
    setFeedbackAttempted(true);
    const errors: Record<string, string> = {};
    
    if (!feedbackName.trim()) errors.name = 'Name is required';
    if (!feedbackEmail.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedbackEmail)) errors.email = 'Invalid email';
    if (!feedbackCompany.trim()) errors.company = 'Company is required';
    if (!feedbackMessage.trim()) errors.message = 'Message is required';
    
    setFeedbackErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({ title: 'Validation error', description: 'Please fill in all required fields.' });
      return;
    }
    
    // Success
    toast({ title: 'Thank you!', description: 'Your feedback has been submitted.' });
    setPopupOpen(false);
    setFeedbackName('');
    setFeedbackEmail('');
    setFeedbackCompany('');
    setFeedbackMessage('');
    setFeedbackErrors({});
    setFeedbackAttempted(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground text-sm">Stay updated on your activity</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>
          <Check className="mr-2 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-1">
            {notifications.map((item) => {
              const Icon = typeIcons[item.type as keyof typeof typeIcons] || Bell;
              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors',
                    'hover:bg-muted active:bg-muted',
                    !item.read && 'bg-accent/50'
                  )}
                >
                  <div className={cn('p-2 rounded-lg', item.type === 'alert' ? 'bg-destructive/10' : 'bg-secondary')}>
                    <Icon className={cn('h-4 w-4', item.type === 'alert' ? 'text-destructive' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{item.title}</p>
                      {!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs cursor-pointer" onClick={(e) => { e.stopPropagation(); handleCategoryClick(item.category); }}>
                            {item.category}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>View category</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
            <DialogDescription>Help us improve your experience</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full name *</Label>
              <Input 
                placeholder="Your name" 
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
              />
              {feedbackAttempted && feedbackErrors.name && (
                <p className="text-sm text-muted-foreground">{feedbackErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input 
                type="email" 
                placeholder="you@example.com"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
              />
              {feedbackAttempted && feedbackErrors.email && (
                <p className="text-sm text-muted-foreground">{feedbackErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Company name *</Label>
              <Input 
                placeholder="Your company"
                value={feedbackCompany}
                onChange={(e) => setFeedbackCompany(e.target.value)}
              />
              {feedbackAttempted && feedbackErrors.company && (
                <p className="text-sm text-muted-foreground">{feedbackErrors.company}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea 
                placeholder="Your feedback..." 
                rows={3}
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
              />
              {feedbackAttempted && feedbackErrors.message && (
                <p className="text-sm text-muted-foreground">{feedbackErrors.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPopupOpen(false)}>Maybe later</Button>
              <Button onClick={handleFeedbackSubmit}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
