import { create } from 'zustand';

import { INVITE_REWARD } from '@/utils/credits';

interface CreditsState {
  inviteCode: string;
  welcomeRedeemed: boolean;
  bonusPoints: number;
  redeemInviteCode: (code: string) => { ok: boolean; message: string };
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
  inviteCode: 'E87JHV',
  welcomeRedeemed: false,
  bonusPoints: 0,
  redeemInviteCode: (code) => {
    const normalized = normalizeCode(code);
    if (normalized.length !== 6) {
      return { ok: false, message: '请输入完整的 6 位邀请码' };
    }

    if (get().welcomeRedeemed) {
      return { ok: false, message: '欢迎奖励已领取，其他优惠码仍可使用' };
    }

    if (normalized === normalizeCode(get().inviteCode)) {
      return { ok: false, message: '不能使用自己的邀请码' };
    }

    set((state) => ({
      welcomeRedeemed: true,
      bonusPoints: state.bonusPoints + INVITE_REWARD,
    }));

    return { ok: true, message: `兑换成功，获得 ${INVITE_REWARD} 积分` };
  },
}));
