/**
 * WhatsApp Communication Service for Fittrock Sales
 * Supports:
 * 1. Direct 1-Click WhatsApp Web triggers with pre-populated templates.
 * 2. Extensible bridge for your internal custom WhatsApp API (currently under development).
 */

export interface WhatsAppTemplatePayload {
  customerName: string;
  phone: string;
  templateType: 'initial_intro' | 'quotation_followup' | 'order_confirmed' | 'shipping_tracking';
  variables?: {
    orderNumber?: string;
    productName?: string;
    carrierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    quoteAmount?: string;
  };
}

export function cleanIndianPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

export function generateWhatsAppMessage(payload: WhatsAppTemplatePayload): string {
  const { customerName, templateType, variables = {} } = payload;

  switch (templateType) {
    case 'initial_intro':
      return `Hi ${customerName}, thanks for your interest in Fittrock Ergonomic Desks! 🚀\nI'm from the Fittrock sales team. How can I help you set up your ideal sit-stand ergonomic workspace today?`;

    case 'quotation_followup':
      return `Hi ${customerName}, hope you're having a great day! Just checking in regarding the ergonomic setup quotation of ${variables.quoteAmount || 'our desks'} we discussed. Do you have any questions or need custom dimension suggestions?`;

    case 'order_confirmed':
      return `Hi ${customerName}, exciting news! Your Fittrock order ${variables.orderNumber || ''} has been confirmed by our sales team. Our warehouse is preparing your package for dispatch.`;

    case 'shipping_tracking':
      return `Hello ${customerName}, your Fittrock order ${variables.orderNumber || ''} is on its way! 📦\nCourier: ${variables.carrierName || 'Courier Partner'}\nAWB / Tracking: ${variables.trackingNumber || '-'}\nTrack live: ${variables.trackingUrl || 'https://fittrock.com/track'}`;

    default:
      return `Hi ${customerName}, greetings from Fittrock Ergonomics!`;
  }
}

export function getWhatsAppDirectUrl(phone: string, text: string): string {
  const formattedPhone = cleanIndianPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Placeholder hook for your in-development custom WhatsApp API.
 * When your backend WhatsApp API service is live, update this method to POST directly to your API endpoint!
 */
export async function sendCustomWhatsAppAPI(payload: WhatsAppTemplatePayload): Promise<{ success: boolean; message: string }> {
  // Currently under development - returns placeholder status
  return {
    success: false,
    message: 'Internal WhatsApp API is currently under active development. Direct WhatsApp Web link used instead.',
  };
}
