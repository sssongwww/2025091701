# 🚀 상품 마케팅 컨텐츠 생성기

상품 정보를 입력하면 인스타그램 릴스, 유튜브 숏츠, 블로그용 마케팅 컨텐츠를 자동으로 생성해주는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🎯 현재 구현된 기능

1. **🤖 AI 기반 컨텐츠 생성**
   - **GPT AI 모드**: OpenAI GPT를 활용한 고품질 컨텐츠 생성
   - **로컬 모드**: 내장 알고리즘으로 빠른 컨텐츠 생성
   - 실시간 모드 전환 및 즉시 체험 가능

2. **📝 상품 정보 입력 시스템**
   - 상품명, 카테고리, 타겟 고객층 입력
   - 주요 특징, 가격대, 차별화 포인트 입력
   - 브랜드 톤앤매너 선택 (6가지 옵션)

3. **🎯 플랫폼별 맞춤 컨텐츠**
   - 📱 **인스타그램 릴스**: 해시태그와 이모지가 포함된 SNS 최적화
   - 🎬 **유튜브 숏츠**: 30초 시간대별 대본과 촬영 가이드
   - 📝 **블로그 포스트**: SEO 최적화된 구조화된 상세 리뷰

4. **🔧 유연한 API 키 관리**
   - 기본 API 키로 즉시 체험 (설정 불필요)
   - 개인 API 키 설정 가능 (무제한 사용)
   - 투명한 사용량 표시 및 모니터링

5. **📧 안정적 이메일 자동 전송**
   - 선택적 이메일 주소 입력으로 결과를 이메일로 수신
   - **다중 백업 시스템**: Web3Forms + Formspree 이중 보장
   - **테스트 기능**: 이메일 전송 미리 테스트 가능
   - 전문적인 이메일 템플릿으로 깔끔한 포매팅
   - Gmail, Naver, Outlook 등 주요 서비스 모두 지원

6. **📝 Notion 자동 기록**
   - 생성된 제품 내역을 Notion 데이터베이스에 실시간 저장
   - 체계적인 데이터베이스 구조로 관리
   - 상품 정보, 컨텐츠, 생성 날짜 등 모든 데이터 보관
   - 팀 협업 및 장기 보관에 최적화

7. **💾 스마트 데이터 관리**
   - 상품 정보 및 생성된 컨텐츠 자동 저장 (로컬 + Notion)
   - 히스토리 기능으로 이전 생성 컨텐츠 재사용
   - 원클릭 클립보드 복사

7. **✨ 최적화된 사용자 경험**
   - 완전 반응형 디자인 (모든 디바이스 지원)
   - 실시간 로딩 상태 및 진행률 표시
   - 직관적인 토스트 알림 시스템
   - 에러 핸들링 및 사용자 가이드

### 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Tailwind CSS
- **Icons**: Font Awesome
- **Typography**: Inter Font (Google Fonts)
- **Data Storage**: RESTful Table API

## 🗂️ 프로젝트 구조

```
/
├── index.html          # 메인 페이지
├── js/
│   └── main.js        # 핵심 JavaScript 로직
└── README.md          # 프로젝트 문서
```

## 📊 데이터 모델

### Products 테이블 스키마

| 필드명 | 타입 | 설명 |
|--------|------|------|
| id | text | 고유 식별자 |
| product_name | text | 상품명 |
| category | text | 카테고리 (패션, 뷰티, 생활용품 등) |
| target_audience | text | 타겟 고객층 |
| key_features | array | 주요 특징 배열 |
| price_range | text | 가격대 |
| unique_selling_point | text | 차별화 포인트 |
| brand_tone | text | 브랜드 톤앤매너 |
| instagram_content | rich_text | 생성된 인스타그램 컨텐츠 |
| youtube_content | rich_text | 생성된 유튜브 컨텐츠 |
| blog_content | rich_text | 생성된 블로그 컨텐츠 |

## 🎯 API 엔드포인트

### RESTful Table API 사용

- `GET tables/products` - 상품 목록 조회 (페이지네이션 지원)
- `POST tables/products` - 새 상품 정보 저장
- `GET tables/products/{id}` - 특정 상품 상세 조회
- `PUT tables/products/{id}` - 상품 정보 전체 업데이트
- `PATCH tables/products/{id}` - 상품 정보 부분 업데이트
- `DELETE tables/products/{id}` - 상품 삭제

## 🚀 사용 방법

### 즉시 체험하기
1. **페이지 접속** → **예시 상품 정보 입력** → **바로 AI 컨텐츠 확인**
2. API 키 설정이나 회원가입 없이 **즉시 GPT 기능 체험 가능**

### 기본 사용법
1. **🎯 AI 모드 선택**
   - GPT 모드: 더 정교하고 창의적인 컨텐츠
   - 로컬 모드: 빠르고 안정적인 기본 컨텐츠

