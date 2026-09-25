export function publicListState<T>(result: { data: T[] | null; error: unknown }) {
  return result.error
    ? { items: [] as T[], loadError: true }
    : { items: result.data ?? [], loadError: false }
}
