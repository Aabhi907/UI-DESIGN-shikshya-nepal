import type { Metadata } from 'next'
import Link from 'next/link'
import PolicyPage from '@/components/community/PolicyPage'

export const metadata: Metadata = { title: 'Contact SikshyaNepal', description: 'Contact SikshyaNepal for editorial, safety, privacy, copyright, advertising and billing enquiries.', alternates: { canonical: '/contact' } }

export default function ContactPage() {
  return <PolicyPage eyebrow="Operator information" title="Contact SikshyaNepal" intro="SikshyaNepal is an independently operated Nepal education-information platform based in Kathmandu, Nepal. Company registration details will be published here when incorporation is completed.">
    <h2>How to reach us</h2>
    <p>Our email domain is not yet active, so these forms are the way to reach us for now. Each one is reviewed by the SikshyaNepal team.</p>
    <ul>
      <li><Link href="/safety" className="font-bold text-primary hover:underline">Report a safety concern</Link> — including an urgent or child-safety issue.</li>
      <li><Link href="/privacy" className="font-bold text-primary hover:underline">Report a privacy concern</Link> — your data, an account or a deletion request.</li>
      <li><Link href="/safety?concern_type=other" className="font-bold text-primary hover:underline">Appeal a moderation decision</Link> — include the public name and the content link.</li>
      <li><Link href="/privacy?concern_type=other" className="font-bold text-primary hover:underline">Copyright or takedown request</Link> — include the SikshyaNepal URL and your rights in the work.</li>
      <li><Link href="/privacy?concern_type=other" className="font-bold text-primary hover:underline">Advertising and billing enquiries</Link> — sponsored placements remain visibly labelled and editorially reviewed.</li>
      <li><Link href="/privacy?concern_type=other" className="font-bold text-primary hover:underline">General and editorial enquiries</Link></li>
    </ul>
    <h2>Something wrong on a college page?</h2>
    <p>Use the &ldquo;Report incorrect information&rdquo; button on that college&apos;s profile page. It goes directly to our data-correction queue rather than the general report form.</p>
    <h2>Location</h2>
    <p>Kathmandu, Nepal</p>
  </PolicyPage>
}
