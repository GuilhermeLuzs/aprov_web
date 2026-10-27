import { useSyncExternalStore } from 'react';
import { products as seededProducts } from '../mocks';
import type { Product, ProductStatus } from '../types';

let products: Product[] = seededProducts;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function setProductStatus(productId: string, status: ProductStatus) {
  products = products.map((product) => (product.id === productId ? { ...product, status } : product));
  emit();
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const created = { ...product, id: `p${Date.now()}` };
  products = [...products, created];
  emit();
  return created;
}

export function updateProduct(product: Product) {
  products = products.map((current) => (current.id === product.id ? product : current));
  emit();
}

export function findProduct(productId: string): Product | undefined {
  return products.find((product) => product.id === productId);
}

export function useProducts(): Product[] {
  return useSyncExternalStore(subscribe, () => products);
}
