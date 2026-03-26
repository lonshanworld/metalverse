export const PASSWORD_MIN_LENGTH = 8;
const SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9]/;

export function hasMinimumPasswordLength(password: string) {
  return password.length >= PASSWORD_MIN_LENGTH;
}

export function hasSpecialCharacter(password: string) {
  return SPECIAL_CHARACTER_PATTERN.test(password);
}

export function passwordsMatch(password: string, confirmPassword: string) {
  return password.length > 0 && password === confirmPassword;
}

export function getPasswordValidationState(password: string, confirmPassword?: string) {
  const hasMinLength = hasMinimumPasswordLength(password);
  const hasSpecial = hasSpecialCharacter(password);
  const matched = typeof confirmPassword === "string" ? passwordsMatch(password, confirmPassword) : false;

  return {
    hasMinLength,
    hasSpecial,
    matched,
    isValid: typeof confirmPassword === "string" ? hasMinLength && hasSpecial && matched : hasMinLength && hasSpecial,
  };
}
