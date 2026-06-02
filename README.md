# Let's Emoji

一个基于中文输入的 Emoji 查找和转换工具，支持拼音匹配和同音字联想。

## 技术栈

### 编程语言与框架
- **TypeScript** 6.0.3 - 类型安全的 JavaScript 超集
- **React** 19.2.6 - 用户界面构建库
- **React DOM** 19.2.6 - React 的 DOM 渲染器

### 构建工具
- **Vite** 8.0.12 - 现代化前端构建工具，提供快速的开发服务器和优化的生产构建
- **@vitejs/plugin-react** 6.0.1 - Vite 的 React 插件，使用 Oxc 编译

### 核心依赖
- **pinyin-pro** 3.28.1 - 中文拼音转换库，用于同音字匹配
- **lucide-react** 1.17.0 - React 图标库
- **emojibase-data** (CDN) - Emoji 数据源，提供中文标签和分类

### 样式工具
- **Tailwind CSS** 4.3.0 - 实用优先的 CSS 框架
- **clsx** 2.1.1 - 条件类名拼接工具
- **tailwind-merge** 3.6.0 - Tailwind 类名合并工具

### 开发工具
- **ESLint** 10.3.0 - 代码质量检查
- **TypeScript ESLint** 8.59.2 - TypeScript 语法检查
- **gh-pages** 6.3.0 - GitHub Pages 部署工具

---

## 项目搭建与构建

### 1. 克隆项目

```bash
git clone <你的仓库地址>
cd vide
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### 4. 构建生产版本

```bash
npm run build
```

构建产物会输出到 `dist/` 目录。

### 5. 本地预览生产构建

```bash
npm run preview
```

### 6. 代码检查

```bash
npm run lint
```

---

## 主要文件结构

```
vide/
├── src/
│   ├── App.tsx              # 主应用组件，UI 布局和交互逻辑
│   ├── main.tsx             # 应用入口，挂载 React 根组件
│   ├── index.css            # 全局样式和 Tailwind 基础层
│   ├── hooks/
│   │   └── useEmoji.ts      # Emoji 数据获取和匹配逻辑的自定义钩子
│   └── lib/
│       └── utils.ts         # 工具函数（cn 类名合并）
├── public/
│   ├── favicon.svg          # 网站图标
│   └── icons.svg            # SVG 图标资源
├── dist/                    # 构建产物目录（由 Vite 生成）
├── index.html               # HTML 模板入口
├── vite.config.ts           # Vite 构建配置
├── tsconfig.json            # TypeScript 项目引用配置
├── tsconfig.app.json        # 应用代码的 TypeScript 配置
├── tsconfig.node.json       # Node 脚本的 TypeScript 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── postcss.config.js        # PostCSS 配置
├── eslint.config.js         # ESLint 配置
└── package.json             # 项目依赖和脚本定义
```

### 核心文件职责

| 文件 | 职责 |
|------|------|
| `src/App.tsx` | 主应用组件，包含搜索输入框、转换按钮、Emoji 结果展示、复制功能、多候选切换逻辑 |
| `src/main.tsx` | 应用入口，使用 `createRoot` 挂载 React 应用到 `#root` DOM 节点 |
| `src/hooks/useEmoji.ts` | 提供两个自定义钩子：<br>• `useEmojiData()` - 从 CDN 获取 Emoji 数据<br>• `useEmojiMatcher()` - 根据中文输入匹配 Emoji，支持拼音和同音字 |
| `src/lib/utils.ts` | 工具函数 `cn()`，用于合并 Tailwind 类名 |
| `vite.config.ts` | Vite 构建配置，设置 `base: '/lets_emoji/'` 用于 GitHub Pages 部署 |
| `index.html` | HTML 模板，Vite 会在构建时注入编译后的 JS 和 CSS |

---

## 项目功能

### 核心功能

1. **中文转 Emoji**  
   输入中文词语或短句，按回车或点击"转换"按钮，系统会：
   - 尝试对整个输入进行全局匹配
   - 如果没有全局匹配，则逐字符匹配
   - 每个字符显示最多 20 个候选 Emoji

2. **拼音和同音字支持**  
   使用 `pinyin-pro` 库，当直接匹配失败时，会尝试通过拼音匹配同音字的 Emoji

3. **多候选切换**  
   - 点击 Emoji 卡片可以循环切换候选项
   - 右下角显示当前选中的索引（如 `1/5`）

4. **一键复制**  
   点击"复制全部"按钮，将当前选中的所有 Emoji 复制到剪贴板

5. **响应式设计**  
   使用 Flexbox 布局和 Tailwind CSS，适配不同屏幕尺寸

6. **优雅的加载状态**  
   Emoji 数据加载时显示"正在准备表情库..."提示

7. **CDN 容错机制**  
   `useEmojiData` 钩子会依次尝试 jsDelivr 和 unpkg 两个 CDN，确保数据获取的稳定性

---

## 如何发布到 GitHub Pages

### 前置条件
1. 已将项目推送到 GitHub 仓库
2. 确认 `vite.config.ts` 中的 `base` 配置与仓库名匹配：
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: '/lets_emoji/', // 替换为你的仓库名
   })
   ```

### 发布步骤

#### 方式一：使用 npm 脚本（推荐）

```bash
npm run deploy
```

这个命令会：
1. 自动执行 `npm run build` 构建生产版本
2. 将 `dist/` 目录的内容推送到 `gh-pages` 分支

#### 方式二：手动部署

```bash
# 1. 构建项目
npm run build

# 2. 部署到 gh-pages 分支
npx gh-pages -d dist
```

### 配置 GitHub Pages

1. 进入仓库的 **Settings** → **Pages**
2. 在 **Source** 下拉菜单中选择 `gh-pages` 分支
3. 点击 **Save**
4. 等待 30 秒到 2 分钟，GitHub 会自动构建并部署

### 访问网站

部署成功后，访问：

```
https://<你的用户名>.github.io/lets_emoji/
```

### 更新网站

每次修改代码后，重新运行：

```bash
npm run deploy
```

然后在浏览器中强制刷新（Mac: `Cmd + Shift + R`）清除缓存。


## 许可证

MIT

---

## 贡献

欢迎提交 Issue 和 Pull Request！
