import { create } from 'zustand';
import type { Tier, Order, CreditsBalance, CreateOrderResponse } from '@/services/payment.api';

interface PaymentState {
  // 套餐列表
  tiers: Tier[];
  isLoadingTiers: boolean;
  tiersError: string | null;

  // 当前订单
  currentOrder: CreateOrderResponse | null;
  isCreatingOrder: boolean;
  createOrderError: string | null;

  // 订单状态
  orderStatus: Order | null;
  isPolling: boolean;

  // 积分余额
  credits: CreditsBalance | null;
  isLoadingCredits: boolean;

  // 支付弹窗
  isPaymentModalOpen: boolean;
  paymentStatus: 'idle' | 'pending' | 'success' | 'failed' | 'expired';

  // Actions
  setTiers: (tiers: Tier[]) => void;
  setIsLoadingTiers: (loading: boolean) => void;
  setTiersError: (error: string | null) => void;

  setCurrentOrder: (order: CreateOrderResponse | null) => void;
  setIsCreatingOrder: (loading: boolean) => void;
  setCreateOrderError: (error: string | null) => void;

  setOrderStatus: (status: Order | null) => void;
  setIsPolling: (polling: boolean) => void;

  setCredits: (credits: CreditsBalance | null) => void;
  setIsLoadingCredits: (loading: boolean) => void;

  openPaymentModal: () => void;
  closePaymentModal: () => void;
  setPaymentStatus: (status: 'idle' | 'pending' | 'success' | 'failed' | 'expired') => void;

  // 重置状态
  resetOrderState: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  // 初始状态
  tiers: [],
  isLoadingTiers: false,
  tiersError: null,

  currentOrder: null,
  isCreatingOrder: false,
  createOrderError: null,

  orderStatus: null,
  isPolling: false,

  credits: null,
  isLoadingCredits: false,

  isPaymentModalOpen: false,
  paymentStatus: 'idle',

  // Actions
  setTiers: (tiers) => set({ tiers }),
  setIsLoadingTiers: (isLoadingTiers) => set({ isLoadingTiers }),
  setTiersError: (tiersError) => set({ tiersError }),

  setCurrentOrder: (currentOrder) => set({ currentOrder }),
  setIsCreatingOrder: (isCreatingOrder) => set({ isCreatingOrder }),
  setCreateOrderError: (createOrderError) => set({ createOrderError }),

  setOrderStatus: (orderStatus) => set({ orderStatus }),
  setIsPolling: (isPolling) => set({ isPolling }),

  setCredits: (credits) => set({ credits }),
  setIsLoadingCredits: (isLoadingCredits) => set({ isLoadingCredits }),

  openPaymentModal: () => set({ isPaymentModalOpen: true }),
  closePaymentModal: () => set({ isPaymentModalOpen: false }),
  setPaymentStatus: (paymentStatus) => set({ paymentStatus }),

  resetOrderState: () => set({
    currentOrder: null,
    isCreatingOrder: false,
    createOrderError: null,
    orderStatus: null,
    isPolling: false,
    paymentStatus: 'idle',
  }),
}));
