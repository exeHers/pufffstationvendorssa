export type SupportBotFaq = {
  question: string
  answer: string
}

export type SupportBotConfig = {
  widget_title: string
  welcome_message: string
  busy_message: string
  fallback_email: string
  faqs: SupportBotFaq[]
}

export const DEFAULT_SUPPORT_BOT_CONFIG: SupportBotConfig = {
  widget_title: 'Support Assistant',
  welcome_message:
    'Hi, I am your support assistant. Ask about orders, delivery, payments, or request a live agent.',
  busy_message:
    'All agents are currently busy. You can continue waiting here, or come back later and we will still assist you.',
  fallback_email: 'support@pufffstationsa.co.za',
  faqs: [
    {
      question: 'How long does delivery take?',
      answer: 'Most orders dispatch within 24 hours and delivery timing depends on your area.',
    },
    {
      question: 'How can I track my order?',
      answer: 'Open My orders after login to check your current order status and updates.',
    },
    {
      question: 'What payment options are available?',
      answer: 'You can place order requests and complete payment by EFT via support confirmation.',
    },
  ],
}

export function sanitizeSupportBotConfig(value: unknown): SupportBotConfig {
  const raw = (value ?? {}) as Partial<SupportBotConfig>
  const faqs = Array.isArray(raw.faqs)
    ? raw.faqs
        .map((item) => ({
          question: String(item?.question ?? '').trim(),
          answer: String(item?.answer ?? '').trim(),
        }))
        .filter((item) => item.question && item.answer)
    : DEFAULT_SUPPORT_BOT_CONFIG.faqs

  return {
    widget_title: String(raw.widget_title ?? DEFAULT_SUPPORT_BOT_CONFIG.widget_title).trim() || DEFAULT_SUPPORT_BOT_CONFIG.widget_title,
    welcome_message:
      String(raw.welcome_message ?? DEFAULT_SUPPORT_BOT_CONFIG.welcome_message).trim() ||
      DEFAULT_SUPPORT_BOT_CONFIG.welcome_message,
    busy_message:
      String(raw.busy_message ?? DEFAULT_SUPPORT_BOT_CONFIG.busy_message).trim() ||
      DEFAULT_SUPPORT_BOT_CONFIG.busy_message,
    fallback_email:
      String(raw.fallback_email ?? DEFAULT_SUPPORT_BOT_CONFIG.fallback_email).trim() ||
      DEFAULT_SUPPORT_BOT_CONFIG.fallback_email,
    faqs: faqs.length ? faqs : DEFAULT_SUPPORT_BOT_CONFIG.faqs,
  }
}
