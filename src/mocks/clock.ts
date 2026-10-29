export const mockToday = '2026-10-25';

export function mockNow(): string {
  return `${mockToday}${new Date().toISOString().slice(10)}`;
}
