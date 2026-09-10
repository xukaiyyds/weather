export default async function handler(req, res) {
  // 统一 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'public, max-age=300',
  };

  // 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).set(corsHeaders).end();
  }

  // 关键修复：从 req.url 解析 pathname 和 search
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `https://${host}`);
  const pathname = url.pathname;
  const search = url.search;

  if (!pathname.startsWith('/api/proxy')) {
    return res.status(404).set(corsHeaders).json({ error: 'Not Found' });
  }

  const targetPath = pathname.replace('/api/proxy', '');
  const targetUrl = `https://weatherapi.market.xiaomi.com/wtr-v3${targetPath}${search}`;

  console.log(`[Proxy] Forwarding to: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0',
      },
    });

    console.log(`[Proxy] Target status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).set(corsHeaders).json({
        error: `Target API responded with ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).set(corsHeaders).json(data);

  } catch (error) {
    console.error('[Proxy] Fetch error:', error);
    return res.status(500).set(corsHeaders).json({
      error: 'Proxy request failed',
      message: error.message,
    });
  }
}