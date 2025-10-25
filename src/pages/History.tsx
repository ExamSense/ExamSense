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
          // Normalize history items so the UI can handle both old and new response shapes
            const normalize = (item: any) => {
            // New formatted shape from getUserHistory: { testId, subject: { name }, score, totalQuestions, percentage, dates: { taken } }
            // Older/raw rows may have: { id, subjects, score, total_questions, percentage, date_taken or taken_at }
            const id = item.testId || item.id || item.test_id || item.testId;
            const subjectName = item.subject?.name || item.subjectName || item.subjects?.name || item.subject_name || item.subject || 'Subject';
            const taken = item.dates?.taken || item.date_taken || item.taken_at || item.taken || item.date || item.completed_at || null;
            const score = item.score ?? item.correct ?? null;
            const total = item.totalQuestions ?? item.total_questions ?? item.total ?? null;
            const percentage = (item.percentage ?? (score != null && total ? (score / total) * 100 : null));

            return {
              id,
              subjectName,
              taken,
              score,
              total,
              percentage
            };
          };

          const data = (res.data || []).map(normalize);
          setHistory(data);
        } else if (res && !res.success) {
          // Show message coming from the helper including any underlying error
          const msg = [res.message, res.error].filter(Boolean).join(' - ') || 'Failed to load history';
          setError(msg);
        } else {
          // older helper returns array directly (raw rows)
          const normalize = (item: any) => {
            const id = item.id || item.testId || item.test_id;
            const subjectName = item.subjects?.name || item.subject_name || item.subject || 'Subject';
            const taken = item.date_taken || item.taken_at || item.taken || item.date || null;
            const score = item.score ?? null;
            const total = item.total_questions ?? item.totalQuestions ?? item.total ?? null;
            const percentage = item.percentage ?? (score != null && total ? (score / total) * 100 : null);
            return { id, subjectName, taken, score, total, percentage };
          };

          setHistory((res || []).map(normalize));
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
          {history.map((test: any, idx: number) => (
            <Card key={test.id || idx} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{test.subjectName || 'Subject'}</div>
                  <div className="text-sm text-muted-foreground">Taken: {test.taken ? new Date(test.taken).toLocaleString() : 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">{typeof test.percentage === 'number' ? Math.round(test.percentage) : (test.percentage ?? 'N/A')}%</div>
                  <div className="text-sm text-muted-foreground">{test.score ?? '0'}/{test.total ?? '-'}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
