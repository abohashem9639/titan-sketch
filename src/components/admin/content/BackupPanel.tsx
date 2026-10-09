import { useRef, useState } from 'react';
import { Download, GitBranch, History, Loader2, RotateCcw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_CONTENT } from '@/content/ContentContext';
import { SECTION_KEYS, type SectionKey, type SiteContent } from '@/content/types';
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
} from '@/components/ui/alert-dialog';
import { SCHEMAS } from './schemas';
import { useAdminContent, useSaveSections } from './useSiteContent';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

// Accepts a file made by "Download backup" or a bare { section: data } object.
const parseBackup = (text: string): Partial<SiteContent> => {
  const json = JSON.parse(text);
  const source = isPlainObject(json) && isPlainObject(json.content) ? json.content : json;
  if (!isPlainObject(source)) throw new Error('Not a backup file.');
  const sections = Object.fromEntries(
    SECTION_KEYS.filter((k) => isPlainObject(source[k])).map((k) => [k, source[k]]),
  ) as Partial<SiteContent>;
  if (!Object.keys(sections).length) throw new Error('No site sections found in this file.');
  return sections;
};

const Card = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Download;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="glass-card rounded-2xl p-6">
    <div className="flex items-center gap-2 mb-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <h3 className="font-display font-semibold text-foreground">{title}</h3>
    </div>
    {children}
  </div>
);

const BackupPanel = () => {
  const { data } = useAdminContent();
  const save = useSaveSections();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ title: string; description: string; sections: Partial<SiteContent> } | null>(
    null,
  );

  const download = () => {
    if (!data) return;
    const payload = { exportedAt: new Date().toISOString(), version: 1, content: data.content };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (file: File) => {
    try {
      const sections = parseBackup(await file.text());
      const names = (Object.keys(sections) as SectionKey[]).map((k) => SCHEMAS[k].title).join(', ');
      setPending({
        title: 'Restore from this backup?',
        description: `These sections will be replaced and published: ${names}. The current versions stay in each section's history.`,
        sections,
      });
    } catch (e) {
      toast.error(`Couldn't read the file: ${(e as Error).message}`);
    }
  };

  const apply = () => {
    if (!pending) return;
    save.mutate(pending.sections, {
      onSuccess: () => toast.success('Restored and published.'),
      onError: (e) => toast.error(`Restore failed: ${(e as Error).message}`),
    });
    setPending(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Backup & Restore</h2>
        <p className="text-sm text-muted-foreground mt-1">Download, restore, or go back to the original content.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card icon={Download} title="Download backup">
          <p className="text-sm text-muted-foreground mb-4">
            Saves all site content as a JSON file you can keep or restore later.
          </p>
          <Button onClick={download} disabled={!data}>
            <Download />
            Download backup
          </Button>
        </Card>

        <Card icon={Upload} title="Restore from a file">
          <p className="text-sm text-muted-foreground mb-4">Replaces the content with a backup file you downloaded.</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
              e.target.value = '';
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
            Choose backup file
          </Button>
        </Card>

        <Card icon={RotateCcw} title="Restore original content">
          <p className="text-sm text-muted-foreground mb-4">
            Puts back exactly what the site showed before the control panel existed, for every section.
          </p>
          <Button
            variant="outline"
            disabled={save.isPending}
            onClick={() =>
              setPending({
                title: 'Restore the original content?',
                description:
                  'Every section goes back to the content the site had before the control panel. The current versions stay in each section’s history, so you can undo this.',
                sections: structuredClone(DEFAULT_CONTENT),
              })
            }
          >
            <RotateCcw />
            Restore original
          </Button>
        </Card>

        <Card icon={History} title="Version history">
          <p className="text-sm text-muted-foreground">
            Every save keeps a version (the last 50 per section). Open any section and click{' '}
            <span className="text-foreground">History</span> to roll back a single change.
          </p>
        </Card>

        <div className="md:col-span-2">
          <Card icon={GitBranch} title="Going back to the old (static) site">
            <p className="text-sm text-muted-foreground">
              The site's code from before the control panel is saved on GitHub as the tag{' '}
              <code className="text-foreground">backup/pre-cms</code> and the branch{' '}
              <code className="text-foreground">backup/static-content</code>. Deploying that branch brings back the old
              version with all content in the code.
            </p>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pending?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pending?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={apply}>Restore & publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BackupPanel;
