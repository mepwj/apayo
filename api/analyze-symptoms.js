export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('요청 받음:', req.body);
    
    // 환경변수 확인
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다');
      return res.status(500).json({ 
        error: 'OpenAI API 키가 설정되지 않았습니다',
        predictions: [{
          name: "설정 오류",
          probability: 0.5,
          urgency: "normal",
          specialists: ["내과"],
          description: "서버 설정에 문제가 있습니다. 관리자에게 문의하세요."
        }]
      });
    }

    const { bodyPart, symptoms, severity } = req.body;

    if (!bodyPart || !symptoms || !Array.isArray(symptoms) || typeof severity !== 'number') {
      console.error('잘못된 요청 데이터:', { bodyPart, symptoms, severity });
      return res.status(400).json({ 
        error: 'Invalid request body',
        predictions: [{
          name: "요청 오류",
          probability: 0.5,
          urgency: "normal",
          specialists: ["내과"],
          description: "요청 데이터가 올바르지 않습니다."
        }]
      });
    }

    console.log('OpenAI API 호출 시작...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `당신은 의료 증상 분석 AI입니다. 주어진 신체 부위와 증상을 분석하여 가능한 질환을 예측해주세요.

응답은 반드시 다음 JSON 형식으로만 답변해주세요:
{
  "predictions": [
    {
      "name": "질환명",
      "probability": 0.7,
      "urgency": "normal",
      "specialists": ["내과", "정형외과"],
      "description": "질환에 대한 간단한 설명"
    }
  ]
}

urgency는 "normal", "urgent", "emergency" 중 하나여야 합니다.
가능한 진료과: 내과, 외과, 정형외과, 신경과, 소화기내과, 이비인후과, 피부과, 안과, 산부인과, 소아과, 심장내과, 호흡기내과

중요: 이는 참고용이며 실제 진단은 의료진과 상담하세요.`
          },
          {
            role: 'user',
            content: `신체 부위: ${bodyPart}
증상: ${symptoms.join(', ')}
심각도: ${severity}/10

위 정보를 바탕으로 가능한 질환을 분석해주세요.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    console.log('OpenAI API 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API 오류:', response.status, errorText);
      
      return res.status(500).json({
        error: `OpenAI API 오류: ${response.status}`,
        predictions: [{
          name: "API 오류",
          probability: 0.5,
          urgency: "normal",
          specialists: ["내과"],
          description: "AI 분석 서비스에 일시적 문제가 있습니다. 잠시 후 다시 시도하세요."
        }]
      });
    }

    const data = await response.json();
    console.log('OpenAI 응답 데이터:', data);
    
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('OpenAI 응답이 비어있습니다');
      return res.status(500).json({
        error: 'OpenAI 응답이 비어있습니다',
        predictions: [{
          name: "응답 오류",
          probability: 0.5,
          urgency: "normal",
          specialists: ["내과"],
          description: "AI로부터 응답을 받지 못했습니다."
        }]
      });
    }

    // JSON 파싱 시도
    let analysisResult;
    try {
      // 마크다운 코드 블록 제거
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
      console.log('파싱된 결과:', analysisResult);
    } catch (parseError) {
      console.warn('JSON 파싱 실패:', parseError);
      console.warn('원본 내용:', content);
      
      // JSON 파싱 실패시 기본 응답
      analysisResult = {
        predictions: [
          {
            name: "두통 및 어지러움",
            probability: 0.6,
            urgency: severity >= 8 ? "urgent" : "normal",
            specialists: ["신경과", "내과"],
            description: "정확한 진단을 위해 의료진과 상담하시기 바랍니다."
          }
        ]
      };
    }

    res.status(200).json(analysisResult);

  } catch (error) {
    console.error('전체 오류:', error);
    res.status(500).json({ 
      error: '증상 분석 중 오류가 발생했습니다.',
      details: error.message,
      predictions: [
        {
          name: "시스템 오류",
          probability: 0.5,
          urgency: "normal",
          specialists: ["내과"],
          description: "시스템 오류로 인해 분석할 수 없습니다. 의료진과 직접 상담하세요."
        }
      ]
    });
  }
}