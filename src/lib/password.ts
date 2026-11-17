export function passwordError(password: string) {
  if (password.length < 10) return "A senha precisa ter pelo menos 10 caracteres.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "A senha precisa ter letras e números.";
  }
  return null;
}
