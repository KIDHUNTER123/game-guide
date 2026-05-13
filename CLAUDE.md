# 游戏攻略网站 (game-guides)

Next.js 16 全栈项目 — 多游戏攻略聚合平台，支持前台浏览、用户系统、评论互动、后台 CMS。

## 技术栈
- Next.js 16.2.6 (App Router) + TypeScript + React 19
- Tailwind CSS 4 + shadcn/ui v4 (基于 @base-ui/react)
- Prisma 7.8.0 + SQLite (@prisma/adapter-libsql)
- Auth.js v5 (next-auth@beta)
- TipTap 3.x 富文本编辑器

## 关键差异
- **Prisma 7**: 适配器模式 `new PrismaClient({ adapter })`，导入 `@/generated/prisma/client`
- **shadcn/ui v4**: 无 `asChild`，用 `render={<Link href=".." />}` 代替
- **Next.js 16**: 无 `middleware.ts`，params 是 Promise 需 await
- **TipTap**: `immediatelyRender: false` 避免 SSR 问题

## 常用命令
```bash
npm run dev       # 开发
npm run build     # 构建
npx prisma db push   # 推送 DB
npx prisma generate   # 生成客户端
npx tsx prisma/seed.ts # 灌数据
npx prisma studio  # 查看 DB
```

## 数据库
SQLite 文件: `prisma/dev.db`（Prisma CLI 实际写入项目根目录 `dev.db`）
Prisma 配置: `prisma.config.ts`
Prisma Schema: `prisma/schema.prisma`

## 测试账号
管理员: admin@example.com / admin123
编辑者: editor@example.com / editor123
用户: user@example.com / user123

## 项目结构
- `src/lib/db.ts` — 数据库客户端
- `src/lib/auth.ts` — Auth.js 配置
- `src/lib/auth-utils.ts` — 鉴权辅助函数
- `src/components/admin/rich-editor.tsx` — TipTap 编辑器
- `src/components/comment/comment-section.tsx` — 评论区
- `deploy.sh` — VPS 部署脚本
