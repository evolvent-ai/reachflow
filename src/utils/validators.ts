// Form validation utilities

export function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function validatePhone(value: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(value.replace(/\s/g, ''));
}

export function validateWechat(value: string): boolean {
  const wechatRegex = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/;
  return wechatRegex.test(value);
}

export function validateContact(value: string): { valid: boolean; type: 'email' | 'phone' | 'wechat' | 'unknown' } {
  if (validateEmail(value)) {
    return { valid: true, type: 'email' };
  }
  if (validatePhone(value)) {
    return { valid: true, type: 'phone' };
  }
  if (validateWechat(value)) {
    return { valid: true, type: 'wechat' };
  }
  return { valid: false, type: 'unknown' };
}

export function isValidContact(value: string): boolean {
  return validateEmail(value) || validatePhone(value) || validateWechat(value);
}
