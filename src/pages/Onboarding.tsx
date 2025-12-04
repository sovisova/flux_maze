import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const roles = ['Data Analyst', 'Product Manager', 'Engineer', 'Executive', 'Designer', 'Marketing'];
const dataSources = ['Google Analytics', 'Salesforce', 'PostgreSQL', 'MySQL', 'BigQuery', 'Snowflake'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    company: '',
    teamSize: '',
    selectedRoles: [] as string[],
    selectedSources: [] as string[],
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleBack = () => {
    // UX Issue: Back button sometimes goes to login
    if (step === 1) {
      navigate('/login');
    } else if (step === 3) {
      // Sometimes clears progress
      setFormData({ ...formData, selectedRoles: [] });
      setStep(step - 1);
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      navigate('/dashboard');
    }
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter((r) => r !== role)
        : [...prev.selectedRoles, role],
    }));
  };

  const toggleSource = (source: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSources: prev.selectedSources.includes(source)
        ? prev.selectedSources.filter((s) => s !== source)
        : [...prev.selectedSources, source],
    }));
  };

  // UX Issue: Skip link is low contrast and hard to spot
  const handleSkip = () => {
    completeOnboarding();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-xl font-semibold">
              {step === 1 && 'Tell us about your team'}
              {step === 2 && 'What roles describe you?'}
              {step === 3 && 'Connect data sources'}
              {step === 4 && 'You\'re all set!'}
            </CardTitle>
            {/* UX Issue: Ghost button - very low contrast */}
            <button
              onClick={handleSkip}
              className="text-[11px] ghost-button hover:underline"
            >
              Skip setup
            </button>
          </div>
          <Progress value={progress} className="h-1" />
          <CardDescription className="mt-2">Step {step} of {totalSteps}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company name</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team size</Label>
                <Input
                  id="teamSize"
                  placeholder="10-50"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <Badge
                    key={role}
                    variant={formData.selectedRoles.includes(role) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      formData.selectedRoles.includes(role) && 'bg-primary'
                    )}
                    onClick={() => toggleRole(role)}
                  >
                    {formData.selectedRoles.includes(role) && (
                      <Check className="mr-1 h-3 w-3" />
                    )}
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your data sources to get started
              </p>
              <div className="grid grid-cols-2 gap-3">
                {dataSources.map((source) => (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={cn(
                      'p-3 rounded-lg border text-left text-sm transition-colors',
                      formData.selectedSources.includes(source)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    {source}
                    {formData.selectedSources.includes(source) && (
                      <Check className="inline ml-2 h-3 w-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              {/* UX Issue: False affordance - looks clickable but isn't */}
              <p className="text-sm text-primary cursor-default">
                + Add custom integration
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-medium mb-2">Welcome to ReportHub!</h3>
              <p className="text-muted-foreground text-sm">
                Your workspace is ready. Let's build some reports.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            {/* UX Issue: Tiny click target on step 2 */}
            <Button
              onClick={handleNext}
              className={cn('gap-1', step === 2 && 'tiny-target text-[10px]')}
              // UX Issue: Disabled with no explanation
              disabled={step === 1 && !formData.company}
            >
              {step === totalSteps ? 'Get started' : 'Next'}
              {step < totalSteps && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
