export const dynamic = 'force-dynamic'

import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase";
import { nepalDateOnly } from "@/lib/admissions";
import { DATE_NOT_PUBLISHED } from "@/lib/utils";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Calendar,
  GraduationCap,
  GitCompare,
  ExternalLink,
} from "lucide-react";
import ReviewForm from "@/components/colleges/ReviewForm";
import ReviewResponseForm from "@/components/colleges/ReviewResponseForm";
import ApplyNowButton from "@/components/colleges/ApplyNowButton";
import SaveCollegeButton from "@/components/colleges/SaveCollegeButton";
import AdUnit from "@/components/ads/AdUnit";
import type { College, CollegeProgram, Review, News } from "@/types";
import VerificationBadge from "@/components/institutions/VerificationBadge";
import ReportCorrectionForm from "@/components/institutions/ReportCorrectionForm";
import AdmissionCard from "@/components/admissions/AdmissionCard";
import ShareButton from "@/components/ui/ShareButton";
import type { Admission } from "@/types";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import { collegeDisplayAffiliation, collegeDisplayLocation, collegeDisplayPrograms, hasActiveCollegeSponsorship, safeCollegeAddress, safeEmailAddress, safeExternalUrl, safePhoneHref } from "@/lib/college-display";
import CollegeDecisionCheck from "@/components/colleges/CollegeDecisionCheck";
import CollegeEvidenceLedger, { type CollegeEvidence } from "@/components/colleges/CollegeEvidenceLedger";
import Card from "@/components/design-system/Card";
import Pill from "@/components/design-system/Pill";
import EvidenceChip from "@/components/design-system/EvidenceChip";
import IconTile from "@/components/design-system/IconTile";

const BASE_URL = SITE_URL;

function metadataDescription(college: College) {
  const location = collegeDisplayLocation(college)
  const affiliation = collegeDisplayAffiliation(college.affiliation)
  const programs = collegeDisplayPrograms(college.programs_offered)
  const facts = [
    location ? `${college.name} is listed in ${location}` : college.name,
    affiliation ? `affiliated with ${affiliation}` : null,
    programs.length ? `with ${programs.slice(0, 3).join(', ')} listed` : null,
  ].filter(Boolean)
  const text = `${facts.join('. ')}. Check official sources for current admissions, fees and availability.`.replace(/\s+/g, " ").trim()
  return text.length > 157 ? `${text.slice(0, 154).trimEnd()}...` : text;
}

function routeSegment(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Turn a source URL into a short, readable citation like "tribhuvan-university.edu.np". */
function sourceLabel(url: string | null): string {
  if (!url) return 'Official source';
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'Official source' }
}

