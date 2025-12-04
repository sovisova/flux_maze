import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { useAppData } from '@/contexts/AppDataContext';
import { Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    features: ['5 reports', '1 team member', 'Basic analytics', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: '/month',
    features: ['Unlimited reports', '10 team members', 'Advanced analytics', 'Priority support', 'API access'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Pro', 'Unlimited team members', 'Custom integrations', 'Dedicated support', 'SLA'],
  },
];

export default function Billing() {
  const { currentPlan, setCurrentPlan, invoices, paymentMethod, updatePaymentMethod } = useAppData();
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null);

  const handleUpdatePlan = async () => {
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // UX Issue: Unexpected new tab
    if (selectedPlan === 'enterprise') {
      window.open('https://example.com/contact-sales', '_blank');
      setIsUpdating(false);
      return;
    }
    
    setCurrentPlan(selectedPlan);
    toast({
      title: 'Plan updated',
      description: `Your subscription has been updated to ${plans.find(p => p.id === selectedPlan)?.name}.`,
    });
    setIsUpdating(false);
  };

  const handleUpdatePayment = () => {
    // Basic validation
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      toast({ title: 'Error', description: 'Please enter a valid card number.', variant: 'destructive' });
      return;
    }
    if (!cardName) {
      toast({ title: 'Error', description: 'Please enter the name on card.', variant: 'destructive' });
      return;
    }
    if (!expiry || !expiry.includes('/')) {
      toast({ title: 'Error', description: 'Please enter a valid expiry date (MM/YY).', variant: 'destructive' });
      return;
    }
    if (!cvc || cvc.length < 3) {
      toast({ title: 'Error', description: 'Please enter a valid CVC.', variant: 'destructive' });
      return;
    }

    updatePaymentMethod({
      cardLast4: cardNumber.slice(-4),
      expiry,
    });
    
    // Clear form
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvc('');
    setZip('');
  };

  const handleDownloadInvoice = (invoice: typeof invoices[0]) => {
    toast({
      title: 'Download started',
      description: `Downloading ${invoice.id}.pdf (mock)`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold">Billing & Plans</h1>
        <p className="text-muted-foreground text-sm">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan Info */}
      {paymentMethod && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current plan</p>
                <p className="text-lg font-semibold capitalize">{currentPlan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment method</p>
                <p className="text-sm">•••• •••• •••• {paymentMethod.cardLast4} (expires {paymentMethod.expiry})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'cursor-pointer transition-all',
              selectedPlan === plan.id && 'ring-2 ring-primary',
              currentPlan === plan.id && 'border-primary'
            )}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {currentPlan === plan.id && <Badge>Current</Badge>}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPlan !== currentPlan && (
        <Button onClick={handleUpdatePlan} disabled={isUpdating}>
          {isUpdating ? 'Updating...' : `Update to ${plans.find(p => p.id === selectedPlan)?.name}`}
        </Button>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method</CardTitle>
          <CardDescription>Update your billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card number</Label>
              {/* UX Issue: Input type mismatch - using text instead of appropriate type */}
              <Input 
                id="card-number" 
                type="text" 
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {/* UX Issue: Label far from input */}
              <Label htmlFor="card-name" className="mb-4 block">Name on card</Label>
              <Input 
                id="card-name" 
                type="text" 
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry date</Label>
              <Input 
                id="expiry" 
                type="text" 
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input 
                id="cvc" 
                type="text" 
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {/* UX Issue: Numeric field with problematic spinner */}
              <Label htmlFor="zip">ZIP code</Label>
              <Input 
                id="zip" 
                type="number" 
                placeholder="12345"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" onClick={handleUpdatePayment}>Update Payment Method</Button>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-success border-success">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Detail Sheet */}
      <Sheet open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Invoice {selectedInvoice?.id}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{selectedInvoice?.date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-2xl font-bold">{selectedInvoice?.amount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className="text-success border-success">
                {selectedInvoice?.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p>Pro Plan - Monthly subscription</p>
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => selectedInvoice && handleDownloadInvoice(selectedInvoice)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
