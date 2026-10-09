import { useEffect, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Loader2, Lock, LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { disableTracking, getVisitorId } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminShell from '@/components/admin/AdminShell';

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background relative overflow-hidden">
    <div className="absolute inset-0 hero-gradient pointer-events-none" />
    <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

const CenteredCard = ({ children }: { children: React.ReactNode }) => (
  <Shell>
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm">{children}</div>
    </div>
  </Shell>
);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Invalid email or password.');
    setSubmitting(false);
  };

  return (
    <CenteredCard>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
          <Lock size={24} />
        </div>
        <h1 className="text-2xl font-display font-bold">
          <span className="gradient-text">Admin</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to the control panel</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>
    </CenteredCard>
  );
};

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Keep this page out of search engines.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = 'Control Panel';
    return () => {
      meta.remove();
      document.title = prevTitle;
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase || !userId) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    setIsAdmin(null);
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (!cancelled) setIsAdmin(!error && data === true);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // The owner's own browser shouldn't count as a visitor.
  useEffect(() => {
    if (!supabase || isAdmin !== true) return;
    disableTracking();
    supabase.rpc('exclude_visitor', { p_visitor_id: getVisitorId() }).then(() => {});
  }, [isAdmin]);

  const signOut = () => supabase?.auth.signOut();

  if (!supabase) {
    return (
      <CenteredCard>
        <p className="text-center text-muted-foreground">
          Supabase is not configured. Set <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>.
        </p>
      </CenteredCard>
    );
  }

  if (!ready || (session && isAdmin === null)) {
    return (
      <Shell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </Shell>
    );
  }

  if (!session) return <LoginForm />;

  if (!isAdmin) {
    return (
      <CenteredCard>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert size={24} />
          </div>
          <p className="text-muted-foreground">This account doesn't have access.</p>
          <Button variant="outline" onClick={signOut}>
            <LogOut /> Sign out
          </Button>
        </div>
      </CenteredCard>
    );
  }

  return (
    <Shell>
      <AdminShell email={session.user.email ?? ''} onSignOut={signOut} />
    </Shell>
  );
};

export default Admin;
