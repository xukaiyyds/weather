export default async function handler(req, res) {
  // 1. 设置 CORS 头（放在最前面，确保所有响应都带上）
  res.setHeader('Access-Control-Allow-Origin', '*'); // 生产环境建议改为你的前端域名
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'public, max-age=300');

  // 2. 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. 获取请求路径和查询参数
  const { pathname, search } = req;

  // 4. 检查路径前缀
  if (!pathname.startsWith('/api/proxy')) {
    return res.status(404).json({ error: 'Not Found' });
  }

  // 5. 构建目标 URL
  const targetPath = pathname.replace('/api/proxy', '');
  const targetUrl = `https://weatherapi.market.xiaomi.com/wtr-v3${targetPath}${search}`;

  try {
    // 6. 转发请求
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0',
      },
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    // 即使出错也要返回 CORS 头，否则前端看不到具体错误
    res.status(500).json({ error: error.message });
  }
}