import type { Feature } from '@/types';

export const FEATURES: Feature[] = [
  {
    icon: 'target',
    title: '精准识别',
    description: '组织图谱与角色优先级模型直达"能拍板的人"。',
  },
  {
    icon: 'channels',
    title: '多通道补全',
    description: '邮箱、电话、官网表单、社媒入口一键同步。',
  },
  {
    icon: 'chart',
    title: '可达评分',
    description: '投递性、有效性、渠道属性结合预测 7/14/30 天触达概率。',
  },
  {
    icon: 'file-text',
    title: '可解释流程',
    description: '来源链接、验证轨迹、外联日志完整可导出，形成证据链。',
  },
  {
    icon: 'shield',
    title: '合规风控',
    description: '仅用公开数据，拒联名录 + 频控，全链路审计。',
  },
  {
    icon: 'plug',
    title: '系统集成',
    description: '同步 CRM、ATS、表格、API，状态回写闭环线索。',
  },
];

export const STATS = [
  { value: 'T+24h', label: '首批 3–5 位可联对象（含评分与路径）' },
  { value: '30–60%', label: '首触达成功率提升区间（视行业/地区）' },
  { value: '≤1%', label: '退订/投诉控制目标（频控 + 拒联名录）' },
  { value: '100%', label: '联系人均附来源与验证轨迹' },
];
