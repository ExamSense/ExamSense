import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentUserHistory, getUserHistory } from '@/lib/supabaseOperations';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // Prefer calling the user-history helper with the currently authenticated user's id
        // from AuthContext to avoid relying on supabase.auth.getUser() which may return null
        // in some session/SSR scenarios.
        let res;
        try {
          res = await getUserHistory(user.id, {});
        } catch (e) {
          // Fall back to convenience helper
          res = await getCurrentUserHistory();
        }
        // Debug information: attach raw response to state if needed
        console.debug('getCurrentUserHistory response:', res);
        console.debug('AuthContext user:', user);

        if (res && res.success) {
          setHistory(res.data || []);
        } else if (res && !res.success) {
          // Show message coming from the helper if available
          const msg = res.message || res.error || 'Failed to load history';
          setError(msg);
        } else {
          // older helper returns array directly
          setHistory(res || []);
        }
      } catch (err: any) {
        console.error('Error loading history:', err);
        setError(err?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-2">Please login to view your test history</h2>
          <div className="flex gap-2">
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">My Test History</h1>

        {loading && <Card className="p-4">Loading history...</Card>}
        {error && <Card className="p-4 text-red-600">Error: {error}</Card>}

        {!loading && history.length === 0 && (
          <Card className="p-6">You have no tests recorded yet.</Card>
        )}

        <div className="space-y-4">
          {history.map((test: any) => (
            <Card key={test.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{test.subjects?.name || test.subject_name || 'Subject'}</div>
                  <div className="text-sm text-muted-foreground">Taken: {new Date(test.taken_at || test.taken || test.date || test.taken_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">{test.percentage ?? Math.round((test.score/test.total_questions)*100) ?? 'N/A'}%</div>
                  <div className="text-sm text-muted-foreground">{test.score}/{test.total_questions || test.total}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
