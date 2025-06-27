# 아파요 (APAYO) - 증상 검색 웹 서비스

3클릭으로 찾는 내 증상, 내 병원

## 프로젝트 소개

아파요는 사용자가 신체 부위와 증상을 선택하면 AI 기반으로 가능한 질환을 분석하고, 적절한 병원을 추천해주는 웹 서비스입니다.

## 주요 기능

- 시각적 신체 부위 선택
- 증상 체크 및 심각도 설정
- OpenAI 기반 증상 분석 및 질환 예측
- AI 추천 진료과 기반 병원 검색
- 원터치 병원 연결 (전화, 길찾기)

## 기술 스택

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Query
- Zustand
- OpenAI API
- Google Maps API (예정)

## 설치 및 실행

1. 저장소 클론
```bash
git clone [repository-url]
cd apayo
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
```
`.env` 파일을 열어 OpenAI API 키를 설정합니다.

4. 개발 서버 실행
```bash
npm run dev
```

## 환경 변수 설정

- `VITE_OPENAI_API_KEY`: OpenAI API 키 (필수)
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API 키 (선택)

## 프로젝트 구조

```
src/
├── components/     # React 컴포넌트
├── pages/         # 페이지 컴포넌트
├── services/      # API 서비스
├── store/         # Zustand 상태 관리
├── types/         # TypeScript 타입 정의
├── data/          # 정적 데이터
└── utils/         # 유틸리티 함수
```

## 개발 현황

- ✅ 기본 UI/UX 구현
- ✅ 신체 부위 선택 기능
- ✅ 증상 선택 및 심각도 설정
- ✅ AI 기반 분석 결과 표시
- ✅ 병원 목록 및 연결 기능
- ⏳ Google Maps 연동
- ⏳ 실제 병원 데이터 연동
- ⏳ 반응형 디자인 최적화

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.