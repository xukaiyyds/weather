export default {
  async fetch(request, env, ctx) {
    // 定义 CORS 头，统一设置，避免遗漏
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // 生产环境建议替换为你的前端域名
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=300',
    };

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // 关键修改：匹配前端实际请求的路径前缀
    if (!url.pathname.startsWith('/api/proxy')) {
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders // 即使 404 也返回 CORS 头
      });
    }

    // 构建小米天气 API 的完整地址
    const targetUrl = 'https://weatherapi.market.xiaomi.com/wtr-v3' + 
      url.pathname.replace('/api/proxy', '') + 
      url.search;

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0',
        },
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
  },
};