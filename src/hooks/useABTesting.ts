import { useEffect } from 'react';
import { useABStore } from '@/stores/abStore';
import { useAnalytics } from './useAnalytics';
import type { ABVariants } from '@/types';

export function useABTesting() {
  const { variants, setVariants } = useABStore();
  const { track } = useAnalytics();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const newVariants: ABVariants = {
      h1: (params.get('ab_h1') as ABVariants['h1']) || 'default',
      secondary: (params.get('ab_secondary') as ABVariants['secondary']) || 'default',
      formFields: (params.get('ab_form_fields') as ABVariants['formFields']) || 'default',
      trust: (params.get('ab_trust') as ABVariants['trust']) || 'default',
      pricing: (params.get('ab_pricing') as ABVariants['pricing']) || 'default',
    };
    setVariants(newVariants);
    track('ab_variant_applied', newVariants);
  }, [setVariants, track]);

  return variants;
}
