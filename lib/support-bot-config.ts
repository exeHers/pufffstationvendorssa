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
      answer:
        'Most door deliveries dispatch within 24 hours. Gauteng + major metros usually land within 1-2 working days, outlying towns may take 2-4.',
    },
    {
      question: 'Can I collect from a PUDO locker?',
      answer:
        'Yes. Choose PUDO at checkout, search your suburb, and select the locker you prefer. We’ll notify you when the parcel is ready for collection.',
    },
    {
      question: 'How can I track my order?',
      answer: 'Log into your profile and open My Orders to see live status updates. We’ll also WhatsApp you once the parcel ships.',
    },
    {
      question: 'Do you sell genuine products?',
      answer:
        'We only ship sealed, vendor-grade stock sourced from the official PUFFF Station supply chain. Every device is QA checked before dispatch.',
    },
    {
      question: 'What payment options are available?',
      answer:
        'Submit your cart via WhatsApp checkout. Our ops team confirms availability and sends EFT instructions or a secure payment link.',
    },
    {
      question: 'Can I place bulk or vendor orders?',
      answer:
        'Absolutely. Mention your required volumes in chat or email support@pufffstationsa.co.za and we will quote distributor pricing plus lead times.',
    },
    {
      question: 'What is the return or swap policy?',
      answer:
        'Faulty units must be reported within 48 hours of delivery with an unboxing video. We review each case and either credit, swap, or repair where possible.',
    },
    {
      question: 'Do devices arrive charged?',
      answer:
        'All disposables leave fully sealed with built-in batteries. Keep them upright, avoid extreme heat, and store away from pets/kids.',
    },
    {
      question: 'How do refunds work?',
      answer:
        'Refunds are handled manually by finance. Provide your order reference plus proof of payment, and we aim to process within 2-3 working days.',
    },
    {
      question: 'When are live agents available?',
      answer:
        'Weekdays 08:00-20:00 and Saturdays 09:00-15:00. Outside those hours, leave a message and the team circles back once online.',
    },
    {
      question: 'Still need help?',
      answer:
        'Hit “Talk to an agent” in the widget or email support@pufffstationsa.co.za with your order reference so we can dive in.',
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
