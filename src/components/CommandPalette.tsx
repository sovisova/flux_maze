import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog as Dialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  FileText,
  Database,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
} from 'lucide-react';

const commands = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Reports', icon: FileText, path: '/reports' },
  { label: 'Data Explorer', icon: Database, path: '/data-explorer' },
  { label: 'Team', icon: Users, path: '/team' },
  { label: 'Billing', icon: CreditCard, path: '/billing' },
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Help', icon: HelpCircle, path: '/help' },
];

interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandDialog({ open, onOpenChange }: CommandDialogProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  // UX Issue: Case-sensitive search
  const filteredCommands = commands.filter((cmd) =>
    cmd.label.includes(search) // Case-sensitive intentionally
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {/* UX Issue: Zero results for edge cases */}
        <CommandEmpty>
          {search.length > 0 ? 'No results found.' : 'Start typing to search...'}
        </CommandEmpty>
        <CommandGroup heading="Navigation">
          {filteredCommands.map((cmd) => (
            <CommandItem
              key={cmd.path}
              onSelect={() => handleSelect(cmd.path)}
              className="cursor-pointer"
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              {cmd.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Dialog>
  );
}
