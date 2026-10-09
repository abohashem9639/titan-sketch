import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  DatabaseBackup,
  ExternalLink,
  GraduationCap,
  Languages,
  Layers,
  Loader2,
  LogOut,
  Mail,
  Settings,
  Sparkles,
  User,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { SectionKey } from '@/content/types';
import { Button } from '@/components/ui/button';
import VisitorDashboard from './VisitorDashboard';
import SectionEditor from './content/SectionEditor';
import BackupPanel from './content/BackupPanel';
import { useAdminContent } from './content/useSiteContent';

type TabId = 'analytics' | 'backup' | SectionKey;

const GROUPS: { title: string; tabs: { id: TabId; label: string; icon: LucideIcon }[] }[] = [
  { title: 'Insights', tabs: [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] },
  {
    title: 'Content',
    tabs: [
      { id: 'general', label: 'General', icon: Settings },
      { id: 'hero', label: 'Hero', icon: Sparkles },
      { id: 'about', label: 'About', icon: User },
      { id: 'skills', label: 'Skills', icon: Wrench },
      { id: 'experience', label: 'Experience', icon: Briefcase },
      { id: 'projects', label: 'Projects', icon: Layers },
      { id: 'education', label: 'Education', icon: GraduationCap },
      { id: 'additional', label: 'Languages & Soft Skills', icon: Languages },
      { id: 'contact', label: 'Contact', icon: Mail },
    ],
  },
  { title: 'Safety', tabs: [{ id: 'backup', label: 'Backup & Restore', icon: DatabaseBackup }] },
];

const ALL_TABS = GROUPS.flatMap((g) => g.tabs);

const ContentArea = ({ section, onDirtyChange }: { section: SectionKey; onDirtyChange: (d: boolean) => void }) => {
  const { data, isLoading, error, refetch } = useAdminContent();

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-destructive mb-4">Couldn't load content: {(error as Error)?.message}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <SectionEditor
      key={section}
      section={section}
      data={data.content[section] as unknown as Record<string, unknown>}
      updatedAt={data.updatedAt[section]}
      onDirtyChange={onDirtyChange}
    />
  );
};

const AdminShell = ({ email, onSignOut }: { email: string; onSignOut: () => void }) => {
  const [params, setParams] = useSearchParams();
  const tab: TabId = ALL_TABS.find((t) => t.id === params.get('tab'))?.id ?? 'analytics';
  const [dirty, setDirty] = useState(false);
  const onDirtyChange = useCallback((d: boolean) => setDirty(d), []);

  const goTo = (id: TabId) => {
    if (id === tab) return;
    if (dirty && !window.confirm('You have unsaved changes. Leave this section without saving?')) return;
    setDirty(false);
    setParams({ tab: id });
    window.scrollTo({ top: 0 });
  };

  const signOut = () => {
    if (dirty && !window.confirm('You have unsaved changes. Sign out anyway?')) return;
    onSignOut();
  };

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            <span className="gradient-text">Control Panel</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              View site
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut />
            Sign out
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <nav className="lg:w-60 shrink-0">
          <div className="lg:sticky lg:top-6 flex lg:flex-col gap-1 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:pb-0">
            {GROUPS.map((group) => (
              <div key={group.title} className="contents lg:block lg:mb-4">
                <p className="hidden lg:block px-3 mb-1 text-[11px] uppercase tracking-wider text-muted-foreground/70">
                  {group.title}
                </p>
                {group.tabs.map((t) => {
                  const active = t.id === tab;
                  return (
                    <button
                      key={t.id}
                      onClick={() => goTo(t.id)}
                      className={`shrink-0 lg:w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-primary/15 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                      }`}
                    >
                      <t.icon size={16} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          {tab === 'analytics' ? (
            <VisitorDashboard />
          ) : tab === 'backup' ? (
            <BackupPanel />
          ) : (
            <ContentArea section={tab} onDirtyChange={onDirtyChange} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
