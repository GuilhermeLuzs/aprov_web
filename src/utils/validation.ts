const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const PHONE_LENGTHS = [10, 11];
const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function onlyDigits(text: string): string {
  return text.replace(/\D/g, '');
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function formatCpf(text: string): string {
  const digits = onlyDigits(text).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

function cpfCheckDigit(digits: number[]): number {
  const weightStart = digits.length + 1;
  const sum = digits.reduce((total, digit, i) => total + digit * (weightStart - i), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

export function isValidCpf(text: string): boolean {
  const digits = onlyDigits(text).split('').map(Number);
  if (digits.length !== 11) return false;
  if (digits.every((d) => d === digits[0])) return false;
  const first = cpfCheckDigit(digits.slice(0, 9));
  const second = cpfCheckDigit(digits.slice(0, 10));
  return first === digits[9] && second === digits[10];
}

export function formatCnpj(text: string): string {
  const digits = onlyDigits(text).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function cnpjCheckDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce((total, digit, i) => total + digit * weights[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function isValidCnpj(text: string): boolean {
  const digits = onlyDigits(text).split('').map(Number);
  if (digits.length !== 14) return false;
  if (digits.every((d) => d === digits[0])) return false;
  const first = cnpjCheckDigit(digits.slice(0, 12), CNPJ_FIRST_WEIGHTS);
  const second = cnpjCheckDigit(digits.slice(0, 13), CNPJ_SECOND_WEIGHTS);
  return first === digits[12] && second === digits[13];
}

export function formatPhone(text: string): string {
  const digits = onlyDigits(text).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function isValidPhone(text: string): boolean {
  return PHONE_LENGTHS.includes(onlyDigits(text).length);
}

export type PasswordRules = { length: boolean; letter: boolean; number: boolean };

export function passwordRules(password: string): PasswordRules {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    letter: /[A-Za-zÀ-ÿ]/.test(password),
    number: /\d/.test(password),
  };
}

export function isValidPassword(password: string): boolean {
  const rules = passwordRules(password);
  return rules.length && rules.letter && rules.number;
}
