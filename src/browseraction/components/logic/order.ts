export type UrlOrder = 'original' | 'reverse' | 'random'

export function parseUrlOrder(value: unknown): UrlOrder {
  return value === 'reverse' || value === 'random' ? value : 'original'
}
