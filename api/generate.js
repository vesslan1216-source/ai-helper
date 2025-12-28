export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { userCode, prompt } = await req.json();

    // 1. 验证你在 Vercel 设置的 123 授权码
    if (userCode !== process.env.ACCESS_CODE) {
      return new Response(JSON.stringify({ error: '授权码错误' }), { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const sysPrompt = "你是一位专注排水20年的高级监理，熟练的爆款短视频脚本。你的任务是提升碎碎念的工地内容转化为：1. 钩子标题 2. 拍摄指令 3. 硬核词汇 4. 末端引导。";

    // 2. 这是之前报错 404 的核心修复，地址必须完全正确
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${sysPrompt}\n\n老板输入：${prompt}` }] }]
      })
    });

    const data = await response.json();
    
    // 如果 API 钥匙有问题，这里会抓到错误
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    const resultText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ text: resultText }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // 捕获网络或代码执行错误
    return new Response(JSON.stringify({ error: '大脑连接异常，请检查配置' }), { status: 500 });
  }
}
