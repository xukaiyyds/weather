// api/proxy.js
export default async function handler(req, res) {
  // 1. 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', 'https://weather.xukaiyyds.cn'); // 生产环境建议替换为你的前端域名
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'public, max-age=300');

  // 2. 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. 获取请求路径
  const { pathname, search } = req;

  // 4. 只代理 /api/proxy 路径
  if (!pathname.startsWith('/api/proxy')) {
    return res.status(404).json({ error: 'Not Found' });
  }

  // 5. 构建小米天气 API 的完整地址
  const targetPath = pathname.replace('/api/proxy', '');
  const targetUrl = `https://weatherapi.market.xiaomi.com/wtr-v3${targetPath}${search}`;

  try {
    // 6. 转发请求到目标 API
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0',
      },
    });

    const data = await response.json();

    // 7. 返回响应
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}