export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { prompt, userCode } = await req.json();
    
    // 权限校验：在 Vercel 环境变量中设置 ACCESS_CODE，保护你的赠金
    if (userCode !== process.env.ACCESS_CODE) {
      return new Response(JSON.stringify({ error: '授权码错误，请联系管理员开通 699 会员' }), { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY; // 填入你在 AI Studio 复制的 Key
    
    // 这里是你积累的行业知识库：深度系统 Prompt
    const systemPrompt = `你是一位专注给排水20年的高级监理，擅长爆款短视频脚本。
    你的任务是将老板碎碎念的工地内容转化为：
    1. 钩子标题（必须直击业主痛点）。
    2. 拍摄指令（教老板镜头怎么运）。
    3. 硬核台词（专业、避坑、口语化）。
    4. 结尾引导（引导咨询你的给排水设计服务）。`;

    https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n老板输入：${prompt}` }] }]
      })
    });

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;

    // 【核心自主学习功能】：记录老板的输入数据，作为你未来的行业热点分析库
    console.log(`[DATA_LEARNING]: ${new Date().toISOString()} | Input: ${prompt}`);

    return new Response(JSON.stringify({ text: resultText }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '大脑连接异常，请重试' }), { status: 500 });
  }
}
