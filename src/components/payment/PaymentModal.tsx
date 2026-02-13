import { useEffect, useState, useCallback } from 'react';
import { X, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { usePaymentStore } from '@/stores/paymentStore';
import { createOrder, pollOrderStatus, getCreditsBalance, type Tier } from '@/services/payment.api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: Tier | null;
}

export default function PaymentModal({ isOpen, onClose, tier }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);

  const {
    currentOrder,
    isCreatingOrder,
    createOrderError,
    paymentStatus,
    setCurrentOrder,
    setIsCreatingOrder,
    setCreateOrderError,
    setPaymentStatus,
    setCredits,
    resetOrderState,
  } = usePaymentStore();

  // 刷新积分余额
  const refreshCredits = useCallback(async () => {
    try {
      const balance = await getCreditsBalance();
      setCredits(balance);
    } catch (error) {
      console.error('Failed to refresh credits:', error);
    }
  }, [setCredits]);

  // 创建订单
  const handleCreateOrder = useCallback(async () => {
    if (!tier) return;

    setIsCreatingOrder(true);
    setCreateOrderError(null);
    setPaymentStatus('pending');

    try {
      const order = await createOrder({
        tier_uid: tier.uid,
        payment_method: paymentMethod,
      });
      setCurrentOrder(order);

      // 开始轮询订单状态
      const stop = pollOrderStatus(
        order.uid,
        async () => {
          setPaymentStatus('success');
          // 支付成功后刷新积分
          await refreshCredits();
        },
        (failedOrder) => {
          if (failedOrder.status === 'expired') {
            setPaymentStatus('expired');
          } else {
            setPaymentStatus('failed');
          }
        },
        3000
      );
      setStopPolling(() => stop);
    } catch (error) {
      setCreateOrderError(error instanceof Error ? error.message : '创建订单失败');
      setPaymentStatus('failed');
    } finally {
      setIsCreatingOrder(false);
    }
  }, [tier, paymentMethod, setCurrentOrder, setIsCreatingOrder, setCreateOrderError, setPaymentStatus, refreshCredits]);

  // 关闭弹窗时清理
  const handleClose = useCallback(() => {
    if (stopPolling) {
      stopPolling();
    }
    resetOrderState();
    onClose();
  }, [stopPolling, resetOrderState, onClose]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (stopPolling) {
        stopPolling();
      }
    };
  }, [stopPolling]);

  if (!isOpen || !tier) return null;

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {paymentStatus === 'success' ? '支付成功' : '扫码支付'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStatus === 'success' ? (
            // 支付成功
            <div className="text-center py-8">
              <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">支付成功！</h4>
              <p className="text-gray-600 mb-2">
                已成功购买 <span className="font-semibold text-primary">{tier.name}</span>
              </p>
              <p className="text-gray-600">
                获得 <span className="font-semibold text-primary">{tier.credits_amount}</span> 积分
              </p>
              <button
                onClick={handleClose}
                className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
              >
                完成
              </button>
            </div>
          ) : paymentStatus === 'expired' ? (
            // 订单过期
            <div className="text-center py-8">
              <Clock size={64} className="mx-auto text-orange-500 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">订单已过期</h4>
              <p className="text-gray-600 mb-6">支付超时，请重新下单</p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
              >
                重新购买
              </button>
            </div>
          ) : paymentStatus === 'failed' ? (
            // 支付失败
            <div className="text-center py-8">
              <XCircle size={64} className="mx-auto text-red-500 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">支付失败</h4>
              <p className="text-gray-600 mb-6">{createOrderError || '请稍后重试'}</p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
              >
                重新购买
              </button>
            </div>
          ) : currentOrder ? (
            // 显示二维码
            <div className="text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">订单金额</p>
                <p className="text-3xl font-bold text-gray-900">
                  ¥{formatPrice(currentOrder.total_amount)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                {currentOrder.qr_code ? (
                  <img
                    src={currentOrder.qr_code}
                    alt="支付二维码"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-200 rounded-lg">
                    <Loader2 size={32} className="text-gray-400 animate-spin" />
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">
                请使用{paymentMethod === 'wechat' ? '微信' : '支付宝'}扫码支付
              </p>
              <p className="text-xs text-gray-400">
                订单号：{currentOrder.order_no}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span>等待支付...</span>
              </div>
            </div>
          ) : (
            // 选择支付方式
            <div>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">订单金额</p>
                <p className="text-3xl font-bold text-gray-900">¥{formatPrice(tier.price)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {tier.name} · {tier.credits_amount} 积分
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wechat"
                    checked={paymentMethod === 'wechat'}
                    onChange={() => setPaymentMethod('wechat')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="ml-3 flex-1 font-medium">微信支付</span>
                  <span className="text-2xl">💚</span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="alipay"
                    checked={paymentMethod === 'alipay'}
                    onChange={() => setPaymentMethod('alipay')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="ml-3 flex-1 font-medium">支付宝</span>
                  <span className="text-2xl">💙</span>
                </label>
              </div>

              {createOrderError && (
                <p className="text-sm text-red-500 mb-4 text-center">{createOrderError}</p>
              )}

              <button
                onClick={handleCreateOrder}
                disabled={isCreatingOrder}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    创建订单中...
                  </>
                ) : (
                  '确认支付'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
