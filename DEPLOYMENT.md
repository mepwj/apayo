# 🚀 APAYO Vercel 배포 가이드

## 📋 배포 전 체크리스트

### 1. API 키 보안 설정

#### ✅ OpenAI API 키 (서버사이드 - 완전 보안)
- ❌ 클라이언트에 노출되지 않음
- ✅ Vercel 환경변수로만 설정

#### ✅ Google Maps API 키 (클라이언트사이드 - 도메인 제한)
- ⚠️ 클라이언트에 노출됨
- ✅ Google Cloud Console에서 도메인 제한 설정 필요

#### ✅ Kakao API 키 (클라이언트사이드 - 도메인 제한)
- ⚠️ 클라이언트에 노출됨
- ✅ Kakao Developers에서 도메인 제한 설정 필요

## 🔧 Vercel 환경변수 설정

### Vercel Dashboard에서 설정:

1. **Project Settings** → **Environment Variables**

2. **서버 전용 환경변수:**
```
Name: OPENAI_API_KEY
Value: sk-proj-your-openai-api-key-here
Environment: Production, Preview, Development
```

3. **클라이언트 환경변수:**
```
Name: VITE_GOOGLE_MAPS_API_KEY
Value: your-google-maps-api-key
Environment: Production, Preview, Development

Name: VITE_KAKAO_REST_API_KEY
Value: your-kakao-rest-api-key
Environment: Production, Preview, Development
```

## 🔒 API 키 도메인 제한 설정

### Google Maps API:

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **APIs & Services** → **Credentials**
3. API 키 선택 → **Application restrictions**
4. **HTTP referrers (web sites)** 선택
5. 허용 도메인 추가:
   ```
   https://your-project.vercel.app/*
   https://*.vercel.app/*  (프리뷰 배포용)
   http://localhost:*      (로컬 개발용)
   ```

### Kakao Local API:

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. **내 애플리케이션** → 해당 앱 선택
3. **플랫폼** → **Web** 설정
4. **사이트 도메인** 추가:
   ```
   https://your-project.vercel.app
   http://localhost:5173
   http://localhost:5174
   ```

## 📦 배포 명령어

### CLI를 통한 배포:

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 연결 및 배포
vercel

# 프로덕션 배포
vercel --prod
```

### GitHub 연동 배포:

1. GitHub 저장소에 코드 푸시
2. [Vercel Dashboard](https://vercel.com/dashboard)에서 **New Project**
3. GitHub 저장소 선택
4. 환경변수 설정 후 배포

## 🔍 배포 후 확인사항

### ✅ 기능 테스트:
- [ ] 신체 부위 선택 작동
- [ ] 증상 선택 및 AI 분석 작동
- [ ] 현재 위치 기반 병원 검색 작동
- [ ] Google Maps 표시 및 마커 작동
- [ ] 전화걸기, 길찾기 링크 작동

### ✅ 보안 확인:
- [ ] 개발자 도구에서 OpenAI API 키 노출 여부 확인
- [ ] API 호출이 서버리스 함수를 통해 이루어지는지 확인
- [ ] Google Maps, Kakao API가 도메인 제한되었는지 확인

### ✅ 성능 확인:
- [ ] 페이지 로딩 속도
- [ ] API 응답 시간
- [ ] 모바일 반응형 확인

## 🚨 보안 모범 사례

### 1. 환경변수 관리
```bash
# ❌ 절대 하지 말 것
VITE_OPENAI_API_KEY=sk-proj-...  # 클라이언트에 노출됨!

# ✅ 올바른 방법
OPENAI_API_KEY=sk-proj-...       # 서버 전용
```

### 2. API 키 로테이션
- 정기적으로 API 키 교체 (월 1회 권장)
- 이전 키 비활성화 전 새 키 테스트

### 3. 모니터링
- Vercel Analytics로 사용량 모니터링
- API 사용량 제한 설정
- 이상 트래픽 알림 설정

## 📞 문제 해결

### API 키 관련 오류:
```
Error: OpenAI API key not found
→ Vercel 환경변수에 OPENAI_API_KEY 설정 확인

Error: Google Maps failed to load
→ 도메인 제한 설정 및 API 키 유효성 확인

CORS Error
→ 서버리스 함수의 CORS 헤더 설정 확인
```

### 배포 관련 오류:
```
Build failed
→ package.json dependencies 확인
→ TypeScript 오류 수정

Function timeout
→ vercel.json에서 maxDuration 설정 확인
```

## 📈 성능 최적화

### 1. 번들 크기 최적화
```bash
# 번들 분석
npm run build
npx vite-bundle-analyzer dist
```

### 2. API 캐싱
- 병원 검색 결과 로컬 캐싱
- 중복 API 호출 방지

### 3. 이미지 최적화
- Vercel Image Optimization 활용
- WebP 포맷 사용

---

🎉 **배포 완료 후 실제 의료 서비스 수준의 APAYO를 경험해보세요!**