# CLAUDE.md — Frontend (Sales Management App)

## Project Overview
Hệ thống quản lý bán hàng gia đình.
Stack: React 19 + Vite + TypeScript + SCSS (sass) + Radix UI primitives
Backend: Supabase (Auth, DB, Storage, Edge Functions)
State: TanStack Query + Zustand
Deploy: Vercel

## Design System
Design fidelity là ưu tiên hàng đầu. Style toàn bộ chạy qua `src/styles/` (SCSS partials), không có CSS-in-JS, không inline style.
- Token-driven: hue / density / radius / dark theme dùng CSS custom properties trên `<html>`, đổi runtime qua TweaksPanel (dev tool)
- OKLCH color space cho accent (giữ độ tương phản đẹp khi đổi hue runtime)
- Mọi screen có 1 SCSS partial riêng — đổi design màn nào sửa đúng 1 file

## Project Structure
```
src/
├── main.tsx, App.tsx
├── styles/
│   ├── globals.scss              # @use tất cả partials
│   ├── _tokens.scss              # :root vars (hue, density, radius, dark)
│   ├── _reset.scss
│   ├── _typography.scss
│   ├── _mixins.scss              # @mixin card-base, focus-ring...
│   ├── shell/                    # _sidebar.scss, _topbar.scss
│   ├── components/               # _card.scss, _btn.scss, _stat.scss, _table.scss...
│   └── features/                 # _dashboard.scss, _pos.scss, _inventory.scss...
├── components/
│   ├── shell/                    # Sidebar, Topbar
│   ├── shared/                   # Stat, RevChart, Donut, PageHead, Tabs, EmptyState
│   ├── icons/                    # icon set (stroke SVG)
│   └── dev/                      # TweaksPanel (dev-only)
├── features/                     # mỗi feature 1 folder
│   └── [feature]/
│       ├── components/           # UI components của feature đó
│       ├── hooks/                # custom hooks (useProducts, useOrders...)
│       ├── types.ts              # types riêng của feature
│       └── index.ts              # re-export public API
├── lib/
│   ├── supabase.ts               # supabase client singleton
│   ├── format.ts                 # fmt(), date, currency helpers
│   └── utils.ts
├── stores/                       # zustand stores (cart, ui)
├── mocks/                        # mock data theo domain (xoá khi BE ready)
└── types/                        # global types, DB types từ supabase
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
- KHÔNG inline style, KHÔNG CSS-in-JS — class name từ SCSS, định nghĩa trong `src/styles/`
- Dùng Radix UI primitives cho component có a11y phức tạp (Dialog, DropdownMenu, Combobox, Popover, Tooltip, Tabs, Toast...) — Radix lo logic + a11y, ta lo style
- KHÔNG tự code modal/popover từ đầu — luôn wrap Radix

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
- Files TSX: `kebab-case.tsx`
- SCSS partials: `_kebab-case.scss` (underscore prefix bắt buộc cho `@use`)
- Components: `PascalCase`
- Hooks: `camelCase` bắt đầu bằng `use` — `useProducts`, `useCreateOrder`
- Stores: `camelCase` + Store suffix — `useCartStore`, `useAuthStore`
- Constants: `UPPER_SNAKE_CASE`
- CSS class: `kebab-case`, semantic — `.stat-card`, `.pos-grid`, không phải `.bg-orange-500`

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
- `@radix-ui/react-*` — headless primitives (Dialog, Dropdown, Tabs, Tooltip, Popover...)
- `sass` — SCSS preprocessor
- `sonner` — toast notifications
- `react-hook-form` + `zod` — form + validation
- `date-fns` — date formatting
- `browser-image-compression` — compress ảnh trước upload
- `react-to-print` — in hoá đơn

## DO NOT
- KHÔNG commit `.env.local`
- KHÔNG để `console.log` trong production code
- KHÔNG inline style, KHÔNG CSS-in-JS (Emotion/styled-components) — luôn qua SCSS partial
- KHÔNG tự code modal/popover/dropdown — luôn wrap Radix primitive
- KHÔNG sửa SCSS token (`_tokens.scss`) khi chỉ cần đổi 1 màn — đổi trong feature partial
- KHÔNG dùng `window.X = ...` để export — luôn ES module
- KHÔNG gọi Supabase Management API trực tiếp từ FE (lộ token)
- KHÔNG bypass RLS bằng service role key trên client

## References (load khi cần)
- Schema DB: @docs/database-schema.md
- API endpoints: @docs/api-endpoints.md
- UI design system: @docs/design-system.md
