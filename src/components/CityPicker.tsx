import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { icon } from '../theme';
import type { MunicipalityData, ServiceCity } from '../types';
import { useDismiss } from './useDismiss';
import { usePopoverPlacement } from './usePopoverPlacement';

type Props = {
  label: string;
  value: ServiceCity[];
  onChange: (cities: ServiceCity[]) => void;
  loadCities: () => Promise<MunicipalityData>;
  error?: string;
};

const PANEL_HEIGHT = 320;

function normalized(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

type Chip = { key: string; label: string; remove: () => void };

export function CityPicker({ label, value, onChange, loadCities, error }: Props) {
  const searchId = useId();
  const panelId = useId();
  const [data, setData] = useState<MunicipalityData | null>(null);
  const [uf, setUf] = useState(value[0]?.uf ?? '');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(wrapperRef, open, close);
  const placement = usePopoverPlacement(wrapperRef, open, PANEL_HEIGHT);

  useEffect(() => {
    let active = true;
    loadCities().then((loaded) => {
      if (active) setData(loaded);
    });
    return () => {
      active = false;
    };
  }, [loadCities]);

  const stateCities = data && uf ? data.citiesByUf[uf] ?? [] : [];
  const terms = normalized(query.trim());
  const matches = terms ? stateCities.filter((city) => normalized(city.name).includes(terms)) : stateCities;
  const selectedIds = new Set(value.map((city) => city.ibge));
  const allOfState = stateCities.length > 0 && stateCities.every((city) => selectedIds.has(city.ibge));

  const toggle = (city: ServiceCity) =>
    onChange(selectedIds.has(city.ibge) ? value.filter((c) => c.ibge !== city.ibge) : [...value, city]);

  const toggleState = () => {
    const others = value.filter((city) => city.uf !== uf);
    onChange(allOfState ? others : [...others, ...stateCities]);
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (matches.length > 0) {
        toggle(matches[0]);
        setQuery('');
      }
    }
  };

  const chips: Chip[] = [];
  const byUf = new Map<string, ServiceCity[]>();
  value.forEach((city) => byUf.set(city.uf, [...(byUf.get(city.uf) ?? []), city]));
  byUf.forEach((cities, cityUf) => {
    const total = data?.citiesByUf[cityUf]?.length ?? 0;
    if (total > 0 && cities.length === total) {
      chips.push({
        key: `uf-${cityUf}`,
        label: `Todas as cidades de ${cityUf} (${total})`,
        remove: () => onChange(value.filter((city) => city.uf !== cityUf)),
      });
    } else {
      cities.forEach((city) =>
        chips.push({ key: String(city.ibge), label: `${city.name} – ${city.uf}`, remove: () => toggle(city) }),
      );
    }
  });

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor={searchId} className="font-semibold text-caption text-ink">
        {label}
      </label>
      <div ref={wrapperRef} className="relative flex gap-sm">
        <div className="relative flex h-control shrink-0 items-center rounded-control border border-border bg-surface transition-colors focus-within:border-primary">
          <select
            value={uf}
            onChange={(event) => {
              setUf(event.target.value);
              setQuery('');
              setOpen(true);
            }}
            aria-label="Estado"
            className={`h-full appearance-none rounded-control bg-surface pr-xl pl-md outline-none ${uf ? 'text-ink' : 'text-ink-faint'}`}
          >
            <option value="" disabled>
              UF
            </option>
            {data?.states.map((state) => (
              <option key={state.uf} value={state.uf}>
                {state.uf}
              </option>
            ))}
          </select>
          <ChevronDown size={icon.size.sm} strokeWidth={icon.strokeWidth} className="pointer-events-none absolute right-sm text-ink-muted" aria-hidden />
        </div>

        <div
          className={`relative flex h-control min-w-zero flex-1 items-center rounded-control border bg-surface transition-colors focus-within:border-primary ${
            error ? 'border-disagree' : 'border-border'
          }`}
        >
          <Search size={icon.size.md} strokeWidth={icon.strokeWidth} className="pointer-events-none absolute left-md text-ink-muted" aria-hidden />
          <input
            id={searchId}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKey}
            disabled={!uf}
            placeholder={uf ? `Buscar cidade de ${uf}` : 'Escolha o estado'}
            aria-invalid={error ? true : undefined}
            aria-controls={panelId}
            aria-expanded={open && Boolean(uf)}
            autoComplete="off"
            className="h-full min-w-zero flex-1 rounded-control bg-surface pr-md pl-control text-ink outline-none placeholder:text-ink-faint disabled:cursor-not-allowed"
          />
        </div>

        {open && uf ? (
          <div
            id={panelId}
            role="group"
            aria-label={`Cidades de ${uf}`}
            style={{ maxHeight: placement.maxHeight }}
            className={`absolute right-zero left-zero z-20 flex flex-col rounded-control border border-border bg-surface p-xs shadow-card ${
              placement.side === 'below' ? 'top-full mt-xs' : 'bottom-full mb-xs'
            }`}
          >
            {!terms ? (
              <label className="flex shrink-0 cursor-pointer items-center gap-md rounded-control border-b border-border px-md py-sm font-semibold text-ink hover:bg-surface-alt">
                <input type="checkbox" checked={allOfState} onChange={toggleState} className="h-legend-key w-legend-key shrink-0 accent-primary" />
                Todas as cidades de {uf} ({stateCities.length})
              </label>
            ) : null}
            <div className="flex min-h-zero flex-col overflow-y-auto">
              {!data ? <p className="px-md py-sm text-caption text-ink-muted">Carregando as cidades…</p> : null}
              {data && matches.length === 0 ? (
                <p className="px-md py-sm text-caption text-ink-muted">Nenhuma cidade de {uf} com esse nome.</p>
              ) : null}
              {matches.map((city) => (
                <label
                  key={city.ibge}
                  className="flex shrink-0 cursor-pointer items-center gap-md rounded-control px-md py-sm text-ink hover:bg-surface-alt"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(city.ibge)}
                    onChange={() => toggle(city)}
                    className="h-legend-key w-legend-key shrink-0 accent-primary"
                  />
                  {city.name}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {chips.length > 0 ? (
        <ul className="flex flex-wrap gap-xs" aria-label="Cidades escolhidas">
          {chips.map((chip) => (
            <li key={chip.key} className="flex items-center gap-xs rounded-pill bg-surface-alt py-xs pr-xs pl-sm text-caption text-ink">
              {chip.label}
              <button
                type="button"
                onClick={chip.remove}
                aria-label={`Remover ${chip.label}`}
                className="flex items-center justify-center rounded-pill text-ink-muted hover:text-ink"
              >
                <X size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className={`text-caption ${error ? 'text-disagree' : 'text-ink-muted'}`}>
        {error ?? 'Escolha o estado e marque as cidades. Dá para juntar cidades de mais de um estado.'}
      </p>
    </div>
  );
}
