export const mockToday = '2026-10-25';

const MOCK_NOW_START = Date.parse(`${mockToday}T20:00:00.000Z`);
const appStartedAt = Date.now();

export function mockNow(): string {
  return new Date(MOCK_NOW_START + (Date.now() - appStartedAt)).toISOString();
}
