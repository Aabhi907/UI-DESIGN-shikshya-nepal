import { revalidatePath } from 'next/cache'

type CachePath = { path: string; type?: 'page' }

function revalidate(paths: CachePath[]) {
  let ok = true
  for (const { path, type } of paths) {
    try {
      revalidatePath(path, type)
    } catch (error) {
      ok = false
      console.error('[college-cache:revalidate]', { path, error })
    }
  }
  return ok
}

export function revalidateCollege(slug: string) {
  return revalidate([{ path: `/colleges/${slug}` }])
}

export function revalidateCollegeListings() {
  return revalidate([
    { path: '/colleges' },
    { path: '/colleges/in/[location]', type: 'page' },
    { path: '/colleges/province/[province]', type: 'page' },
    { path: '/colleges/program/[slug]', type: 'page' },
    { path: '/colleges/nearby' },
    { path: '/programs' },
    { path: '/programs/[slug]', type: 'page' },
  ])
}

export function revalidateAllCollegePages() {
  const profilesOk = revalidate([{ path: '/colleges/[slug]', type: 'page' }])
  const listingsOk = revalidateCollegeListings()
  return profilesOk && listingsOk
}
