export function greetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return 'Bom dia, Aventureiro';
  if (hour >= 12 && hour < 18) return 'Boa tarde, Aventureiro';
  return 'Boa noite, Aventureiro';
}
