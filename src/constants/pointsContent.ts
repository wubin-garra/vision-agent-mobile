export type PointsTabId = 'invite' | 'redeem' | 'rules';

export const POINTS_TABS: { id: PointsTabId; label: string }[] = [
  { id: 'invite', label: '邀请' },
  { id: 'redeem', label: '兑换' },
  { id: 'rules', label: '规则' },
];

export const INVITE_COPY = {
  title: '邀请好友',
  subtitle: '双方各得20积分',
  description: '分享你的链接或邀请码，好友注册后双方各得20积分。',
  shareLabel: '分享链接',
  contactsTitle: '你的联系人',
  contactsHint: '分享通讯录访问权限',
  contactsAllow: '允许',
};

export const REDEEM_COPY = {
  title: '输入邀请码',
  description:
    '输入代码兑换积分。新用户可通过朋友的邀请码获得 20 积分奖励 — 仅限一次。',
  redeemedHint: '欢迎奖励已领取。其他优惠码仍可使用。',
  submit: '兑换',
};

export const RULES_SECTIONS = [
  {
    title: '积分如何运作',
    items: [
      {
        title: '每次拍摄消耗1积分',
        body: '如果积分少于5，系统会提示你邀请好友或完成任务。',
      },
      {
        title: '邀请好友得20积分',
        body: '好友使用你的邀请码注册后，双方各得20积分。',
      },
    ],
  },
  {
    title: '赚取更多积分',
    items: [
      {
        title: '分享结果',
        body: '0/5',
        action: '分享',
      },
      {
        title: '发布到社区',
        body: '首次发布额外奖励',
        action: '发布',
      },
      {
        title: '邀请新用户',
        body: '每成功邀请1人 +20',
        action: '邀请',
      },
    ],
  },
];
