# CLAUDE.md — Frontend (Sales Management App)

## Project Overview
Hệ thống quản lý bán hàng gia đình.
Stack: React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui
Backend: Supabase (Auth, DB, Storage, Edge Functions)
State: TanStack Query + Zustand
Deploy: Vercel

## Project Structure
```
src/
├── components/
│   ├── ui/          # shadcn/ui primitives (KHÔNG sửa trực tiếp)
│   └── shared/      # shared components dùng nhiều nơi
├── features/        # mỗi feature 1 folder: products/, orders/, inventory/...
│   └── [feature]/
│       ├── components/   # UI components của feature đó
│       ├── hooks/        # custom hooks (useProducts, useOrders...)
│       ├── types.ts      # types riêng của feature
│       └── index.ts      # re-export public API
├── lib/
│   ├── supabase.ts       # supabase client singleton
│   └── utils.ts          # helpers
├── stores/          # zustand stores
└── types/           # global types, DB types từ supabase
```

## Coding Rules

### TypeScript
- Luôn dùng `interface` cho object types, `type` cho union/utility types
- KHÔNG dùng `any` — dùng `unknown` nếu chưa rõ type
- Luôn type return của async functions
- Dùng Supabase generated types từ `src/types/supabase.ts`

### Components
- Functional components + hooks only, KHÔNG dùng class components
- Mỗi file 1 component chính, export default
- Props interface đặt ngay trên component: `interface ProductCardProps { ... }`
- KHÔNG inline style — dùng Tailwind classes
- Dùng `cn()` từ `lib/utils` để merge class conditionally

### Data Fetching
- Mọi server state dùng TanStack Query (`useQuery`, `useMutation`)
- Query keys theo pattern: `['products']`, `['products', id]`, `['orders', { status }]`
- Luôn handle loading + error state trong UI
- Optimistic update cho mutation hay dùng (add to cart, toggle status)
- KHÔNG fetch trực tiếp trong component — luôn tạo custom hook

### Supabase Client
- Chỉ dùng singleton từ `lib/supabase.ts`, KHÔNG tạo client mới
- Realtime subscription: cleanup trong useEffect return
- Upload file: compress trước khi upload (dùng browser-image-compression)
- RLS đã bật — luôn test với user đã login

### State Management
- Server state → TanStack Query
- UI state (modal open, selected tab) → useState local
- Global UI state (sidebar, theme) → Zustand store
- KHÔNG dùng Zustand cho server data

### Naming Conventions
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `camelCase` bắt đầu bằng `use` — `useProducts`, `useCreateOrder`
- Stores: `camelCase` + Store suffix — `useCartStore`, `useAuthStore`
- Constants: `UPPER_SNAKE_CASE`

### Error Handling
- Luôn wrap Supabase calls với try/catch hoặc check `error` return
- Dùng toast (sonner) để notify lỗi cho user
- Log lỗi với context: `console.error('[useProducts]', error)`

## Commands
```bash
npm run dev          # dev server
npm run build        # production build
npm run type-check   # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier
```

## Key Libraries
- `@supabase/supabase-js` — Supabase client
- `@tanstack/react-query` — server state
- `zustand` — client state
- `sonner` — toast notifications
- `react-hook-form` + `zod` — form + validation
- `date-fns` — date formatting
- `browser-image-compression` — compress ảnh trước upload
- `react-to-print` — in hoá đơn

## DO NOT
- KHÔNG commit `.env.local`
- KHÔNG để `console.log` trong production code
- KHÔNG sửa files trong `src/components/ui/` (shadcn managed)
- KHÔNG gọi Supabase Management API trực tiếp từ FE (lộ token)
- KHÔNG bypass RLS bằng service role key trên client

## References (load khi cần)
- Schema DB: @docs/database-schema.md
- API endpoints: @docs/api-endpoints.md
- UI design system: @docs/design-system.md
