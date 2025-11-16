# 班兔企服官网 - Bantu Enterprise Services Website

这是一个使用 React + TypeScript + Vite 构建的响应式企业官网，支持多语言（中文和印尼语），整合了官网介绍和管理后台功能。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理
- **React i18next** - 国际化支持
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

## 功能特性

- ✅ 多语言支持（中文、印尼语）
- ✅ 响应式设计（Web端和移动端自适应）
- ✅ 官网介绍页面（首页、关于我们、服务介绍、联系我们）
- ✅ 管理后台页面（登录、仪表板）
- ✅ 现代化UI设计

## 项目结构

```
crm-bantu-website/
├── public/
│   └── pics/
│       ├── logo.png          # 公司Logo
│       └── introduce.pdf     # 业务介绍文档
├── src/
│   ├── components/           # 组件
│   │   ├── Header.tsx        # 头部导航
│   │   └── Footer.tsx        # 页脚
│   ├── pages/                # 页面
│   │   ├── Home.tsx          # 首页
│   │   ├── About.tsx         # 关于我们
│   │   ├── Services.tsx      # 服务介绍
│   │   ├── Contact.tsx       # 联系我们
│   │   ├── Login.tsx         # 登录页
│   │   └── Dashboard.tsx     # 仪表板
│   ├── i18n/                 # 国际化配置
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── zh-CN.json    # 中文翻译
│   │       └── id-ID.json    # 印尼语翻译
│   ├── utils/                # 工具函数
│   │   └── cn.ts             # className合并工具
│   ├── App.tsx               # 主应用组件
│   ├── main.tsx              # 入口文件
│   └── index.css             # 全局样式
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
pnpm dev
# 或
yarn dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
# 或
pnpm build
# 或
yarn build
```

构建产物将输出到 `dist` 目录

### 预览生产构建

```bash
npm run preview
# 或
pnpm preview
# 或
yarn preview
```

## 页面说明

### 官网页面

- **首页** (`/`) - 展示公司介绍和核心服务
- **关于我们** (`/about`) - 公司详细信息
- **服务介绍** (`/services`) - 详细的服务说明
- **联系我们** (`/contact`) - 联系表单和联系方式

### 管理后台

- **登录** (`/login`) - 用户登录页面
- **仪表板** (`/dashboard`) - 管理后台首页

## 多语言支持

项目支持中文（zh-CN）和印尼语（id-ID）两种语言。语言切换按钮位于页面头部导航栏。

翻译文件位于 `src/i18n/locales/` 目录下，可以根据需要修改和扩展翻译内容。

## 响应式设计

项目使用 Tailwind CSS 实现响应式设计，支持以下断点：

- **移动端**: < 768px
- **平板**: 768px - 1024px
- **桌面端**: > 1024px

## 自定义配置

### 修改主题颜色

编辑 `tailwind.config.js` 中的 `primary` 颜色配置。

### 添加新页面

1. 在 `src/pages/` 创建新页面组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/components/Header.tsx` 中添加导航链接
4. 在翻译文件中添加对应的文本

### 更新业务介绍内容

根据 `pics/introduce.pdf` 文档内容，更新以下文件中的业务介绍：

- `src/pages/Home.tsx` - 首页内容
- `src/pages/About.tsx` - 关于我们内容
- `src/pages/Services.tsx` - 服务介绍内容
- `src/i18n/locales/zh-CN.json` - 中文翻译
- `src/i18n/locales/id-ID.json` - 印尼语翻译

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 最佳实践
- 使用 Tailwind CSS 进行样式设计
- 组件使用函数式组件和 Hooks
- 事件处理函数使用 `handle` 前缀命名

## 许可证

Copyright © 2024 班兔企服. All rights reserved.

