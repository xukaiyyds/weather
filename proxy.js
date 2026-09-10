// api/proxy.js
export default async function handler(req, res) {
  // 1. 设置 CORS 头，允许你的前端域名访问
  // 生产环境建议将 * 替换为你的实际前端域名，如 'https://your-site.com'
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. 处理预检请求 (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. 从查询参数中获取目标 URL，并进行编码
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  try {
    // 4. 转发请求到目标 API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // 可以选择性地转发部分请求头，避免转发 Host、Origin 等敏感头
        'User-Agent': req.headers['user-agent'] || 'Vercel Proxy',
      },
      // 对于 POST/PUT 等请求，转发请求体
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // 5. 将目标 API 的响应状态和响应体返回给前端
    const data = await response.text();
    res.status(response.status).send(data);

  } catch (error) {
    // 错误处理
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}