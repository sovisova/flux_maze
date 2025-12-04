import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Database,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Archive,
  Bookmark,
  Link2,
  Clock,
  Table2,
  Bell,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  {
    label: 'Reports',
    icon: FileText,
    children: [
      { label: 'All Reports', icon: FileText, path: '/reports' },
      { label: 'Saved Views', icon: Bookmark, path: '/reports/saved' },
      { label: 'Archived', icon: Archive, path: '/reports/archived' },
    ],
  },
  {
    label: 'Data',
    icon: Database,
    children: [
      { label: 'Data Explorer', icon: Table2, path: '/data-explorer' },
      {
        label: 'Sources',
        icon: Link2,
        children: [
          { label: 'Connected Sources', icon: Link2, path: '/data/sources/connected' },
          { label: 'Pending', icon: Clock, path: '/data/sources/pending' },
        ],
      },
      { label: 'Schemas', icon: Database, path: '/data/schemas' },
    ],
  },
  { label: 'Team & Permissions', icon: Users, path: '/team' },
  { label: 'Billing', icon: CreditCard, path: '/billing' },
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Help & Docs', icon: HelpCircle, path: '/help' },
];

function NavItemComponent({ 
  item, 
  collapsed, 
  depth = 0 
}: { 
  item: NavItem; 
  collapsed: boolean; 
  depth?: number;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(
    item.children?.some(child => 
      child.path === location.pathname || 
      child.children?.some(c => c.path === location.pathname)
    ) || false
  );

  const isActive = item.path === location.pathname;
  const Icon = item.icon;

  if (item.children) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 h-9 px-3 font-normal',
              depth > 0 && 'pl-9',
              collapsed && 'justify-center px-2'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {open ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        {!collapsed && (
          <CollapsibleContent className="pl-4">
            {item.children.map((child) => (
              <NavItemComponent key={child.label} item={child} collapsed={collapsed} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  }

  const button = (
    <Button
      variant="ghost"
      onClick={() => item.path && navigate(item.path)}
      className={cn(
        'w-full justify-start gap-3 h-9 px-3 font-normal',
        depth > 0 && 'pl-9',
        collapsed && 'justify-center px-2',
        isActive && 'bg-accent text-accent-foreground font-medium'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="text-sm">{item.label}</span>}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-navbar h-[calc(100vh-var(--navbar-height))] border-r border-border bg-sidebar transition-all duration-200 z-40',
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
      )}
    >
      <nav className="flex flex-col gap-1 p-2 overflow-y-auto h-full">
        {navItems.map((item) => (
          <NavItemComponent key={item.label} item={item} collapsed={collapsed} />
        ))}
        
        {/* UX Issue: Ghost button - low visibility skip link */}
        {!collapsed && (
          <Button
            variant="ghost"
            className="mt-auto ghost-button text-xs justify-start"
            onClick={() => {}}
          >
            Advanced Audit Log
          </Button>
        )}
      </nav>
    </aside>
  );
}
