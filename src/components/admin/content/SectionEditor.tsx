import { useCallback, useEffect, useMemo, useState } from 'react';
import { History, Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_CONTENT, mergeContent } from '@/content/ContentContext';
import type { SectionKey } from '@/content/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FieldsForm } from './fields';
import { SCHEMAS } from './schemas';
import { useRevisions, useSaveSections } from './useSiteContent';

type Obj = Record<string, unknown>;

const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const timeAgo = (iso?: string) => {
  if (!iso) return 'never';
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400)}d ago`;
  return dateTimeFmt.format(new Date(iso));
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// Fill anything an old revision lacks from the defaults.
const normalize = (section: SectionKey, data: unknown) => mergeContent({ [section]: data })[section] as unknown as Obj;

const HistoryDialog = ({
  section,
  open,
  onOpenChange,
  current,
  onLoad,
}: {
  section: SectionKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: Obj;
  onLoad: (data: Obj) => void;
}) => {
  const { data, isLoading, error } = useRevisions(section, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>
            Every save is kept (last 50). Loading a version puts it in the editor; nothing changes on the site until
            you save.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive py-6">{(error as Error).message}</p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground py-6">No saved versions yet.</p>
          ) : (
            <ul className="divide-y divide-border/50">
              {data.map((rev) => {
                const isCurrent = same(normalize(section, rev.data), current);
                return (
                  <li key={rev.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground flex items-center gap-2">
                        {dateTimeFmt.format(new Date(rev.created_at))}
                        {isCurrent && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                            Live
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {rev.note ?? `${timeAgo(rev.created_at)}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isCurrent}
                      onClick={() => {
                        onLoad(normalize(section, rev.data));
                        onOpenChange(false);
                      }}
                    >
                      Load
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SectionEditor = ({
  section,
  data,
  updatedAt,
  onDirtyChange,
}: {
  section: SectionKey;
  data: Obj;
  updatedAt?: string;
  onDirtyChange: (dirty: boolean) => void;
}) => {
  const schema = SCHEMAS[section];
  const [draft, setDraft] = useState<Obj>(data);
  const [historyOpen, setHistoryOpen] = useState(false);
  const save = useSaveSections();

  // A fresh copy from the server (e.g. after saving) resets the editor.
  useEffect(() => setDraft(data), [data]);

  const dirty = useMemo(() => !same(draft, data), [draft, data]);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const onSave = useCallback(() => {
    save.mutate(
      { [section]: draft },
      {
        onSuccess: () => toast.success(`${schema.title} saved. It's live on the site.`),
        onError: (e) => toast.error(`Couldn't save: ${(e as Error).message}`),
      },
    );
  }, [save, section, draft, schema.title]);

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty && !save.isPending) onSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, save.isPending, onSave]);

  return (
    <div className="pb-28">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">{schema.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{schema.description}</p>
          <p className="text-xs text-muted-foreground/80 mt-1">Last saved {timeAgo(updatedAt)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
            <History />
            History
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw />
                Original
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Load the original content?</AlertDialogTitle>
                <AlertDialogDescription>
                  This puts the content the site had before the control panel into the editor. Nothing changes on the
                  site until you save, and your current version stays in the history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setDraft(structuredClone(DEFAULT_CONTENT[section]) as unknown as Obj);
                    toast('Original content loaded. Save to publish it.');
                  }}
                >
                  Load original
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 md:p-6">
        <FieldsForm fields={schema.fields} value={draft} onChange={setDraft} />
      </div>

      {/* Save bar */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 transition-transform duration-300 ${
          dirty ? 'translate-y-0' : 'translate-y-[120%]'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="rounded-xl border border-primary/40 bg-card/95 backdrop-blur-xl shadow-2xl p-3 flex items-center justify-between gap-3">
            <span className="text-sm text-foreground ps-1">
              Unsaved changes <span className="hidden sm:inline text-muted-foreground">· Ctrl+S to save</span>
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDraft(data)} disabled={save.isPending}>
                Discard
              </Button>
              <Button size="sm" onClick={onSave} disabled={save.isPending}>
                {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                Save & publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <HistoryDialog
        section={section}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        current={data}
        onLoad={(d) => {
          setDraft(d);
          toast('Version loaded. Save to publish it.');
        }}
      />
    </div>
  );
};

export default SectionEditor;
