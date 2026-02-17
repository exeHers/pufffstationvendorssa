export type WhatsAppConfig = {
  whatsapp_number: string
  support_message: string
  checkout_message_template: string
}

export const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  whatsapp_number: '27712345678',
  support_message: 'Hi PUFFF Station, I need some help with...',
  checkout_message_template:
    '*NEW ORDER REQUEST*\n' +
    'Ref: #{order_ref}\n\n' +
    'Customer: {customer_name}\n' +
    'Phone: {customer_phone}\n\n' +
    'Order Details:\n{items_list}\n\n' +
    'Delivery: {delivery_method}\n' +
    '{delivery_text}\n\n' +
    'TOTAL: R{total}\n\n' +
    '_Please confirm stock and send banking details._',
}

export function normalizeWhatsAppNumber(value?: string | null) {
  const clean = (value || '').replace(/\D/g, '')
  return clean || DEFAULT_WHATSAPP_CONFIG.whatsapp_number
}

export function renderCheckoutTemplate(
  template: string,
  values: Record<string, string>
) {
  return Object.entries(values).reduce((acc, [key, value]) => {
    const safe = value ?? ''
    return acc.replaceAll(`{${key}}`, safe)
  }, template)
}
