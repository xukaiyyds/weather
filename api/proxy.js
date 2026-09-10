export default async function handler(req, res) {
  // 统一设置 CORS 头，确保任何响应都包含
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'public, max-age=300',
  };

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(corsHeaders).end();
  }

  // 为所有响应设置 CORS 头
  res.setHeaders(corsHeaders);

  const { pathname, search } = req;

  if (!pathname.startsWith('/api/proxy')) {
    return res.status(404).json({ error: 'Not Found' });
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

    console.log(`[Proxy] Response status: ${response.status}`);

    // 如果目标API返回错误，将错误信息一并返回
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy] Target API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({
        error: `Target API responded with status ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('[Proxy] Fetch error:', error); // 关键：在Vercel日志中查看此错误
    return res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}