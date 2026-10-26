import { useSyncExternalStore } from 'react';
import { products as seededProducts } from '../mocks';
import type { Product, ProductStatus } from '../types';

let products: Product[] = seededProducts;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setProductStatus(productId: string, status: ProductStatus) {
  products = products.map((product) => (product.id === productId ? { ...product, status } : product));
  listeners.forEach((listener) => listener());
}

export function useProducts(): Product[] {
  return useSyncExternalStore(subscribe, () => products);
}
