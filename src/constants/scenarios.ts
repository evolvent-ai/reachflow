import type { Scenario } from '@/types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'foreign_trade',
    title: '外贸跨境电商',
    description: '精准锁定买家、分销商、供应链关键人，提升首触达成功率。',
    features: [
      '锁定买家、分销商、退货负责人。',
      '提供多语言模板与时区投递建议。',
      '显著提升首触达成功率。',
    ],
  },
  {
    id: 'marketing',
    title: '影响者投放 / 代理',
    description: '快速找到垂直领域 KOL、媒体编辑与社群主理人。',
    features: [
      '识别博主、MCN、平台商务的合适窗口。',
      '账号与"商务联系"自动映射。',
      '结合投放记录、画像筛选优先级。',
    ],
  },
  {
    id: 'recruitment',
    title: '招聘 / 猎头服务',
    description: '定位稀缺岗位候选人，绕过平台限制直接触达。',
    features: [
      '补全被动候选人、推荐人、导师触达方式。',
      '提供职业邮箱、LinkedIn、校友网络入口。',
      '减少冷启回绝，提高候选响应率。',
    ],
  },
];

export const SCENARIO_TEMPLATES: Record<string, { title: string; content: string }[]> = {
  foreign_trade: [
    {
      title: 'Subject: Quick intro — potential distributor for [Your Product] in [Region]',
      content: `Hi [Name],

We help brands like [Peer Brand] grow in [Region]. I'd love to reach the right person for distribution or returns. If you're the best contact, could we set up a quick call this week? Otherwise, I'd appreciate a referral.

— [Your Name], [Company], [Contact]`,
    },
  ],
  marketing: [
    {
      title: '投放合作邀约',
      content: `你好 [称呼]，我们在 [品类/人群] 做投放，想与贵方沟通 [账号/MCN/平台商务] 的合作机会。本周可安排 15 分钟电话吗？若非您负责，烦请指引对接同事，感谢！`,
    },
  ],
  recruitment: [
    {
      title: '职位邀约',
      content: `你好 [候选人名]，我在 [公司] 负责 [职位名称] 的寻访，看到你在 [技能/项目] 方面的经历很契合。若愿意交换更多信息，可约 15 分钟初步沟通；若你更适合作为推荐人，也十分感谢指点。`,
    },
  ],
};
