# Research Page 重构 TODO

## 背景

目前前端会把每一轮 LLM 的 `assistant_message` 都直接渲染到对话区域。
参考 ChatGPT Thinking Mode 的设计，改为：
- **右侧边栏**：实时展示思考链条（所有中间过程事件）
- **中间对话区**：只展示 `final` 事件的最终报告内容

---

## 目标 UI 布局（三栏）

展开状态：
```
┌──────────────────┬──────────────────────────┬──────────────────────┐
│  左侧：对话历史 [«]│     中间：对话区          │   右侧：思考链条      │
│                  │                          │                      │
│  • 会话 1        │  [用户消息]               │  ⚙ 调用 AI 模型       │
│  • 会话 2        │                          │  🔍 搜索 "xxx"        │
│  • 会话 3 (当前) │  [等待中：转圈动画]        │  📄 打开 URL          │
│                  │         ↓                │  💬 中间推理内容...   │
│  [+ 新对话]      │  [最终报告 markdown]      │  ✅ 生成最终报告       │
│                  │                          │                      │
│                  │  [用户输入框]             │                      │
└──────────────────┴──────────────────────────┴──────────────────────┘
```

折叠状态（左侧收起后）：
```
┌────┬──────────────────────────────┬──────────────────────┐
│[»] │        中间：对话区            │   右侧：思考链条      │
│    │  [用户消息]                   │  ⚙ 调用 AI 模型       │
│    │  [等待中：转圈动画]             │  🔍 搜索 "xxx"        │
│    │         ↓                    │  📄 打开 URL          │
│    │  [最终报告 markdown]           │  💬 中间推理内容...   │
│    │                              │  ✅ 生成最终报告       │
│    │  [用户输入框]                  │                      │
└────┴──────────────────────────────┴──────────────────────┘
```

---

## 一、左侧：对话历史面板

**功能需求：**
- 显示当前 session 内的历史对话列表（每条显示用户问题的前缀，截断到约 30 字符）
- 点击历史条目可跳转/回顾
- 提供"新建对话"按钮，清空当前对话
- 当前激活的对话条目高亮
- **右上角有折叠按钮**，点击后面板收起为细条（仅保留折叠图标），再次点击展开

**折叠行为细节：**
- 展开时：宽度 `240px`，显示完整历史列表和"新建对话"按钮，折叠按钮图标为 `«`
- 折叠时：宽度收缩为 `40px`，只显示展开图标 `»`，列表和按钮全部隐藏
- 折叠/展开使用 CSS transition（`width` + `overflow: hidden`）实现平滑动画
- 折叠状态保存到 `localStorage`，刷新后记住上次状态

**后端 API（已就绪）：**

| 接口 | 说明 |
|------|------|
| `GET /api/v1/client/conversations` | 分页查询 session 列表，用于渲染左侧历史条目 |
| `GET /api/v1/client/conversations/{session_id}` | 查询单个 session 的所有消息（仅 owner 可访问），用于切换会话时加载历史消息 |

相关 Schema：`ConversationSessionResponse`（列表项）、`ConversationMessageResponse`（消息详情）

**实现要点：**
- 页面加载时调用 `GET /conversations` 拉取历史 session 列表，渲染到左侧面板
- 点击某条历史 session，调用 `GET /conversations/{session_id}` 加载该会话消息，渲染到中间对话区（只读展示，不触发新请求）
- 左侧列表每项显示：session 首条用户消息的前 30 字符作为标题 + 时间
- 支持分页（下拉加载更多）或一次性加载最近 N 条
- 当前 session 条目在列表中高亮标记

---

## 二、中间：对话区（主要修改点）

### 2.1 消息展示逻辑变更

| 事件 | 当前行为 | 目标行为 |
|------|---------|---------|
| `assistant_message` | 逐字追加到对话气泡（流式显示） | **不显示**在对话区，只发送到右侧思考链条 |
| `final` | 更新最后一条消息内容 | **显示**为最终报告（对话区唯一的 AI 回复） |
| `user_message` | 展示用户消息 | 保持不变 |

### 2.2 等待状态

- 用户发送后，中间对话区显示加载动画（转圈 / 骨架屏）
- **直到收到 `final` 事件**，才将最终报告渲染为 markdown 内容
- 在此之前不显示任何 AI 文字内容（避免展示思考过程的碎片）

### 2.3 最终报告渲染

- `final.data.content` 使用完整 markdown 渲染（现有 `react-markdown` 方案保持不变）
- 报告渲染完成后，隐藏加载动画

### 2.4 需修改的代码位置

- `ResearchPage.tsx` 中的 `handleStreamEvent` 函数：
  - `assistant_message` 分支：**移除** `updateLastMessage()` 调用，改为向右侧思考链条推送
  - `final` 分支：保留 `finishStreaming()` 并以 `final.data.content` 更新对话
- `researchStore.ts`：
  - 考虑新增 `thinkingEntries: ThinkingEntry[]` 状态（替代或补充现有 `timeline`）

