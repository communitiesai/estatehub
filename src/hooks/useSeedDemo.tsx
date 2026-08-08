import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/Toast';
import { Sparkles, Loader2 } from 'lucide-react';

export function useSeedDemo() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function seedDemo(onDone?: () => void) {
    setBusy(true);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-demo-data`;
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ''}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${response.status})`);
      }
      const result = await response.json();
      if (!result.success) throw new Error(result.error ?? 'Seed failed');
      toast(`Demo data loaded: ${result.counts?.properties ?? 0} properties, ${result.counts?.leads ?? 0} leads, ${result.counts?.deals ?? 0} deals`);
      onDone?.();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load demo data', 'error');
    } finally {
      setBusy(false);
    }
  }

  return { seedDemo, busy };
}

export function SeedDemoButton({ onDone, label = 'Load sample data' }: { onDone?: () => void; label?: string }) {
  const { seedDemo, busy } = useSeedDemo();
  return (
    <button className="btn-secondary" onClick={() => seedDemo(onDone)} disabled={busy}>
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {busy ? 'Loading…' : label}
    </button>
  );
}
