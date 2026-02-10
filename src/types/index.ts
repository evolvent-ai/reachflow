// Global types

export interface ABVariants {
  h1?: 'default' | 'B';
  secondary?: 'default' | 'demo' | 'whitepaper';
  formFields?: 'default' | 'extended' | '5';
  trust?: 'default' | 'logos' | 'metrics';
  pricing?: 'default' | 'hidden';
}

export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  [key: string]: any;
}

export interface ContactFormData {
  company: string;
  contact: string;
  scenario: string;
  market?: string;
  volume?: string;
}

export type ScenarioType = 'foreign_trade' | 'marketing' | 'recruitment';

export interface Scenario {
  id: ScenarioType;
  title: string;
  description: string;
  features: string[];
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

// Window extensions
declare global {
  interface Window {
    dataLayer?: AnalyticsEvent[];
    __RESEARCH_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}
