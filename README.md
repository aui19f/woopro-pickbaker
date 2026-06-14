# Pickbaker

베이커리 레시피 공유 커뮤니티 웹 서비스입니다.  
로그인한 사용자가 레시피를 작성하고, 피드에서 다른 사람의 레시피를 탐색할 수 있습니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| 인증 | Supabase Auth |
| 데이터베이스 | PostgreSQL (Supabase) |
| ORM | Prisma |

## 주요 기능

- **피드** — 전체 레시피 목록 조회 (`/feed`)
- **레시피** — 개별 레시피 상세 조회 (`/recipe`)
- **작성** — 로그인 사용자 레시피 작성 (`/write`)
- **마이페이지** — 사용자 프로필 조회 (`/:username`)
- **인증** — 회원가입 / 로그인 (`/signup`, `/login`)

비로그인 상태에서 `/write` 및 마이페이지 접근 시 로그인 페이지로 리디렉션됩니다.

## 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 채웁니다.  
Supabase 프로젝트의 Settings → Database / API 에서 확인할 수 있습니다.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

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

## 실행 방법

### 개발 서버

```bash
npm run dev
# http://localhost:3003
```

### 프로덕션 빌드

```bash
npm run build
npm run start
```

### 기타 명령어

```bash
npm run lint          # ESLint 검사
npm run check-types   # TypeScript 타입 검사
```
