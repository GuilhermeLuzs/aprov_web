import type { BrazilState, MunicipalityData } from '../types';

type RawData = { states: BrazilState[]; cities: Record<string, [number, string][]> };

let cached: Promise<MunicipalityData> | null = null;

export function loadMunicipalities(): Promise<MunicipalityData> {
  cached ??= import('./municipalities.json').then(({ default: raw }) => {
    const data = raw as unknown as RawData;
    const citiesByUf = Object.fromEntries(
      Object.entries(data.cities).map(([uf, list]) => [uf, list.map(([ibge, name]) => ({ ibge, name, uf }))]),
    );
    return { states: data.states, citiesByUf };
  });
  return cached;
}