const getCollege = cache(async function getCollege(slug: string) {
  const supabase = createServerSupabaseClient();
  const { data: college } = await supabase
    .from("colleges")
    .select("id,name,slug,location,district,province,local_level,affiliation,logo_url,cover_url,is_featured,verification_status,programs_offered,education_levels,is_sponsored,sponsor_label,sponsor_starts_at,sponsor_ends_at,sponsor_disclosure,description,address,phone,email,website,established_year,status,source_name,source_url,last_verified_at,facilities,created_at,updated_at")
    .eq("slug", slug)
    .or("status.eq.active,status.is.null")
    .single();

  if (!college) return null;

  const [programsRes, reviewsRes, reviewStatsRes, scholarshipsRes, admissionsRes, newsRes, evidenceRes] = await Promise.all([
    supabase
      .from("college_programs")
      .select("*, program:programs(*)")
      .eq("college_id", college.id),
    supabase
      .from("reviews")
      .select("id,rating,review_text,student_name,program,year,verification_status,teaching_rating,facilities_rating,administration_rating,value_rating,placement_rating,attendance_rating,safety_rating,internship_support_rating,hidden_costs_reported,hostel_transport_note,review_responses(id,response_text,status)")
      .eq("college_id", college.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("reviews")
      .select("rating", { count: "exact" })
      .eq("college_id", college.id)
      .eq("is_approved", true)
      .range(0, 4999),
    supabase.from("scholarships").select("*").eq("college_id", college.id).eq("is_active", true),
    supabase
      .from("admissions")
      .select("*, college:colleges(id,name,slug,location)")
      .eq("college_id", college.id)
      .eq("status", "published")
      .or(`application_deadline.is.null,application_deadline.gte.${nepalDateOnly()}`)
      .order("application_deadline", { ascending: true })
      .limit(4),
    supabase.from("news").select("id,title,slug,published_date,content_category").eq("college_id", college.id).eq("status", "published").order("published_date", { ascending: false, nullsFirst: false }).limit(5),
    supabase.from("college_evidence").select("id,field_key,claim_summary,source_name,source_url,checked_at,confidence_score,verification_status").eq("college_id",college.id).in("verification_status",["source_verified","editor_verified"]).is("superseded_at",null).order("checked_at",{ascending:false}).limit(12),
  ]);

  const ratingRows = reviewStatsRes.error ? (reviewsRes.data || []) : (reviewStatsRes.data || []);
  const approvedRatings = ratingRows.map(item => Number(item.rating)).filter(Number.isFinite);
  const reviewCount = reviewStatsRes.error ? approvedRatings.length : (reviewStatsRes.count ?? approvedRatings.length);
  const averageRating = reviewCount === approvedRatings.length && approvedRatings.length > 0
    ? approvedRatings.reduce((sum, rating) => sum + rating, 0) / approvedRatings.length
    : null;

  return {
    college: college as unknown as College,
    programs: (programsRes.data || []) as CollegeProgram[],
    reviews: (reviewsRes.data || []) as unknown as Review[],
    reviewStats: { averageRating, reviewCount },
    scholarships: scholarshipsRes.data || [],
    admissions: (admissionsRes.data || []) as Admission[],
    news: (newsRes.data || []) as News[],
    evidence: (evidenceRes.data || []) as CollegeEvidence[],
  };
})

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getCollege(params.slug);
  if (!data) return { title: "College Not Found" };
  const { college } = data;
  const description = metadataDescription(college);
  return {
    title: `${college.name}: Programs, Admissions and Verified Details`,
    description,
    openGraph: {
      title: college.name,
      description,
      url: `${BASE_URL}/colleges/${college.slug}`,
      type: "website",
      images: college.cover_url ? [{ url: college.cover_url }] : [],
    },
    twitter: {
      card: college.cover_url ? "summary_large_image" : "summary",
      title: `${college.name} | SikshyaNepal`,
      description,
      images: college.cover_url ? [college.cover_url] : undefined,
    },
    alternates: { canonical: `${BASE_URL}/colleges/${college.slug}` },
    robots: { index: college.status !== 'pending_review', follow: true, googleBot: { index: college.status !== 'pending_review', follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  };
}

export default async function CollegeProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCollege(params.slug);
  if (!data) notFound();

  const { college, programs, reviews, reviewStats, scholarships, admissions, news, evidence } = data;
  const avgRating = reviewStats.averageRating;
  const linkedProgramNames = programs.map(item => item.program?.name).filter((name): name is string => Boolean(name));
  const fallbackProgramNames = collegeDisplayPrograms(college.programs_offered);
  const programNames = linkedProgramNames.length ? linkedProgramNames : fallbackProgramNames;
  const displayLocation = collegeDisplayLocation(college);
  const displayAffiliation = collegeDisplayAffiliation(college.affiliation);
  const levelNames = (college.education_levels || []).map(level => ({ plus_two: '+2', bachelor: 'Bachelor', master: 'Master', mphil: 'MPhil', phd: 'PhD', diploma: 'Diploma', certificate: 'Certificate' }[level] || level));
  const place = [college.local_level, college.district, college.province].filter(Boolean).join(', ') || displayLocation;
  const websiteUrl = safeExternalUrl(college.website, true);
  const sourceUrl = safeExternalUrl(college.source_url);
  const emailAddress = safeEmailAddress(college.email);
  const phoneHref = safePhoneHref(college.phone);
  const isSponsored = hasActiveCollegeSponsorship(college);
  const directionsQuery = [college.name, safeCollegeAddress(college.address), place, 'Nepal'].filter(Boolean).join(', ');
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionsQuery)}`;
  const verifiedDate = college.last_verified_at
    ? new Date(college.last_verified_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const hasPublishedFee = programs.some(program => program.fee != null);
  const profileHighlights = [
    programNames.length ? `${programNames.length} programme${programNames.length === 1 ? '' : 's'} listed` : null,
    hasPublishedFee ? 'fee information listed' : null,
    admissions.length ? `${admissions.length} current admission notice${admissions.length === 1 ? '' : 's'}` : null,
  ].filter((highlight): highlight is string => Boolean(highlight));
  const enquiryPrograms = Array.from(new Set(programs
    .map(cp => cp.program?.name)
    .filter((name): name is string => Boolean(name))
    .concat(linkedProgramNames.length ? [] : fallbackProgramNames)))
    .map(name => ({ name }));
  const answerSummary = [
    `${college.name}${place ? ` is listed in ${place}` : ' is listed in Nepal'}.`,
    displayAffiliation ? `Its profile lists affiliation with ${displayAffiliation}.` : null,
    programNames.length
      ? `The profile lists ${programNames.slice(0, 4).join(', ')}${programNames.length > 4 ? ` and ${programNames.length - 4} further programme${programNames.length === 5 ? '' : 's'}` : ''}.`
      : levelNames.length ? `The listed study levels are ${levelNames.join(', ')}.` : null,
  ].filter(Boolean).join(' ');
  const facts = [
    place ? { question: `Where is ${college.name} located?`, answer: `${college.name} is listed in ${place}, Nepal. Check the official contact page before travelling to the campus.` } : null,
    displayAffiliation ? { question: `Which university is ${college.name} affiliated with?`, answer: `${college.name} is listed as affiliated with ${displayAffiliation}. Students should confirm the affiliation for their specific programme and intake.` } : null,
    levelNames.length ? { question: `What study levels does ${college.name} offer?`, answer: `The profile currently lists ${levelNames.join(', ')} study options. Programme availability can change between admission cycles.` } : null,
    programNames.length ? { question: `What can I study at ${college.name}?`, answer: `Listed programmes include ${programNames.slice(0, 6).join(', ')}${programNames.length > 6 ? ` and ${programNames.length - 6} more` : ''}. Open the programme section and verify the current intake with the college.` } : null,
    { question: `How can I verify information about ${college.name}?`, answer: college.source_name ? `This profile was checked against ${college.source_name}. Use the visible source link and last-verified date, then confirm changing details such as fees, seats and deadlines with the college.` : `Use the college's official website and contact details to confirm programmes, fees, seats and deadlines before applying.` },
  ].filter((fact): fact is { question: string; answer: string } => Boolean(fact));

  const pageUrl = absoluteUrl(`/colleges/${college.slug}`)
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    {
      "@type": "CollegeOrUniversity", "@id": `${pageUrl}#college`, name: college.name,
      description: college.description || undefined, url: pageUrl, logo: college.logo_url || undefined,
      image: college.cover_url || undefined,
      address: { "@type": "PostalAddress", streetAddress: safeCollegeAddress(college.address) || undefined, addressLocality: college.local_level || displayLocation || undefined, addressRegion: college.province || undefined, addressCountry: "NP" },
      telephone: phoneHref ? college.phone || undefined : undefined, email: emailAddress || undefined,
      foundingDate: college.established_year?.toString(), sameAs: websiteUrl ? [websiteUrl] : undefined,
      hasOfferCatalog: programNames.length ? { '@type': 'OfferCatalog', name: `Programs at ${college.name}`, itemListElement: programNames.slice(0, 20).map(name => ({ '@type': 'Offer', itemOffered: { '@type': 'Course', name, provider: { '@id': `${pageUrl}#college` } } })) } : undefined,
      ...(avgRating && reviewStats.reviewCount > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: reviewStats.reviewCount, bestRating: "5", worstRating: "1" } }),
    },
    { "@type": "WebPage", "@id": `${pageUrl}#webpage`, url: pageUrl, name: `${college.name} college profile`, mainEntity: { "@id": `${pageUrl}#college` }, datePublished: college.created_at, dateModified: college.updated_at || college.last_verified_at || college.created_at, citation: sourceUrl || undefined, isPartOf: { "@id": `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }, { name: college.name, path: `/colleges/${college.slug}` }]),
    { '@type': 'FAQPage', '@id': `${pageUrl}#questions`, mainEntity: facts.map(fact => ({ '@type': 'Question', name: fact.question, acceptedAnswer: { '@type': 'Answer', text: fact.answer } })) },
  ] };

  return (
    <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <JsonLd data={jsonLd} />
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex min-w-0 items-center gap-2 text-sm font-nunito text-sn-ink-muted">
        <Link href="/" className="hover:text-sn-primary">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/colleges" className="hover:text-sn-primary">Colleges</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate font-bold text-sn-ink">{college.name}</span>
      </nav>

      {/* Hero */}
      <Card className="mb-8 overflow-hidden !p-0">
        {college.cover_url && (
          <div className="relative h-[200px] overflow-hidden bg-sn-surface-alt">
            <Image src={college.cover_url} alt={`${college.name} cover`} fill className="object-cover" priority />
            {isSponsored && (
              <div className="absolute top-4 right-4">
                <Pill tone="confirm">{college.sponsor_label || 'Sponsored'}</Pill>
              </div>
            )}
          </div>
        )}
        <div className="px-5 pb-6 pt-5 sm:px-7">
          {/* Logo — circle avatar floating over cover */}
          <div className={`mb-4 flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-sn-control border border-sn-border bg-sn-surface ${college.cover_url ? '-mt-12 shadow-sn-card' : ''}`}>
            {college.logo_url ? (
              <Image src={college.logo_url} alt={`${college.name} logo`} width={64} height={64} className="object-contain w-full h-full bg-white" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-sn-primary">
                <span className="text-white font-baloo font-extrabold text-2xl">{college.name.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="mb-4">
            <h1 className="max-w-4xl font-baloo text-[clamp(1.75rem,4.6vw,2.4rem)] font-extrabold leading-[1.1] tracking-[-0.015em] text-sn-ink">
              {college.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2"><SaveCollegeButton collegeId={college.id} /><Link href={`/compare?college1=${encodeURIComponent(college.slug)}`} className="inline-flex min-h-11 items-center gap-2 rounded-sn-control border border-sn-border-strong bg-sn-surface px-4 py-2.5 text-sm font-bold font-nunito text-sn-ink-soft transition-colors hover:border-sn-primary hover:bg-sn-primary-bg hover:text-sn-primary-hover motion-control"><GitCompare className="h-4 w-4" aria-hidden="true" />Compare</Link><ShareButton title={`${college.name} | SikshyaNepal`} /></div>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <VerificationBadge status={college.verification_status} />
              {displayAffiliation && <Pill tone="primary">{displayAffiliation}</Pill>}
              {college.established_year && (
                <span className="flex items-center gap-1 text-xs font-bold font-nunito text-sn-ink-soft">
                  <Calendar aria-hidden="true" className="h-3.5 w-3.5" /> Est. {college.established_year}
                </span>
              )}
              {avgRating && (
                <span className="flex items-center gap-1 text-xs font-bold font-nunito text-sn-ink-soft">
                  <Star aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {avgRating.toFixed(1)} ({reviewStats.reviewCount} reviews)
                </span>
              )}
            </div>
            {displayLocation && <p className="mt-3 flex items-start gap-1.5 text-sm font-bold font-nunito text-sn-ink-soft"><MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-sn-primary" />{displayLocation}</p>}
            {profileHighlights.length > 0 && <p className="mt-4 border-t border-sn-border pt-3 text-sm leading-6 font-nunito text-sn-ink-soft"><strong className="font-bold text-sn-ink">At a glance:</strong>{' '}{profileHighlights.join(' · ')}</p>}
          </div>

          {/* Official contact actions */}
          <div className="grid grid-cols-2 gap-2 text-sm sm:flex sm:flex-wrap">
            {displayLocation && (
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sn-control border border-sn-border bg-sn-surface px-3 font-bold font-nunito text-sn-primary hover:border-sn-primary transition-colors motion-control" aria-label={`Get directions to ${college.name}`}>
                <MapPin aria-hidden="true" className="h-4 w-4" /> Directions<ExternalLink aria-hidden="true" className="h-3 w-3" />
              </a>
            )}
            {phoneHref && (
              <a href={phoneHref} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sn-control border border-sn-border bg-sn-surface px-3 font-bold font-nunito text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary transition-colors motion-control">
                <Phone aria-hidden="true" className="h-4 w-4 text-sn-primary" /> Call college
              </a>
            )}
            {emailAddress && (
              <a href={`mailto:${emailAddress}`} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sn-control border border-sn-border bg-sn-surface px-3 font-bold font-nunito text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary transition-colors motion-control">
                <Mail aria-hidden="true" className="h-4 w-4 text-sn-primary" /> Email college
              </a>
            )}
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sn-control border border-sn-border bg-sn-surface px-3 font-bold font-nunito text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary transition-colors motion-control">
                <Globe aria-hidden="true" className="h-4 w-4 text-sn-primary" /> Official website<ExternalLink aria-hidden="true" className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </Card>

      {isSponsored && (
        <p className="mb-6 rounded-sn-control border border-sn-confirm bg-sn-confirm-bg px-4 py-3 text-sm leading-6 font-nunito text-sn-confirm-ink">
          <strong>{college.sponsor_label || 'Sponsored'}:</strong> {college.sponsor_disclosure || 'This college paid for placement. Payment does not change its verification status or student reviews.'}
        </p>
      )}

      <section className="mb-6 lg:hidden">
        <Card className="border-sn-primary/30">
          <div className="flex items-start justify-between gap-3">
            <div><h2 className="text-xl font-baloo font-bold text-sn-ink">Admissions enquiry</h2><p className="mt-1 text-sm leading-6 font-nunito text-sn-ink-soft">Ask about the current intake, eligibility and fees. This sends an enquiry, not an application.</p></div>
            {admissions.length > 0 && <Pill tone="verified">{admissions.length} open</Pill>}
          </div>
          <ApplyNowButton collegeName={college.name} collegeId={college.id} isSponsored={isSponsored} programs={enquiryPrograms} />
          <Link href={`/admissions/planner?college=${encodeURIComponent(college.name)}`} className="mt-3 flex min-h-11 items-center justify-center rounded-sn-control border border-sn-border-strong bg-sn-primary-bg text-sm font-bold font-nunito text-sn-primary-hover hover:bg-sn-primary-bg/80 transition-colors motion-control">Add to admission plan</Link>
          {phoneHref && <a href={phoneHref} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-sn-control border border-sn-border-strong text-sm font-bold font-nunito text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary transition-colors motion-control"><Phone className="h-4 w-4" aria-hidden="true" />Call official number</a>}
        </Card>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8 lg:space-y-10">
          <section aria-labelledby="college-at-a-glance">
            <div className="mb-3 flex items-start gap-3">
              <div>
                <h2 id="college-at-a-glance" className="text-xl font-baloo font-bold text-sn-ink">What students should know</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 font-nunito text-sn-ink-soft">{answerSummary}</p>
              </div>
            </div>
            <div className="mt-2">
              {verifiedDate && college.source_name ? (
                <EvidenceChip state="verified" source={college.source_name} checkedDate={college.last_verified_at!} />
              ) : (
                <EvidenceChip state="limited" label="Confirm changing details with the college directly" />
              )}
            </div>
          </section>

          <CollegeDecisionCheck collegeSlug={college.slug} sourceUrl={sourceUrl} website={websiteUrl} />

          <CollegeEvidenceLedger items={evidence} />

          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-baloo font-bold text-sn-ink">Source and verification</h2>
                <p className="mt-1 text-sm font-nunito text-sn-ink-muted">
                  {college.source_name ? `Information checked against ${college.source_name}.` : 'Use the official college contact details to confirm current information.'}
                </p>
              </div>
              <VerificationBadge status={college.verification_status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-sn-border pt-4 text-sm">
              {college.last_verified_at && college.source_name ? (
                <EvidenceChip state="verified" source={college.source_name} checkedDate={college.last_verified_at} />
              ) : (
                <EvidenceChip state="limited" />
              )}
              {sourceUrl && (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">
                  Open source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
              <ReportCorrectionForm entityType="college" entityId={college.id} entityName={college.name} />
            </div>
          </Card>

          {/* Programs */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <IconTile icon={GraduationCap} tint="peach" size={32} />
              <h2 className="text-lg font-baloo font-bold text-sn-ink">Programs Offered</h2>
            </div>
            {programs.length > 0 ? (
              <div className="space-y-3">
                {[...programs]
                  .sort((a, b) => {
                    const aIs2 = a.program?.degree_level === '+2'
                    const bIs2 = b.program?.degree_level === '+2'
                    if (aIs2 && !bIs2) return -1
                    if (!aIs2 && bIs2) return  1
                    return 0
                  })
                  .map((cp) => {
                    const isPlus2 = cp.program?.degree_level === '+2'
                    const feePeriods:Record<string,string>={monthly:'per month',semester:'per semester',annual:'per year',total_program:'total programme',one_time:'one-time'}
                    const feePeriod=cp.fee_period ? feePeriods[cp.fee_period] : null
                    const feeSource = safeExternalUrl(cp.fee_source_url)
                    return (
                      <div key={cp.program_id} className="flex flex-col gap-3 rounded-sn-control border border-sn-border bg-sn-surface-alt p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          {cp.program?.slug ? (
                            <Link href={`/programs/${cp.program.slug}`} className="text-sm font-bold font-nunito text-sn-ink hover:text-sn-primary hover:underline">
                              {cp.program.name}
                            </Link>
                          ) : (
                            <p className="font-bold font-nunito text-sn-ink text-sm">{cp.program?.name}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {isPlus2 ? <Pill tone="primary">+2</Pill> : <Pill tone="neutral">{cp.program?.faculty}</Pill>}
                            <span className="text-xs font-nunito text-sn-ink-muted">{isPlus2 ? '2 Years (+2)' : cp.program?.duration}</span>
                            {cp.scholarship_available && <Pill tone="verified">Scholarship available</Pill>}
                          </div>
                        </div>
                        {cp.fee != null && (
                          <div className="border-t border-sn-border pt-3 sm:min-w-52 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:text-right">
                            <p className="text-sm font-bold font-nunito text-sn-ink">
                              NPR {cp.fee.toLocaleString()}{feePeriod && <span className="ml-1 font-normal text-sn-ink-soft">{feePeriod}</span>}
                            </p>
                            {cp.fee_academic_year && <p className="mt-0.5 text-xs font-nunito text-sn-ink-muted">Academic year {cp.fee_academic_year}</p>}
                            <div className="mt-2 sm:flex sm:justify-end">
                              {feeSource && cp.fee_last_verified_at ? (
                                <EvidenceChip state="verified" source={sourceLabel(feeSource)} checkedDate={cp.fee_last_verified_at} />
                              ) : (
                                <EvidenceChip state="confirm" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            ) : fallbackProgramNames.length ? (
              <div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {fallbackProgramNames.map((program) => (
                    <div key={program} className="rounded-sn-control border border-sn-border bg-sn-surface-alt px-3 py-2.5 text-sm font-nunito font-medium text-sn-ink-soft">{program}</div>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed font-nunito text-sn-ink-muted">Program list is from the college research pack. Confirm current intakes and eligibility on the official website before applying.</p>
              </div>
            ) : (
              <div className="rounded-sn-control border border-sn-border bg-sn-surface-alt p-4">
                <p className="text-sm font-bold font-nunito text-sn-ink">Contact the college for current programme details.</p>
                <p className="mt-1 text-sm leading-6 font-nunito text-sn-ink-soft">Programme offerings can change by intake. Use the official website or admissions office for the current list.</p>
                {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">Check official website <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
              </div>
            )}
          </Card>

          {admissions.length > 0 && (
            <Card>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div><h2 className="text-lg font-baloo font-bold text-sn-ink">Admissions open</h2><p className="mt-1 text-sm font-nunito text-sn-ink-muted">Verified opportunities and deadlines from this college.</p></div>
                <Link href={`/admissions?q=${encodeURIComponent(college.name)}`} className="text-sm font-bold font-nunito text-sn-primary">View all</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">{admissions.map((admission) => <AdmissionCard key={admission.id} admission={admission} />)}</div>
            </Card>
          )}

          {news.length > 0 && (
            <Card as="section" aria-labelledby="college-news-heading">
              <div className="mb-4 flex items-end justify-between gap-4"><div><h2 id="college-news-heading" className="text-lg font-baloo font-bold text-sn-ink">Latest updates from {college.name}</h2><p className="mt-1 text-sm font-nunito text-sn-ink-muted">Admissions, results, achievements and campus events with original sources.</p></div><Link href={`/news?q=${encodeURIComponent(college.name)}`} className="whitespace-nowrap text-sm font-bold font-nunito text-sn-primary">All updates</Link></div>
              <div className="divide-y divide-sn-border">{news.map(article => <Link key={article.id} href={`/news/${article.slug}`} className="group flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div><p className="text-xs font-bold font-nunito uppercase tracking-wide text-sn-primary">{article.content_category?.replaceAll('_', ' ') || 'College news'}</p><h3 className="mt-1 text-sm font-bold font-nunito text-sn-ink group-hover:text-sn-primary">{article.title}</h3></div><span className="text-xs font-nunito text-sn-ink-muted">{article.published_date ? new Date(article.published_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : DATE_NOT_PUBLISHED}</span></Link>)}</div>
            </Card>
          )}

          <section aria-labelledby="student-questions-heading">
            <h2 id="student-questions-heading" className="text-lg font-baloo font-bold text-sn-ink">Questions students ask about {college.name}</h2>
            <div className="mt-5 divide-y divide-sn-border">{facts.map(fact => <details key={fact.question} className="group py-4 first:pt-0 last:pb-0"><summary className="cursor-pointer list-none pr-6 text-sm font-bold font-nunito text-sn-ink marker:hidden">{fact.question}<span className="float-right text-sn-primary group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-6 font-nunito text-sn-ink-soft">{fact.answer}</p></details>)}</div>
          </section>

          {/* Reviews */}
          <Card>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-baloo font-bold text-sn-ink">Student Reviews</h2><p className="mt-1 text-xs font-nunito text-sn-ink-muted">Moderated experiences—not an official college ranking.</p></div>{reviews.length > 0 && <div className="flex gap-2 text-xs"><Pill tone="neutral">Showing {reviews.length} of {reviewStats.reviewCount}</Pill></div>}</div>
            {reviewStats.reviewCount > 0 && reviewStats.reviewCount < 5 && <div className="mb-5"><EvidenceChip state="limited" label={reviewStats.reviewCount === 1 ? 'One student experience' : `${reviewStats.reviewCount} student experiences`} /><p className="mt-2 text-xs leading-5 font-nunito text-sn-ink-muted">Do not treat the rating as representative of every programme, teacher or intake.</p></div>}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-sn-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold font-nunito text-sn-ink text-sm">
                          <span className="inline-flex items-center gap-1">{review.student_name}{review.verification_status === 'verified' && <Pill tone="verified">Verified student</Pill>}</span>
                        </p>
                        {review.program && <p className="text-xs font-nunito text-sn-ink-muted">{review.program} {review.year && `• ${review.year}`}</p>}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-sn-border-strong fill-sn-border-strong"}`} />)}
                      </div>
                    </div>
                    <p className="text-sm font-nunito text-sn-ink-soft">{review.review_text}</p>
                    {(review as Review & { review_responses?: { id: string; response_text: string; status: string; created_at: string }[] }).review_responses?.filter(response => response.status === 'published').map(response => <div key={response.id} className="mt-3 rounded-sn-control border border-sn-primary/30 bg-sn-primary-bg p-3 text-sm text-sn-primary-hover"><p className="text-xs font-bold font-nunito uppercase tracking-wide">Institution response</p><p className="mt-1 leading-6 font-nunito">{response.response_text}</p></div>)}
                    {Object.entries({ Teaching: review.teaching_rating, Facilities: review.facilities_rating, Administration: review.administration_rating, Value: review.value_rating, Placement: review.placement_rating, Attendance: review.attendance_rating, Safety: review.safety_rating, Internships: review.internship_support_rating }).some(([, value]) => value != null) && <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-nunito text-sn-ink-muted">{Object.entries({ Teaching: review.teaching_rating, Facilities: review.facilities_rating, Administration: review.administration_rating, Value: review.value_rating, Placement: review.placement_rating, Attendance: review.attendance_rating, Safety: review.safety_rating, Internships: review.internship_support_rating }).filter(([, value]) => value != null).map(([label, value]) => <span key={label} className="rounded-sn-pill bg-sn-surface-alt px-2 py-1">{label} {value}/5</span>)}{review.hidden_costs_reported && <span className="rounded-sn-pill bg-sn-confirm-bg px-2 py-1 text-sn-confirm-ink">Student reported unclear costs</span>}</div>}
                    {/* Placement rating above is a 1-5 student rating, not a placement-rate statistic — no numeric outcome claim is shown here, so no chip is needed. */}
                    {review.hostel_transport_note && <p className="mt-3 rounded-sn-control bg-sn-surface-alt p-3 text-xs leading-5 font-nunito text-sn-ink-soft"><strong>Student note:</strong> {review.hostel_transport_note}</p>}
                    <ReviewResponseForm reviewId={review.id} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-nunito text-sn-ink-muted">No reviews yet. Be the first to review!</p>
            )}
          </Card>

          {/* Write a Review */}
          <Card>
            <h2 className="text-lg font-baloo font-bold text-sn-ink mb-1">Write a Review</h2>
            <p className="text-sm font-nunito text-sn-ink-muted mb-5">Share your experience to help other students</p>
            <ReviewForm collegeId={college.id} collegeName={college.name} />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:space-y-8">
          {/* Quick Info */}
          <Card as="div" id="college-contact">
            <h3 className="font-bold font-nunito text-sn-ink mb-4">Quick Info</h3>
            <dl className="space-y-3 text-sm">
              {displayAffiliation && (
                <div className="flex justify-between"><dt className="font-nunito text-sn-ink-muted">Affiliation</dt><dd className="font-bold font-nunito text-sn-ink text-right">{displayAffiliation}</dd></div>
              )}
              {college.established_year && (
                <div className="flex justify-between"><dt className="font-nunito text-sn-ink-muted">Established</dt><dd className="font-bold font-nunito text-sn-ink">{college.established_year}</dd></div>
              )}
              {displayLocation && (
                <div className="flex justify-between">
                  <dt className="font-nunito text-sn-ink-muted">Location</dt>
                  <dd className="text-right font-bold font-nunito text-sn-ink">
                    {college.district ? <Link href={`/colleges/in/${routeSegment(college.district)}`} className="hover:text-sn-primary hover:underline">{displayLocation}</Link> : displayLocation}
                  </dd>
                </div>
              )}
              <div className="flex justify-between"><dt className="font-nunito text-sn-ink-muted">Programs Offered</dt><dd className="font-bold font-nunito text-sn-ink">{programs.length || fallbackProgramNames.length}</dd></div>
            </dl>
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-4 w-full flex items-center justify-center gap-2 rounded-sn-control bg-sn-primary px-4 py-2.5 text-sm font-bold font-nunito text-white shadow-sn-button transition-colors hover:bg-sn-primary-hover">
                Visit Official Website <ExternalLink className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
            <ApplyNowButton collegeName={college.name} collegeId={college.id} isSponsored={isSponsored} programs={enquiryPrograms} />
          </Card>

          {/* Ad — below Quick Info */}
          <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? ''} format="rectangle" className="flex justify-center" />

          {/* Scholarships */}
          {scholarships.length > 0 && (
            <Card>
              <h3 className="font-bold font-nunito text-sn-ink mb-3">Scholarships</h3>
              <div className="space-y-3">
                {scholarships.map((s: { id: string; title: string; amount?: number | null; deadline?: string | null }) => (
                  <div key={s.id} className="rounded-sn-control border border-sn-verified/30 bg-sn-verified-bg p-3">
                    <p className="font-bold font-nunito text-sn-ink text-sm">{s.title}</p>
                    {s.amount && (
                      <>
                        <p className="text-xs font-bold font-nunito text-sn-verified-ink mt-1">Up to NPR {s.amount.toLocaleString()}</p>
                        <div className="mt-2"><EvidenceChip state="confirm" label="Confirm amount with the college" /></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Compare CTA */}
          <Card tone="alt">
            <h3 className="font-bold font-nunito text-sn-primary-hover mb-2">Compare Colleges</h3>
            <p className="text-sm font-nunito text-sn-ink-soft mb-3">Compare {college.name} with other colleges side-by-side.</p>
            <Link href={`/compare?college1=${college.slug}`} className="w-full flex items-center justify-center rounded-sn-control bg-sn-primary px-4 py-2 text-sm font-bold font-nunito text-white shadow-sn-button transition-colors hover:bg-sn-primary-hover">
              Add to Compare
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
