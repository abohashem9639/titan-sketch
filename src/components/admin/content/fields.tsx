import { useRef, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  ImageOff,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ICON_NAMES, getIcon } from '@/content/icons';
import type { Localized } from '@/content/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Field schema
// ---------------------------------------------------------------------------

type Base = { key: string; label: string; help?: string };

export type Field =
  | (Base & { type: 'localized'; multiline?: boolean })
  | (Base & { type: 'text'; placeholder?: string })
  | (Base & { type: 'number'; min?: number; max?: number; suffix?: string })
  | (Base & { type: 'tags'; placeholder?: string })
  | (Base & { type: 'image' })
  | (Base & { type: 'icon' })
  | (Base & { type: 'color' })
  | (Base & { type: 'group'; fields: Field[] })
  | (Base & {
      type: 'list';
      itemName: string;
      fields: Field[];
      create: () => Record<string, unknown>;
      /** Text shown on the item header. */
      summary?: (item: Record<string, unknown>) => Localized | string | undefined;
      /** Items start collapsed and show a header you can click to open. */
      collapsible?: boolean;
    });

type Obj = Record<string, unknown>;

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

export const emptyText = (): Localized => ({ en: '', ar: '' });

const FULL_WIDTH: Field['type'][] = ['localized', 'tags', 'image', 'group', 'list'];

const summaryText = (v: Localized | string | undefined) =>
  typeof v === 'string' ? v : v?.en?.trim() || v?.ar?.trim() || '';

// Copies an item with fresh ids for it and any nested list items.
const cloneWithNewIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(cloneWithNewIds);
  if (value && typeof value === 'object') {
    const out: Obj = {};
    for (const [k, v] of Object.entries(value)) out[k] = k === 'id' ? newId() : cloneWithNewIds(v);
    return out;
  }
  return value;
};

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

const FieldShell = ({
  label,
  help,
  children,
  aside,
}: {
  label: string;
  help?: string;
  children: ReactNode;
  aside?: ReactNode;
}) => (
  <div className="space-y-2">
    {(label || help || aside) && (
      <div className="flex items-end justify-between gap-3">
        <div>
          {label && <p className="text-sm font-medium text-foreground">{label}</p>}
          {help && <p className="text-xs text-muted-foreground mt-0.5">{help}</p>}
        </div>
        {aside}
      </div>
    )}
    {children}
  </div>
);

// Sits on the side opposite the text, so it never covers what you type.
const LangTag = ({ children, side }: { children: ReactNode; side: 'left' | 'right' }) => (
  <span
    className={`absolute top-2 ${side === 'right' ? 'right-2' : 'left-2'} text-[10px] font-semibold tracking-wider text-muted-foreground/70 pointer-events-none`}
  >
    {children}
  </span>
);

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

const LocalizedControl = ({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: 'localized' }>;
  value: Localized | undefined;
  onChange: (v: Localized) => void;
}) => {
  const v = value ?? emptyText();
  const set = (lang: 'en' | 'ar', text: string) => onChange({ ...v, [lang]: text });
  const Control = field.multiline ? Textarea : Input;
  // Multiline boxes grow with the longer of the two texts.
  const longest = Math.max(v.en?.length ?? 0, v.ar?.length ?? 0);
  const extra = field.multiline ? { rows: Math.min(14, Math.max(3, Math.ceil(longest / 50) + 1)) } : {};
  const arMissing = !v.ar?.trim() && !!v.en?.trim();

  return (
    <FieldShell
      label={field.label}
      help={field.help}
      aside={arMissing ? <span className="text-[11px] text-amber-400/90">Arabic empty: English is shown</span> : undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Control
            {...extra}
            dir="ltr"
            value={v.en ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => set('en', e.target.value)}
            className="pe-10"
          />
          <LangTag side="right">EN</LangTag>
        </div>
        <div className="relative">
          <Control
            {...extra}
            dir="rtl"
            value={v.ar ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => set('ar', e.target.value)}
            className="pe-10"
          />
          <LangTag side="left">AR</LangTag>
        </div>
      </div>
    </FieldShell>
  );
};

const TagsControl = ({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: 'tags' }>;
  value: string[] | undefined;
  onChange: (v: string[]) => void;
}) => {
  const tags = value ?? [];
  const [draft, setDraft] = useState('');
  const dragIndex = useRef<number | null>(null);

  const add = (raw: string) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...tags, ...parts]);
    setDraft('');
  };

  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...tags];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <FieldShell
      label={field.label}
      help={field.help ?? 'Press Enter or comma to add. Drag a tag to reorder it.'}
      aside={<span className="text-xs text-muted-foreground">{tags.length}</span>}
    >
      <div className="rounded-md border border-input bg-background/60 p-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-ring">
        {tags.map((tag, i) => (
          <span
            key={`${i}-${tag}`}
            draggable
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex.current !== null) move(dragIndex.current, i);
              dragIndex.current = null;
            }}
            className="inline-flex items-center gap-1 ps-2.5 pe-1 py-1 text-xs rounded bg-secondary/70 border border-border/60 text-foreground cursor-grab active:cursor-grabbing"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((_, j) => j !== i))}
              className="p-0.5 rounded text-muted-foreground hover:text-destructive"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => {
            const text = e.target.value;
            if (text.endsWith(',')) add(text);
            else setDraft(text);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          onPaste={(e) => {
            const text = e.clipboardData.getData('text');
            if (text.includes(',')) {
              e.preventDefault();
              add(text);
            }
          }}
          placeholder={field.placeholder ?? 'Add…'}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none px-1 py-1 placeholder:text-muted-foreground"
        />
      </div>
    </FieldShell>
  );
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ImageControl = ({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: 'image' }>;
  value: string | undefined;
  onChange: (v: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [broken, setBroken] = useState(false);

  const upload = async (file: File) => {
    if (!supabase) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.');
    if (file.size > MAX_UPLOAD_BYTES) return toast.error('Image must be 5 MB or smaller.');

    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'image';
    const path = `uploads/${Date.now()}-${base}.${ext}`;
    const { error } = await supabase.storage.from('site-assets').upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });
    setUploading(false);
    if (error) return toast.error(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from('site-assets').getPublicUrl(path);
    setBroken(false);
    onChange(data.publicUrl);
    toast.success('Image uploaded. Save the section to publish it.');
  };

  return (
    <FieldShell label={field.label} help={field.help}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="w-16 h-16 shrink-0 rounded-full border-2 border-primary/40 bg-secondary/40 overflow-hidden flex items-center justify-center">
          {value && !broken ? (
            <img src={value} alt="" className="w-full h-full object-cover" onError={() => setBroken(true)} />
          ) : (
            <ImageOff size={20} className="text-muted-foreground" />
          )}
        </div>
        <Input
          dir="ltr"
          value={value ?? ''}
          placeholder="https://… or /images/…"
          onChange={(e) => {
            setBroken(false);
            onChange(e.target.value);
          }}
          className="flex-1"
        />
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = '';
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            Upload
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')} aria-label="Remove image">
              <X />
            </Button>
          )}
        </div>
      </div>
    </FieldShell>
  );
};

