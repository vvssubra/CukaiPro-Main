import { useState, useMemo } from 'react';
import { testAuthConnection } from '../../lib/supabase';

function safeUrlSummary(url) {
  if (!url) return { ok: false, reason: 'missing', host: '—', projectRefHint: '—' };
  try {
    const u = new URL(url);
    const host = u.host;
    const ref = host.endsWith('.supabase.co') ? host.replace('.supabase.co', '') : '';
    const projectRefHint = ref ? `${ref.slice(0, 4)}…${ref.slice(-4)}` : '—';
    return { ok: true, reason: 'ok', host, projectRefHint };
  } catch {
    return { ok: false, reason: 'invalid_url', host: '—', projectRefHint: '—' };
  }
}

function safeKeySummary(key) {
  if (!key) return { ok: false, kind: 'missing', length: 0 };
  const s = String(key);
  const kind = s.startsWith('sb_publishable_')
    ? 'publishable'
    : s.startsWith('eyJ')
      ? 'jwt-like'
      : 'unknown';
  return { ok: true, kind, length: s.length };
}

export default function ConfigDebugPage() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const [authTest, setAuthTest] = useState({ status: 'idle', success: null, error: null });

  const urlInfo = useMemo(() => safeUrlSummary(url), [url]);
  const keyInfo = useMemo(() => safeKeySummary(key), [key]);

  const runAuthTest = async () => {
    setAuthTest({ status: 'running', success: null, error: null });
    try {
      const result = await testAuthConnection();
      setAuthTest({ status: 'done', success: result.success, error: result.error || null });
    } catch (err) {
      setAuthTest({ status: 'done', success: false, error: err?.message || 'Unknown error' });
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Debug: Build Config</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Dev-only page. No secrets are shown here.
        </p>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Supabase</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">URL status</span>
                <span className={urlInfo.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                  {urlInfo.ok ? 'OK' : `NOT OK (${urlInfo.reason})`}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Host</span>
                <span className="font-mono text-slate-900 dark:text-white">{urlInfo.host}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Project ref (hint)</span>
                <span className="font-mono text-slate-900 dark:text-white">{urlInfo.projectRefHint}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Anon/publishable key</span>
                <span className={keyInfo.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                  {keyInfo.ok ? `present (${keyInfo.kind}, len=${keyInfo.length})` : 'missing'}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={runAuthTest}
                  disabled={authTest.status === 'running'}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {authTest.status === 'running' ? 'Testing…' : 'Test Auth connection'}
                </button>
                {authTest.status === 'done' && (
                  <div className={`mt-2 text-sm ${authTest.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {authTest.success ? 'Auth reachable.' : `Failed: ${authTest.error || 'Unknown'}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Current app origin (custom domain)</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Use this exact origin in Supabase when using a custom domain. Copy it to <strong>Site URL</strong> and add <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{typeof window !== 'undefined' ? `${window.location.origin}/**` : 'https://your-domain.com/**'}</code> to <strong>Redirect URLs</strong>.
            </p>
            <div className="flex justify-between gap-4 text-sm items-center">
              <span className="text-slate-500 dark:text-slate-400">Origin</span>
              <span className="font-mono text-slate-900 dark:text-white break-all">
                {typeof window !== 'undefined' ? window.location.origin : '—'}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Full checklist: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">docs/CUSTOM_DOMAIN_TROUBLESHOOTING.md</code> in the repo.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">If you see &quot;Failed to fetch&quot; on Sign up / Login</h2>
            <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-2">
              <li><strong>Vercel:</strong> In Supabase → Authentication → URL Configuration, set <span className="font-mono">Site URL</span> to your Vercel domain (e.g. <span className="font-mono">https://your-app.vercel.app</span>) and add it to <span className="font-mono">Redirect URLs</span>.</li>
              <li><strong>Local dev:</strong> Also add <span className="font-mono">http://localhost:3001</span> (or your dev port) to <span className="font-mono">Redirect URLs</span> so sign up/login works when running <span className="font-mono">npm run dev</span>.</li>
              <li><strong>Project paused:</strong> Supabase Dashboard → Project Settings → General. Resume the project if it is paused.</li>
              <li><strong>Env vars:</strong> On Vercel, set <span className="font-mono">VITE_SUPABASE_URL</span> and <span className="font-mono">VITE_SUPABASE_ANON_KEY</span> in Project Settings → Environment Variables, then redeploy.</li>
              <li><strong>Network:</strong> Check firewall / VPN; ensure the Supabase host is reachable.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Monitoring</h2>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-500 dark:text-slate-400">Sentry DSN</span>
              <span className={sentryDsn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>
                {sentryDsn ? 'set' : 'not set'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-custom p-5">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Tips</h2>
            <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
              <li>If Host is <span className="font-mono">—</span> or URL status is NOT OK, fix Vercel env vars and redeploy.</li>
              <li>Vite env vars are baked in at build time; redeploy is required after changing them.</li>
              <li>Use the <span className="font-mono">sb_publishable_…</span> key in the browser (never the secret key).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

