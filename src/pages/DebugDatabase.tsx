import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugDatabase() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Check if tables exist
      console.log('=== Test 1: Check Tables ===');
      const tables = ['subjects', 'topics', 'questions', 'test_history', 'user_answers', 'users'];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1);
          testResults[table] = error ? `❌ Error: ${error.message}` : `✅ Exists (${data?.length || 0} rows)`;
        } catch (e: any) {
          testResults[table] = `❌ Error: ${e.message}`;
        }
      }

      // Test 2: Check user authentication
      console.log('=== Test 2: User Auth ===');
      testResults.auth = user ? `✅ Authenticated as ${user.email} (ID: ${user.id})` : '❌ Not authenticated';
      
      // CRITICAL: Check if user exists in users table
      if (user) {
        const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('id, email, full_name')
          .eq('id', user.id)
          .single();
        
        if (userError || !userProfile) {
          testResults.user_profile = `❌ User profile missing in users table! Error: ${userError?.message || 'Not found'}`;
          console.error('❌ CRITICAL: User authenticated but no profile in users table!', userError);
        } else {
          testResults.user_profile = `✅ User profile exists: ${userProfile.email} (${userProfile.full_name || 'No name'})`;
        }
      } else {
        testResults.user_profile = '⚠️ Skipped (not authenticated)';
      }

      // Test 3: Check subjects
      console.log('=== Test 3: Subjects ===');
      const { data: subjects, error: subError } = await supabase
        .from('subjects')
        .select('*');
      testResults.subjects_data = subError 
        ? `❌ Error: ${subError.message}` 
        : `✅ Found ${subjects?.length || 0} subjects: ${subjects?.map(s => s.name).join(', ')}`;

      // Test 4: Test INSERT permission (if authenticated)
      if (user) {
        console.log('=== Test 4: Test Insert Permission ===');
        try {
          const testData = {
            user_id: user.id,
            subject_id: subjects?.[0]?.id || '00000000-0000-0000-0000-000000000000',
            total_questions: 1,
            score: 1,
            time_spent: 60,
            test_type: 'practice'
          };
          
          console.log('Attempting test insert:', testData);
          const { data: insertTest, error: insertError } = await supabase
            .from('test_history')
            .insert(testData)
            .select();

          if (insertError) {
            testResults.insert_test = `❌ Insert failed: ${insertError.message} (Code: ${insertError.code})`;
            console.error('Insert error details:', insertError);
          } else {
            testResults.insert_test = `✅ Insert successful! Test ID: ${insertTest?.[0]?.id}`;
            // Clean up test record
            if (insertTest?.[0]?.id) {
              await supabase.from('test_history').delete().eq('id', insertTest[0].id);
              console.log('Cleaned up test record');
            }
          }
        } catch (e: any) {
          testResults.insert_test = `❌ Exception: ${e.message}`;
        }
      } else {
        testResults.insert_test = '⚠️ Skipped (not authenticated)';
      }

      // Test 5: Check RLS policies
      console.log('=== Test 5: RLS Status ===');
      testResults.rls_note = 'RLS policies should allow authenticated users to insert their own test_history';

    } catch (error: any) {
      console.error('Test suite error:', error);
      testResults.error = `❌ ${error.message}`;
    }

    setResults(testResults);
    setLoading(false);
    console.log('=== All Tests Complete ===');
    console.log('Results:', testResults);
  };

  useEffect(() => {
    runTests();
  }, [user]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 Database Debug Tool</h1>
        
        <Button onClick={runTests} disabled={loading} className="mb-4">
          {loading ? 'Running Tests...' : 'Re-run Tests'}
        </Button>

        <div className="space-y-4">
          {Object.entries(results).map(([key, value]) => (
            <Card key={key} className="p-4">
              <div className="font-semibold mb-2 text-sm uppercase text-muted-foreground">
                {key.replace(/_/g, ' ')}
              </div>
              <div className="font-mono text-sm whitespace-pre-wrap">
                {String(value)}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-6 bg-blue-50 dark:bg-blue-950">
          <h2 className="font-bold mb-2">📋 Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>If tables show "❌", you need to run the complete_schema.sql in Supabase SQL Editor</li>
            <li>If auth shows "❌", login first</li>
            <li>If insert_test shows "❌", check the error code:
              <ul className="ml-6 mt-1 list-disc">
                <li><code>42P01</code> = Table doesn't exist</li>
                <li><code>42501</code> = Permission denied (RLS issue)</li>
                <li><code>23503</code> = Foreign key violation (subject_id invalid)</li>
              </ul>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