---

## 三、右侧：思考链条面板

### 3.1 展示的事件类型及样式

| 事件类型 | 显示内容 | 图标/样式 |
|---------|---------|---------|
| `llm_request` | "调用 AI 模型（模型名）" | ⚙ 灰色 |
| `assistant_message` | 中间推理文本（可折叠展开） | 💬 浅蓝色气泡，默认折叠 |
| `search_start` | "搜索：{query}" | 🔍 蓝色 |
| `search_results` | "获取到 {count} 条结果" | 📋 蓝色 |
| `open_url_start` | "打开：{url 截断显示}" | 🔗 紫色 |
| `open_url_result` | "已读取页面内容" | 📄 紫色 |
| `tool_result` | "工具执行完成" | 🔧 橙色 |
| `log` | 日志内容（小字，灰色） | — |
| `final` | "✅ 报告已生成" | 绿色完成标记 |
| `usage_stats` | Token 消耗统计（小字） | 📊 最底部 |

### 3.2 `assistant_message` 的折叠交互

- 默认**折叠**，显示前 2 行预览 + "展开"按钮
- 流式接收时实时追加文字（类似 ChatGPT Thinking 的展开状态）
- 流式结束后自动折叠

### 3.3 隐藏 LLM Provider 信息

- 右侧面板**不显示** provider 名称（openai / anthropic / gemini）
- `llm_request` 只显示模型名，不显示 provider 字段
- 顶部状态栏移除 provider 标识

### 3.4 面板状态

- 状态徽章保留（待机 / 活跃 / 流式 / 错误）
- 流式结束后，链条内容保留可浏览（不自动清空）
- 新一轮对话开始时，清空旧的思考链条

---

## 四、Store 变更

### 4.1 新增 `ThinkingEntry` 类型

```typescript
interface ThinkingEntry {
  id: string;
  type: EventType;
  content: string;       // 主要显示文本
  detail?: string;       // 折叠展开的详细内容（assistant_message 用）
  timestamp: number;
  isStreaming?: boolean;  // assistant_message 流式过程中为 true
}
```

### 4.2 Store 新增状态

- `thinkingEntries: ThinkingEntry[]` — 思考链条数据
- `addThinkingEntry(entry)` — 添加一条链条记录
- `appendToLastThinking(text)` — 追加 assistant_message 流式文本
- `finishLastThinking()` — 标记最后一条 thinking 完成（折叠）
- `clearThinking()` — 新对话时清空

### 4.3 现有 `timeline` 的处理

- 评估是否保留 `timeline`（当前作为 debug 用）
- 如果 `thinkingEntries` 能满足右侧面板需求，可以移除 `timeline`

---

## 五、布局变更

### 5.1 Grid 布局调整

当前：`grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]`（两栏）

目标：
- 展开：`grid-cols-[240px_minmax(0,1fr)_320px]`（三栏）
- 折叠：`grid-cols-[40px_minmax(0,1fr)_320px]`（左侧收起）

左侧宽度通过 CSS transition `width 200ms ease` 平滑切换，Grid 列宽随之响应。

### 5.2 响应式处理

- 小屏（< 768px）：隐藏左侧历史面板，右侧思考链条折叠为底部抽屉或 Tab
- 中屏（768px ~ 1200px）：左侧默认折叠，可手动展开；保留中间 + 右侧
- 大屏（> 1200px）：完整三栏显示，左侧默认展开

---

## 六、实施顺序建议

1. **Store 重构**：新增 `thinkingEntries` 相关状态和 actions
2. **右侧面板重构**：基于新 store 渲染思考链条（替换旧 timeline）
3. **中间对话区修改**：`assistant_message` 不再显示于对话，`final` 作为唯一报告
4. **左侧历史面板**：新建组件，从 messages 提取展示
5. **布局三栏调整**：修改 grid 配置，适配三栏
6. **响应式处理**：移动端折叠逻辑

---

## 七、移除 Footer

- Research Page 不需要底部 Footer，移除该页面的 Footer 组件渲染
- 检查路由/布局层级：当前 Footer 若在 `App.tsx` 或全局 layout 中全局渲染，需针对 Research Page 路由单独排除（条件渲染或独立 layout）
- 移除后页面高度应占满全屏（`h-screen` / `min-h-screen`），三栏布局撑满剩余空间

---

## 八、隐藏高级设置

- 移除顶部 Header 中的"高级设置"按钮入口
- 移除对应的 `AdvancedSettingsModal` 组件渲染
- Provider 选择器一并隐藏（provider 信息不对用户暴露，与第三节"隐藏 LLM Provider"保持一致）
- 相关 state（`settings.provider`、`settings.model`、API key 等）保留在 store 中，供后端调用使用，只是不在 UI 上展示

---

## 八、暂不处理

- 对话历史持久化到服务端（当前 sessionStorage 保持不变）
- 多会话管理（新建 / 删除会话，切换会话加载历史）
- 思考链条内容的服务端保存
