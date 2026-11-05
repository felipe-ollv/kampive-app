export function validRecoveryToken(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);
}
export function validateNewPassword(password: string, confirmation: string): string {
  if (
    password.length < 8 ||
    password.length > 128 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  )
    return 'Use de 8 a 128 caracteres, incluindo uma letra maiúscula e um número.';
  if (password !== confirmation) return 'As senhas não coincidem.';
  return '';
}