2. **📝 상품 정보 입력**
   - 필수 항목들을 모두 입력
   - 주요 특징은 쉼표로 구분하여 입력
   - 차별화 포인트를 구체적으로 작성

3. **🚀 컨텐츠 생성**
   - "AI로 컨텐츠 생성하기" 버튼 클릭
   - 실시간으로 각 플랫폼별 맞춤 컨텐츠 생성

4. **📧 결과 받기 옵션**
   - **이메일**: 컨텐츠를 이메일로 받기 (선택)
   - **Notion**: 데이터베이스에 체계적 보관 (선택)  
   - **화면**: 바로 확인 (기본)
   - 여러 옵션 동시 선택 가능

5. **📋 컨텐츠 활용**
   - 각 플랫폼별 "복사하기" 버튼으로 클립보드 복사
   - 생성된 컨텐츠를 바로 SNS/블로그에 활용
   - 이메일/Notion으로 받은 컨텐츠는 언제든 재활용

6. **🔧 통합 설정**
   - **API 키**: 개인 OpenAI 키 등록 (무제한 사용)
   - **이메일**: EmailJS 자동 전송
   - **Notion**: Integration Token + Database ID 설정

7. **📚 멀티 히스토리 관리**
   - 로컬 브라우저: 즉시 접근 가능한 히스토리
   - Notion: 팀 공유 및 장기 보관
   - 이메일: 개인 아카이브

## 🎨 브랜드 톤앤매너별 특징

- **친근한**: 편안한 말투, 일상적 이모지 사용
- **전문적인**: 정중한 어조, 비즈니스 이모지 활용
- **트렌디한**: 젊은 감각, 역동적 표현
- **고급스러운**: 격조 있는 표현, 프리미엄 이모지
- **재미있는**: 유머러스한 톤, 재미있는 이모지
- **신뢰할 수 있는**: 안정감 있는 어조, 신뢰성 강조

## 📝 Notion 연동 설정 가이드

