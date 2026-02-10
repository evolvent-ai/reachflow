# 联脉项目重构功能对照清单

## 1. 首页 (Landing Page) 功能

### 1.1 Header 导航
- [x] Logo 和品牌名
- [x] 导航链接（工作流、应用场景、价格、FAQ）
- [x] CTA 按钮（预约 Demo、获取首批联系人）
- [x] 移动端汉堡菜单
- [x] 滚动时毛玻璃效果

### 1.2 Hero Section
- [x] A/B 测试支持（h1 变体 B）
- [x] 表单验证（公司、联系方式、使用场景）
- [x] 扩展表单字段（目标市场、月外联量）
- [x] 信任指标变体（logos / metrics）
- [x] Toast 提交成功提示
- [x] 埋点追踪（form_start, form_submit_success, form_submit_fail）

### 1.3 Pain Points 痛点
- [x] 三个痛点卡片（线索分散、联系方式不可靠、合规风险）
- [x] 解决方案提示

### 1.4 Workflow 工作流
- [x] 三步流程展示（目标发现、联系方式补全、一键外联）
- [x] 步骤连接线（桌面端）

### 1.5 Scenarios 应用场景
- [x] Tab 切换（外贸、影响者投放、招聘）
- [x] 场景详情展示
- [x] 样例外联文案 Modal
- [x] Modal 内 Tab 切换（中英文模板）

### 1.6 Features 关键能力
- [x] 六大能力卡片
- [x] 合规细则 Drawer
- [x] 埋点追踪（compliance_view）

### 1.7 Stats 数据指标
- [x] 四个关键指标展示

### 1.8 Testimonials 客户证言
- [x] 客户评价展示
- [x] A/B 测试支持（hidden 变体）

### 1.9 Pricing 定价
- [x] 定制化方案卡片
- [x] A/B 测试支持（hidden 变体）
- [x] 埋点追踪（pricing_select）

### 1.10 FAQ 常见问题
- [x] 手风琴展开/收起
- [x] 埋点追踪（faq_expand）

### 1.11 CTA Section
- [x] 底部行动召唤
- [x] 联系信息展示

### 1.12 Footer 页脚
- [x] 品牌信息
- [x] 链接分组
- [x] 版权信息
- [x] 当前年份自动更新

---

## 2. 研究页面 (Research Page) 功能

### 2.1 页面布局
- [x] 固定顶部导航
- [x] 返回首页链接
- [x] 品牌标识

### 2.2 聊天面板
- [x] 消息列表（用户、助手、系统、错误）
- [x] Markdown 渲染（react-markdown + remark-gfm）
- [x] 消息气泡样式
- [x] 自动滚动到底部

### 2.3 输入区域
- [x] 文本输入框
- [x] 发送按钮
- [x] 停止流式按钮
- [x] 清空对话按钮

### 2.4 设置面板
- [x] Provider 选择（OpenAI、Anthropic、Gemini）
- [x] 高级设置折叠/展开
- [x] API Key 输入
- [x] 模型输入
- [x] Base URL 输入
- [x] EXA Key 输入

### 2.5 研究日志时间线
- [x] 实时事件显示
- [x] 状态标签（待机、活跃、流式、错误）
- [x] 时间戳显示

### 2.6 SSE 流式连接
- [x] 流式响应处理
- [x] 事件类型解析（search_start, search_results, open_url_start, tool_result, assistant_message, final, error）
- [x] 连接中断处理
- [x] 中止控制器

### 2.7 状态管理
- [x] Zustand store
- [x] 会话持久化（sessionStorage）
- [x] 消息历史保存
- [x] 设置保存

### 2.8 埋点追踪
- [x] page_view
- [x] research_submit
- [x] research_stop_stream
- [x] research_clear_chat
- [x] research_toggle_advanced
- [x] research_back_home
- [x] research_error

---

## 3. 全局功能

### 3.1 路由
- [x] React Router 配置
- [x] 首页路由 (/)
- [x] 研究页面路由 (/research)

### 3.2 状态管理
- [x] Zustand 安装配置
- [x] AB 测试状态存储
- [x] 研究页面状态存储

### 3.3 样式系统
- [x] Tailwind CSS 配置
- [x] 自定义颜色变量
- [x] 自定义圆角系统
- [x] 自定义阴影系统
- [x] 响应式断点
- [x] 自定义组件类（btn, card, input, badge）

### 3.4 工具函数
- [x] 表单验证（邮箱、手机号、微信号）
- [x] Markdown 处理
- [x] HTML 转义
- [x] ID 生成
- [x] 时间戳格式化

### 3.5 Hooks
- [x] useAnalytics（埋点）
- [x] useABTesting（A/B 测试）
- [x] useMediaQuery（响应式）
- [x] useSessionStorage（会话存储）
- [x] useSSE（SSE 连接）

### 3.6 UI 组件
- [x] Toast 通知
- [x] Drawer 抽屉

### 3.7 无障碍支持
- [x] ARIA 属性
- [x] 键盘导航（Escape 关闭 Modal/Drawer）
- [x] 焦点管理
- [x] 减少动画偏好支持

---

## 4. 部署配置

### 4.1 Docker
- [x] Dockerfile（多阶段构建）
- [x] docker-compose.yml
- [x] .dockerignore

### 4.2 Nginx
- [x] nginx.conf
- [x] 反向代理配置（/api -> http://47.110.77.202/）
- [x] SSE 支持配置
- [x] 静态资源缓存
- [x] Gzip 压缩
- [x] 安全响应头

### 4.3 环境配置
- [x] .env.example
- [x] Vite 环境变量配置

---

## 5. 构建与开发

### 5.1 开发环境
- [x] Vite 开发服务器（端口 8080）
- [x] 热更新（HMR）
- [x] 路径别名 (@/)

### 5.2 生产构建
- [x] TypeScript 编译
- [x] 代码压缩
- [x] 资源优化
- [x] Sourcemap 生成

### 5.3 代码质量
- [x] ESLint 配置
- [x] TypeScript 严格模式

---

## 6. 与原项目对比

### 6.1 保留的功能
- [x] 所有页面区块
- [x] A/B 测试逻辑
- [x] 表单验证逻辑
- [x] 埋点追踪事件
- [x] SSE 流式处理
- [x] 会话持久化
- [x] 响应式设计
- [x] 无障碍支持

### 6.2 改进的功能
- [x] React 组件化架构
- [x] TypeScript 类型安全
- [x] 状态管理（Zustand）
- [x] 现代化构建工具（Vite）
- [x] 更好的代码组织
- [x] 可复用的 UI 组件

### 6.3 新增功能
- [x] Toast 通知系统
- [x] Drawer 抽屉组件
- [x] 更完善的研究日志

---

## 7. 文件备份

- [x] legacy/index.html（原首页）
- [x] legacy/research.html（原研究页）
- [x] legacy/app.js（原 JS）
- [x] legacy/styles.css（原 CSS）

---

## 结论

✅ 所有功能已完整实现并测试通过
✅ 构建成功，无错误
✅ 原文件已备份到 legacy/ 目录
