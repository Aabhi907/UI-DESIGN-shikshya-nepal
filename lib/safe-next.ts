/** Accept only local, public application paths for post-authentication redirects. */
export function safeNextPath(value: string | null | undefined, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f]/.test(value) || /%(?![0-9a-f]{2})/i.test(value)) return fallback
  try {
    let decoded = value
    for (let i = 0; i < 4 && /%[0-9a-f]{2}/i.test(decoded); i++) {
      decoded = decodeURIComponent(decoded)
    }
    if (!decoded.startsWith('/') || decoded.startsWith('//') || decoded.includes('\\') || /[\u0000-\u001f]/.test(decoded) || /%[0-9a-f]{2}/i.test(decoded)) return fallback
    const parsed = new URL(value, 'https://sikshyanepal.local')
    const decodedPath = new URL(decoded, 'https://sikshyanepal.local')
    if ([parsed, decodedPath].some(path => path.origin !== 'https://sikshyanepal.local' || path.pathname.startsWith('//') || path.pathname.toLowerCase().startsWith('/admin'))) return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
