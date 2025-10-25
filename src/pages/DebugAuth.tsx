import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentUserHistory, getUserTestHistory } from '@/lib/supabaseOperations'
import { getCurrentUser } from '@/lib/supabaseClient'

export default function DebugAuth() {
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const u = await getCurrentUser()
      setUser(u)

      // Try both convenience helpers
      const res = await getCurrentUserHistory()
      setHistory(res)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Dev Debug: Auth & History</h1>
        <div className="mb-4">
          <Button onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Load'}</Button>
        </div>

        {error && <Card className="p-4 text-red-600">Error: {error}</Card>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h2 className="font-semibold mb-2">Current User</h2>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(user, null, 2)}</pre>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold mb-2">getCurrentUserHistory()</h2>
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(history, null, 2)}</pre>
          </Card>
        </div>
      </div>
    </div>
  )
}
