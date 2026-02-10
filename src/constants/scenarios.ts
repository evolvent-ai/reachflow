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
      title: '初次接触',
      content: `Dear [Name],

I hope this email finds you well. My name is [Your Name] from [Company].

We specialize in [product/service] and noticed your company is a key player in the [industry] market. I believe there might be a great opportunity for us to collaborate.

Would you be open to a brief call next week to explore how we can support your business goals?

Best regards,
[Your Name]`,
    },
    {
      title: '跟进邮件',
      content: `Hi [Name],

I wanted to follow up on my previous email regarding [topic].

I understand you're busy, but I believe this could be valuable for [specific benefit].

Would you have 15 minutes for a quick chat this week?

Best,
[Your Name]`,
    },
  ],
  marketing: [
    {
      title: '合作邀约',
      content: `Hi [Name],

我是 [Your Name]，来自 [Company]。

我们一直在关注您在 [平台] 上的内容，非常欣赏您对 [领域] 的独到见解。我们有一款 [产品] 想邀请您体验，相信您的粉丝会感兴趣。

方便聊聊合作的可能性吗？

期待您的回复！
[Your Name]`,
    },
  ],
  recruitment: [
    {
      title: '职位邀约',
      content: `Hi [Name],

我是 [Your Name]，[Company] 的 [职位]。

我们在寻找一位 [目标职位]，看了您的履历，觉得您的 [具体经验] 非常匹配。想邀请您聊聊这个机会。

您最近有在看新的机会吗？

期待交流！
[Your Name]`,
    },
  ],
};
