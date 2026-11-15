const VIACEP_URL = 'https://viacep.com.br/ws';

export type AddressLookup = { street: string; district: string; city: string; state: string };

type ViaCepResponse = { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean };

export async function lookupZipCode(zipCode: string): Promise<AddressLookup | null> {
  try {
    const response = await fetch(`${VIACEP_URL}/${zipCode}/json/`);
    if (!response.ok) return null;
    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) return null;
    return {
      street: data.logradouro ?? '',
      district: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    };
  } catch {
    return null;
  }
}
