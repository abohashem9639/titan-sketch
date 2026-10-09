import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CONTENT_CACHE_KEY, mergeContent, type ContentRows } from '@/content/ContentContext';
import type { SectionKey, SiteContent } from '@/content/types';

const CONTENT_KEY = ['admin', 'site-content'] as const;

export interface AdminContent {
  content: SiteContent;
  updatedAt: Partial<Record<SectionKey, string>>;
}

export interface Revision {
  id: number;
  created_at: string;
  note: string | null;
  data: Record<string, unknown>;
}

const client = () => {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
};

export const useAdminContent = () =>
  useQuery({
    queryKey: CONTENT_KEY,
    queryFn: async (): Promise<AdminContent> => {
      const { data, error } = await client().from('site_content').select('section, data, updated_at');
      if (error) throw error;
      const rows: ContentRows = {};
      const updatedAt: AdminContent['updatedAt'] = {};
      for (const row of data) {
        rows[row.section as SectionKey] = row.data;
        updatedAt[row.section as SectionKey] = row.updated_at;
      }
      return { content: mergeContent(rows), updatedAt };
    },
    // Never refetch behind the editor's back; saves invalidate explicitly.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

/** Upserts one or more sections. Every write is snapshotted into the revision history by a DB trigger. */
export const useSaveSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sections: Partial<SiteContent>) => {
      const rows = Object.entries(sections).map(([section, data]) => ({ section, data }));
      const { data, error } = await client().from('site_content').upsert(rows).select('section');
      if (error) throw error;
      if ((data?.length ?? 0) !== rows.length) throw new Error('Not all sections were saved.');
    },
    onSuccess: async (_data, sections) => {
      // Make the owner's own browser show the new content right away.
      try {
        localStorage.removeItem(CONTENT_CACHE_KEY);
      } catch {
        // ignore
      }
      await queryClient.invalidateQueries({ queryKey: CONTENT_KEY });
      await Promise.all(
        Object.keys(sections).map((s) => queryClient.invalidateQueries({ queryKey: ['admin', 'revisions', s] })),
      );
    },
  });
};

export const useRevisions = (section: SectionKey, enabled: boolean) =>
  useQuery({
    queryKey: ['admin', 'revisions', section],
    enabled,
    queryFn: async (): Promise<Revision[]> => {
      const { data, error } = await client()
        .from('content_revisions')
        .select('id, created_at, note, data')
        .eq('section', section)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Revision[];
    },
  });
