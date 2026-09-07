import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!url) return alert('Website URL din');
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'Arial', padding: 20 }}>
      <h1>🔍 Lead Verifier</h1>
      <p>Website URL din, pain points ar cold email pabe</p>

      <input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ padding: 10, width: '65%', marginRight: 10 }}
      />
      <button onClick={handleAnalyze} disabled={loading} style={{ padding: 10 }}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {result && (
        <div style={{ marginTop: 30, border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
          {result.error ? (
            <p style={{ color: 'red' }}>{result.error}</p>
          ) : (
            <>
              <h2>{result.url}</h2>
              <img src={result.screenshot} alt="screenshot" width="100%" style={{ borderRadius: 8 }} />
              <p><b>Performance Score:</b> {result.performanceScore}/100</p>
              <p><b>Mobile Friendly:</b> {result.mobileFriendly ? 'Yes' : 'No'}</p>
              <h3>Pain Points:</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{result.painPoints}</pre>
              <h3>Cold Email Draft:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 10, borderRadius: 6 }}>
                {result.emailDraft}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
