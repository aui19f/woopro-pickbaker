# Pickbaker

베이커리 레시피 공유 & 오프라인 이벤트 커뮤니티 웹 앱 (PWA)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| 인증 | Supabase Auth |
| 스토리지 | Supabase Storage (presigned URL 업로드) |
| 데이터베이스 | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| 유효성 검사 | Zod |
| 배포 | Vercel |

---

## 개발 완료 기능

### 인증
- Supabase Auth 기반 이메일 회원가입 / 로그인
- Next.js middleware 인증 가드 — 미인증 접근 시 `/login` 리디렉션
- 로그인 유도 모달 (비로그인 상태에서 글쓰기 시도 시)

### 피드 (`/feed`)
- 전체 피드 포스트 목록 조회 (DB 연동)
- 이미지 다중 첨부 & 슬라이더 (pan/zoom 지원, iOS 줌 방지)
- 해시태그 표시
- 좋아요 / 북마크 토글 (DB 반영, 아이콘 카운트 표시)
- 댓글 모달
- 작성 포스트를 피드에서 즉시 확인

### 피드 글쓰기 (`/write/feed`)
- 텍스트 + 이미지 업로드 폼
- Supabase Storage presigned URL 방식 이미지 업로드
- 해시태그 입력

### 레시피 (`/recipe`)
- 레시피 목록 카드 조회
- 레시피 상세 모달 (인터셉팅 라우트 `@modal`)
- 카테고리: 빵 / 케이크 / 쿠키·구움과자 / 페이스트리 / 타르트 / 도넛 / 머핀·스콘 / 기타
- 재료 목록 & 단계별 스텝
- 좋아요 / 북마크 / 댓글

### 레시피 작성 (`/write/recipe`)
- 제목, 카테고리, 기준 인원, 재료 목록, 스텝, 메모, 외부 링크 입력

### 오프라인 이벤트 (`/offline`)
- 이벤트 목록 조회
- 이벤트 상세 모달 (인터셉팅 라우트 `@modal`)
- 날짜 범위 & 운영 시간 (요일별 개별 시간 or 동일 시간)
- 포스터 이미지, 입장료, 위치, SNS 링크(Instagram·X·웹사이트)
- 좋아요 / 북마크 / 참가(Join) 토글 (DB 반영)
- **작성자·ADMIN 전용** 수정(Edit) / 소프트 삭제(status="deleted")
- 점 세 개 메뉴(DotsMenu)에서 수정·삭제 접근

### 오프라인 이벤트 작성 (`/write/offline`) — ADMIN 전용
- 전체 폼: 날짜 범위, 시간 입력(공통/요일별), 위치, 입장료, 포스터 업로드, SNS 링크

### 마이페이지 (`/:username`)
- 내가 쓴 글 탭 (피드 포스트 / 레시피 / 오프라인 이벤트)
- 저장(북마크)한 글 탭
- 사용자별 URL

### 글쓰기 버튼 (하단 네비)
- 현재 탭(피드/레시피)에서 바로 해당 작성 페이지로 이동
- 오프라인 탭에서는 ADMIN이면 바로 이동, 일반 유저는 타입 선택 바텀시트 표시
- 그 외 탭에서는 작성 타입 선택 바텀시트 (피드 / 레시피)

### PWA / 앱 경험
- 파비콘, 앱 아이콘 (pickbaker.png), 스플래시 스크린
- `next/manifest` 기반 Web App Manifest
- iOS safe-area 지원 (`pb-safe`, `env(safe-area-inset-*)`)
- 로딩 오버레이 (페이지 전환 시 스피너)

---

## 데이터 모델 (Prisma)

```
User              — 인증 계정 (role: USER / OWNER / ADMIN, status: ACTIVE / WITHDRAWN)
├─ Post           — 피드 포스트
│   ├─ PostMedia  — 첨부 이미지/영상
│   ├─ PostTag    — 해시태그
│   ├─ PostLike
│   ├─ PostBookmark
│   └─ PostComment
├─ Recipe         — 레시피
│   ├─ RecipeImage
│   ├─ RecipeIngredient
│   ├─ RecipeStep
│   ├─ RecipeLike
│   ├─ RecipeBookmark
│   └─ RecipeComment
├─ OfflineEvent   — 오프라인 이벤트
│   ├─ OfflineEventLike
│   ├─ OfflineEventBookmark
│   └─ OfflineEventJoin
└─ UserEquipment  — 보유 제빵 장비 (오븐 / 믹서 / 핸드믹서 / 발효기 / 기타)
```

---

## 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

`.env` 파일을 생성하고 아래 값을 채웁니다.  
Supabase 프로젝트의 Settings → Database / API에서 확인할 수 있습니다.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Prisma (Supabase DB)
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### 3. DB 스키마 반영

```bash
# 개발 환경 — 마이그레이션 생성 및 적용
npm run db:migrate

# 또는 스키마만 빠르게 동기화 (마이그레이션 파일 불필요)
npm run db:push

# Prisma Client 생성
npm run db:generate
```

---

## 실행 방법

```bash
# 개발 서버 (http://localhost:3003)
npm run dev

# 프로덕션 빌드
npm run build
npm run start

# 정적 분석
npm run lint
npm run check-types
```
