import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Check, Zap } from 'lucide-react';
import { getTiers, getCreditsBalance, type Tier } from '@/services/payment.api';
import { usePaymentStore } from '@/stores/paymentStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import PaymentModal from '@/components/payment/PaymentModal';

export default function PricingPage() {
  const { track } = useAnalytics();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    tiers,
    isLoadingTiers,
    tiersError,
    credits,
    isLoadingCredits,
    setTiers,
    setIsLoadingTiers,
    setTiersError,
    setCredits,
    setIsLoadingCredits,
  } = usePaymentStore();

  // 加载套餐列表和积分余额
  useEffect(() => {
    track('page_view', { page: 'pricing' });

    const loadData = async () => {
      // 加载套餐
      setIsLoadingTiers(true);
      try {
        const data = await getTiers();
        setTiers(data.tiers.filter(t => t.is_active).sort((a, b) => a.sort_order - b.sort_order));
      } catch (error) {
        setTiersError(error instanceof Error ? error.message : '加载失败');
      } finally {
        setIsLoadingTiers(false);
      }

      // 加载积分余额
      setIsLoadingCredits(true);
      try {
        const balance = await getCreditsBalance();
        setCredits(balance);
      } catch (error) {
        console.error('Failed to load credits:', error);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    loadData();
  }, [track, setTiers, setIsLoadingTiers, setTiersError, setCredits, setIsLoadingCredits]);

  const handleSelectTier = (tier: Tier) => {
    setSelectedTier(tier);
    setIsModalOpen(true);
    track('pricing_select', { tier: tier.code, price: tier.price });
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const calculateUnitPrice = (price: number, credits: number) => {
    return (price / credits / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="联脉"
                className="w-10 h-10 rounded-lg"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-text leading-tight">联脉</span>
                <span className="text-xs text-text-secondary leading-tight">ReachFlow</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {!isLoadingCredits && credits && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <Zap size={18} className="text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {credits.credits} 积分
                  </span>
                </div>
              )}
              <Link
                to="/research"
                className="btn btn-secondary text-sm"
              >
                AI 背调
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
            选择适合您的套餐
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            购买积分，解锁更多 AI 背调次数。积分永久有效，用多少扣多少。
          </p>
        </div>

        {isLoadingTiers ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : tiersError ? (
          <div className="text-center py-20">
            <p className="text-error">{tiersError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn btn-primary"
            >
              重新加载
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <div
                key={tier.uid}
                className={`relative bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                  index === 2
                    ? 'border-primary shadow-card scale-105'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {index === 2 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                      最受欢迎
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-text mb-2">{tier.name}</h3>
                  <p className="text-sm text-text-secondary">{tier.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-text">¥</span>
                    <span className="text-5xl font-bold text-text">{formatPrice(tier.price)}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {tier.credits_amount} 积分
                  </p>
                  <p className="text-xs text-primary mt-1">
                    ¥{calculateUnitPrice(tier.price, tier.credits_amount)}/次
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    <span>{tier.credits_amount} 次 AI 背调</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    <span>永久有效</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    <span>全功能解锁</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectTier(tier)}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    index === 2
                      ? 'btn btn-primary'
                      : 'btn btn-outline'
                  }`}
                >
                  立即购买
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-text text-center mb-8">常见问题</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-text mb-2">积分会过期吗？</h3>
              <p className="text-text-secondary text-sm">
                不会，购买的积分永久有效，您可以随时使用。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-text mb-2">如何查看剩余积分？</h3>
              <p className="text-text-secondary text-sm">
                页面右上角会显示您的当前积分余额，也可以在 AI 背调页面查看。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-text mb-2">支付失败怎么办？</h3>
              <p className="text-text-secondary text-sm">
                如果支付遇到问题，请检查网络连接或更换支付方式重试。如仍有问题，请联系客服。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tier={selectedTier}
      />
    </div>
  );
}