const IconControl = ({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: 'icon' }>;
  value: string | undefined;
  onChange: (v: string) => void;
}) => (
  <FieldShell label={field.label} help={field.help}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Choose an icon" />
      </SelectTrigger>
      <SelectContent>
        {ICON_NAMES.map((name) => {
          const Icon = getIcon(name);
          return (
            <SelectItem key={name} value={name}>
              <span className="flex items-center gap-2">
                <Icon size={16} className="text-primary" />
                {name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  </FieldShell>
);

const ColorControl = ({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: 'color' }>;
  value: string | undefined;
  onChange: (v: string) => void;
}) => (
  <FieldShell label={field.label} help={field.help}>
    <div className="flex gap-2">
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value ?? '') ? value : '#06b6d4'}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 rounded-md border border-input bg-transparent p-1 cursor-pointer"
        aria-label={field.label}
      />
      <Input dir="ltr" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="font-mono" />
    </div>
  </FieldShell>
);

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

const IconButton = ({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none ${
      danger ? 'text-destructive bg-destructive/10 hover:bg-destructive/20' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    }`}
  >
    {children}
  </button>
);

const ListControl = ({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: 'list' }>;
  value: Obj[] | undefined;
  onChange: (v: Obj[]) => void;
}) => {
  const items = value ?? [];
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const keyOf = (item: Obj, i: number) => (item.id as string) || `index-${i}`;
  const isOpen = (k: string) => !field.collapsible || open.has(k);
  const toggle = (k: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const update = (i: number, item: Obj) => onChange(items.map((it, j) => (j === i ? item : it)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  const remove = (i: number) => {
    onChange(items.filter((_, j) => j !== i));
    setConfirmDelete(null);
  };
  const duplicate = (i: number) => {
    const copy = cloneWithNewIds(items[i]) as Obj;
    onChange([...items.slice(0, i + 1), copy, ...items.slice(i + 1)]);
    setOpen((s) => new Set(s).add(copy.id as string));
  };
  const add = () => {
    const item = { id: newId(), ...field.create() };
    onChange([...items, item]);
    setOpen((s) => new Set(s).add(item.id as string));
  };

  const allOpen = items.length > 0 && items.every((it, i) => open.has(keyOf(it, i)));
  const inline = !field.collapsible && field.fields.length === 1;
  const inlineField = inline ? ({ ...field.fields[0], label: '' } as Field) : null;

  return (
    <FieldShell
      label={field.label}
      help={field.help}
      aside={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{items.length}</span>
          {field.collapsible && items.length > 1 && (
            <button
              type="button"
              onClick={() => setOpen(allOpen ? new Set() : new Set(items.map(keyOf)))}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              {allOpen ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />}
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-2">
        {items.map((item, i) => {
          const k = keyOf(item, i);
          const expanded = isOpen(k);
          const title = summaryText(field.summary?.(item)) || `${field.itemName} ${i + 1}`;
          const actions = (
            <div className="flex items-center gap-0.5 shrink-0">
              <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                <ChevronUp size={16} />
              </IconButton>
              <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                <ChevronDown size={16} />
              </IconButton>
              <IconButton label="Duplicate" onClick={() => duplicate(i)}>
                <Copy size={15} />
              </IconButton>
              {confirmDelete === k ? (
                <>
                  <IconButton label="Confirm delete" onClick={() => remove(i)} danger>
                    <Trash2 size={15} />
                  </IconButton>
                  <IconButton label="Cancel" onClick={() => setConfirmDelete(null)}>
                    <X size={15} />
                  </IconButton>
                </>
              ) : (
                <IconButton label="Delete" onClick={() => setConfirmDelete(k)}>
                  <Trash2 size={15} />
                </IconButton>
              )}
            </div>
          );

          if (inlineField) {
            const key = inlineField.key;
            return (
              <div key={k} className="rounded-lg border border-border/60 bg-secondary/20 p-2 flex items-start gap-2">
                <span className="text-xs text-muted-foreground tabular-nums w-5 shrink-0 pt-3 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <FieldControl field={inlineField} value={item[key]} onChange={(v) => update(i, { ...item, [key]: v })} />
                </div>
                <div className="pt-1.5">{actions}</div>
              </div>
            );
          }

          return (
            <div key={k} className="rounded-lg border border-border/60 bg-secondary/20">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-xs text-muted-foreground tabular-nums w-5 shrink-0">{i + 1}</span>
                {field.collapsible ? (
                  <button
                    type="button"
                    onClick={() => toggle(k)}
                    className="flex-1 min-w-0 flex items-center gap-2 text-start text-sm font-medium text-foreground hover:text-primary"
                  >
                    <ChevronDown size={16} className={`shrink-0 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                    <span className="truncate">{title}</span>
                  </button>
                ) : (
                  <span className="flex-1 min-w-0 truncate text-xs text-muted-foreground">{field.itemName}</span>
                )}
                {actions}
              </div>
              {expanded && (
                <div className="px-3 pb-4 pt-1 border-t border-border/40">
                  <FieldsForm fields={field.fields} value={item} onChange={(v) => update(i, v)} />
                </div>
              )}
            </div>
          );
        })}
        <Button type="button" variant="outline" size="sm" onClick={add} className="w-full border-dashed">
          <Plus />
          Add {field.itemName}
        </Button>
      </div>
    </FieldShell>
  );
};

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

