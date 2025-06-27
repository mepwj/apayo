import type { SymptomAnalysisRequest, SymptomAnalysisResponse } from '../types/index.js';

export async function analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
  // 개발 환경에서는 목업 데이터 사용
  if (import.meta.env.DEV) {
    console.log('개발 환경: 목업 증상 분석 데이터 사용');
    
    // 시뮬레이션된 로딩 시간
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 증상과 부위에 따른 스마트한 목업 응답
    const mockPredictions = generateMockPredictions(request);
    
    return {
      predictions: mockPredictions,
      recommendedAction: "개발 환경입니다. 실제 AI 분석은 배포 후 이용 가능합니다."
    };
  }

  // 프로덕션 환경에서는 서버리스 함수 호출
  try {
    const response = await fetch('/api/analyze-symptoms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bodyPart: request.bodyPart,
        symptoms: request.symptoms,
        severity: request.severity
      })
    });

    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      predictions: data.predictions || [],
      recommendedAction: "의료진과 상담하시기 바랍니다."
    };

  } catch (error) {
    console.error('증상 분석 API 호출 실패:', error);
    
    // 오류 발생시 기본 응답
    return {
      predictions: [
        {
          name: "분석 오류",
          probability: 0.5,
          urgency: request.severity >= 8 ? "urgent" : "normal",
          specialists: ["내과"],
          description: "시스템 오류로 인해 분석할 수 없습니다. 의료진과 직접 상담하세요."
        }
      ],
      recommendedAction: "의료진과 직접 상담하시기 바랍니다."
    };
  }
}

// 개발 환경용 스마트 목업 데이터 생성
function generateMockPredictions(request: SymptomAnalysisRequest) {
  const { bodyPart, symptoms, severity } = request;
  
  // 신체 부위별 일반적인 질환 매핑
  const bodyPartDiseases: { [key: string]: any[] } = {
    '머리': [
      { name: '긴장성 두통', specialists: ['신경과', '내과'], description: '스트레스나 근육 긴장으로 인한 두통' },
      { name: '편두통', specialists: ['신경과'], description: '혈관성 두통의 일종' },
      { name: '군집성 두통', specialists: ['신경과'], description: '극심한 일측성 두통' }
    ],
    '목': [
      { name: '목 근육 긴장', specialists: ['정형외과', '재활의학과'], description: '목 주변 근육의 경직과 통증' },
      { name: '거북목 증후군', specialists: ['정형외과'], description: '잘못된 자세로 인한 목 변형' }
    ],
    '가슴': [
      { name: '늑간신경통', specialists: ['내과', '정형외과'], description: '갈비뼈 사이 신경의 염증' },
      { name: '역류성 식도염', specialists: ['소화기내과'], description: '위산이 식도로 역류하여 발생' }
    ],
    '배': [
      { name: '급성 위염', specialists: ['소화기내과', '내과'], description: '위 점막의 급성 염증' },
      { name: '과민성 대장 증후군', specialists: ['소화기내과'], description: '장의 기능적 이상' },
      { name: '소화불량', specialists: ['내과', '소화기내과'], description: '소화 기능의 저하' }
    ],
    '허리': [
      { name: '요추 염좌', specialists: ['정형외과', '재활의학과'], description: '허리 근육이나 인대의 손상' },
      { name: '디스크 탈출증', specialists: ['정형외과', '신경외과'], description: '추간판의 탈출로 인한 신경 압박' }
    ]
  };

  const relevantDiseases = bodyPartDiseases[bodyPart] || [
    { name: '근골격계 이상', specialists: ['내과', '정형외과'], description: '근육이나 뼈의 문제로 추정' }
  ];

  // 심각도에 따른 긴급도 결정
  const getUrgency = (severity: number): 'emergency' | 'urgent' | 'normal' => {
    if (severity >= 8) return 'urgent';
    if (severity >= 6) return 'normal';
    return 'normal';
  };

  // 증상 키워드에 따른 확률 조정
  const hasInflammationSymptoms = symptoms.some(s => 
    s.includes('열') || s.includes('붓기') || s.includes('염증')
  );
  const hasPainSymptoms = symptoms.some(s => 
    s.includes('아픔') || s.includes('통증') || s.includes('쑤심')
  );

  return relevantDiseases.slice(0, 3).map((disease, index) => ({
    name: disease.name,
    probability: Math.max(0.3, 0.8 - (index * 0.2) + (hasInflammationSymptoms ? 0.1 : 0) + (hasPainSymptoms ? 0.1 : 0)),
    urgency: index === 0 ? getUrgency(severity) : 'normal',
    specialists: disease.specialists,
    description: `${disease.description} (개발 환경 목업 데이터)`
  }));
}