### 1. Notion Integration 생성
1. [Notion Integrations](https://www.notion.so/my-integrations) 페이지 접속
2. "New integration" 클릭
3. 이름 입력 후 "Submit" 클릭
4. **Internal Integration Token** 복사 (secret_로 시작)

### 2. 데이터베이스 생성 및 설정
1. Notion에서 새 데이터베이스 생성
2. 다음 속성들 추가:
   - 상품명 (Title)
   - 카테고리 (Select)
   - 타겟 고객층 (Select)
   - 주요 특징 (Rich text)
   - 가격대 (Select)
   - 차별화 포인트 (Rich text)
   - 브랜드 톤 (Select)
   - 생성 날짜 (Date)
   - AI 모드 (Select)
   - 상태 (Select)

3. 데이터베이스 페이지에서 "..." → "Add connections" → 생성한 Integration 선택
4. 데이터베이스 URL에서 **32자리 Database ID** 복사

### 3. 웹앱에서 설정
1. 설정 메뉴 → "Notion 자동 기록" 체크
2. Integration Token과 Database ID 입력
3. "설정 저장" 클릭

## 🔒 보안 및 개인정보

### 투명성 정책
- **기본 API 키**: 체험용으로 제공, 사용량 제한 있음
- **개인 API 키**: 브라우저 로컬에만 저장, 외부 전송 안함
- **Notion Token**: 클라이언트에서 직접 Notion API 호출, 중간 서버 경유 안함
- **데이터 보호**: 모든 민감 정보는 로컬 저장, 안전한 HTTPS 통신

### 권장사항
- 🔐 개인 API 키 사용 시 주기적인 키 교체
- 📊 API 사용량 모니터링으로 비용 관리
- 📝 Notion Integration은 필요한 최소 권한만 부여
- 🛡️ 민감한 개인정보는 입력하지 마세요
- 🚫 공개 Notion 페이지에 연동하지 마세요

## 📈 향후 개발 계획

### 🔄 다음 단계 기능

1. **🤖 AI 기능 고도화**
   - GPT-4 모델 지원
   - 트렌드 분석 기반 키워드 자동 추천
   - 실시간 SEO 최적화 제안

2. **🌐 플랫폼 확장**
   - 틱톡 컨텐츠 생성 (15초/60초)
   - 페이스북 포스트 최적화
   - 링크드인 비즈니스 컨텐츠
   - 트위터/X 스레드 생성

3. **📧 커뮤니케이션 고도화**
   - 이메일 예약 발송 기능
   - 여러 이메일 주소 동시 발송
   - Slack, Discord 연동
   - 발송 통계 및 추적

4. **📝 Notion 기능 확장**
   - 자동 태그 분류 시스템
   - 템플릿 기반 페이지 생성
   - 성과 분석 대시보드
   - 팀 워크스페이스 연동

4. **🎨 멀티미디어 지원**
   - AI 이미지 생성 연동
   - 썸네일 자동 생성
   - 브랜드 컬러/폰트 적용

5. **📊 분석 및 최적화**
   - A/B 테스트용 다중 버전 생성
   - 성과 예측 및 최적화 제안
   - 경쟁사 분석 기반 개선점 도출

6. **🔧 고급 기능**
   - 컨텐츠 템플릿 시스템
   - 브랜드별 설정 프로필 저장
   - 일괄 내보내기 (PDF, Excel)
   - 팀 협업 기능

## ⚡ 성능 및 제한사항

### GPT API 모드
- **응답시간**: 3-10초 (OpenAI 서버 상황에 따라 변동)
- **품질**: 높은 창의성과 정확도
- **비용**: API 사용량에 따른 과금 (기본키는 무료 체험)

### 로컬 모드  
- **응답시간**: 즉시 (1초 이내)
- **품질**: 안정적인 기본 품질
- **비용**: 완전 무료

### 이메일 시스템
- **주요 서비스**: Web3Forms (99.9% 전송률)
- **백업 서비스**: Formspree (자동 백업)
- **지원 도메인**: Gmail, Naver, Outlook, Yahoo 등
- **전송 속도**: 1-3초 내 발송, 1분 내 수신

## 🔧 기술 스펙

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **UI Framework**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Typography**: Inter Font (Google Fonts)
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Email Service**: Web3Forms + Formspree (다중 백업 시스템)
- **Notion Integration**: Notion API v2022-06-28
- **Data Storage**: RESTful Table API + Notion Database
- **Security**: Client-side API key encryption

## 🚀 배포 가이드

### Render.com 배포하기 (무료 호스팅)

#### 1단계: Repository 연결
1. [Render.com](https://render.com) 회원가입/로그인
2. "New +" → "Static Site" 선택 ⭐
3. GitHub 저장소 연결

#### 2단계: 배포 설정
```
Environment: Static Site         ⭐ 중요!
Build Command: npm install
Publish Directory: .
Auto-Deploy: Yes
```

#### 3단계: 고급 설정 (선택)
- **Custom Domain**: 원하는 도메인 연결
- **Environment Variables**: API 키 등 민감 정보 (권장하지 않음)

#### ⚠️ 배포 실패 시 해결방법

**문제**: `yarn start` 실패 오류
**해결**: 다음 중 하나 선택

1. **방법 1 - 정적 사이트로 설정** (권장)
   ```
   Environment: Static Site  ← Web Service에서 변경
   Build Command: npm install
   Start Command: (비워두기)
   ```

2. **방법 2 - Web Service 유지**
   ```
   Environment: Web Service
   Build Command: npm install  
   Start Command: npm start
   ```

#### 🌐 배포 완료 후
- 자동 생성된 URL로 접속 (예: `your-app.onrender.com`)
- GitHub 업데이트 시 자동 재배포
- HTTPS 자동 적용

### 다른 배포 옵션

#### Vercel (권장 대안)
1. [Vercel.com](https://vercel.com) 접속
2. GitHub 저장소 연결
3. 자동 배포 (설정 불필요)

#### Netlify
1. [Netlify.com](https://netlify.com) 접속
2. "Sites" → "Add new site" → "Import from Git"
3. 자동 배포

#### GitHub Pages
1. 저장소 Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, Folder: / (root)

## 📞 지원 및 문의

### 즉시 체험
- 설정 없이 바로 GPT 기능 체험 가능
- 예시 데이터로 빠른 테스트
- **이메일 테스트**: 📧 버튼으로 전송 기능 미리 확인
- 이메일 주소 입력으로 결과를 안정적으로 수신

### 문제 해결
- **API 오류**: 설정에서 개인 키 등록
- **느린 속도**: 로컬 모드로 전환
- **품질 개선**: GPT 모드 + 개인 API 키 사용
- **배포 실패**: 위 배포 가이드의 해결방법 참조
- **이메일 전송**: 
  - 성공률 약 70% (무료 서비스 한계)
  - 실패 시 자동으로 텍스트 파일 다운로드
  - 다운로드된 파일을 직접 이메일 첨부하여 전송
  - 중요한 컨텐츠는 Notion 연동 권장
- **Notion 실패**: Integration Token과 Database ID 재확인
- **권한 오류**: Notion Integration에 데이터베이스 권한 부여 확인

---

> 💡 **Pro Tip**: 
> 1. **첫 사용**: GPT 모드로 체험해보세요
> 2. **정기 사용**: 개인 API 키로 무제한 활용
> 3. **빠른 작업**: 로컬 모드로 즉시 생성
> 4. **최고 품질**: 차별화 포인트를 구체적으로 작성하면 더 나은 결과를 얻을 수 있습니다
5. **이메일 활용**: 이메일로 받은 컨텐츠는 보관용으로 활용하고 필요시 재편집하세요
6. **Notion 활용**: Notion 데이터베이스에서 필터링, 검색, 분류로 체계적 관리하세요
7. **팀 협업**: Notion 워크스페이스 공유로 팀원들과 생성 이력을 함께 관리하세요