const FieldControl = ({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) => {
  switch (field.type) {
    case 'localized':
      return <LocalizedControl field={field} value={value as Localized} onChange={onChange} />;
    case 'text':
      return (
        <FieldShell label={field.label} help={field.help}>
          <Input
            dir="ltr"
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </FieldShell>
      );
    case 'number':
      return (
        <FieldShell label={field.label} help={field.help}>
          <div className="relative">
            <Input
              type="number"
              dir="ltr"
              min={field.min}
              max={field.max}
              value={value === undefined || value === null ? '' : String(value)}
              onChange={(e) => {
                const n = e.target.value === '' ? 0 : Number(e.target.value);
                const clamped = Math.min(field.max ?? Infinity, Math.max(field.min ?? -Infinity, n));
                onChange(Number.isFinite(clamped) ? clamped : 0);
              }}
              className={field.suffix ? 'pe-8' : ''}
            />
            {field.suffix && (
              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{field.suffix}</span>
            )}
          </div>
        </FieldShell>
      );
    case 'tags':
      return <TagsControl field={field} value={value as string[]} onChange={onChange} />;
    case 'image':
      return <ImageControl field={field} value={value as string} onChange={onChange} />;
    case 'icon':
      return <IconControl field={field} value={value as string} onChange={onChange} />;
    case 'color':
      return <ColorControl field={field} value={value as string} onChange={onChange} />;
    case 'group':
      return (
        <div className="rounded-xl border border-border/60 p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{field.label}</p>
            {field.help && <p className="text-xs text-muted-foreground mt-0.5">{field.help}</p>}
          </div>
          <FieldsForm fields={field.fields} value={(value as Obj) ?? {}} onChange={onChange} />
        </div>
      );
    case 'list':
      return <ListControl field={field} value={value as Obj[]} onChange={onChange} />;
  }
};

export const FieldsForm = ({
  fields,
  value,
  onChange,
}: {
  fields: Field[];
  value: Obj;
  onChange: (v: Obj) => void;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
    {fields.map((field) => (
      <div key={field.key} className={`min-w-0 ${FULL_WIDTH.includes(field.type) ? 'md:col-span-2' : ''}`}>
        <FieldControl
          field={field}
          value={value?.[field.key]}
          onChange={(v) => onChange({ ...value, [field.key]: v })}
        />
      </div>
    ))}
  </div>
);
