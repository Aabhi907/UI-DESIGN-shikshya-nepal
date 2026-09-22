import Image from 'next/image'

type MascotPose = 'wave' | 'read' | 'point'

// A swappable image slot, not a hand-tuned layout. Drop a real illustration at
// /public/mascot/<pose>.png (or pass `src` directly) and every place that
// renders <Mascot /> picks it up automatically — no component using this needs
// to change. Until then, this renders a coded placeholder: a young-adult
// student (book, warm tones), explicitly not a child or an animal, matching
// the approved design direction.
export default function Mascot({
  pose = 'wave',
  src,
  size = 96,
  className,
  'aria-hidden': ariaHidden = true,
  alt = '',
}: {
  pose?: MascotPose
  src?: string
  size?: number
  className?: string
  'aria-hidden'?: boolean
  alt?: string
}) {
  if (src) {
    return <Image src={src} alt={alt} width={size} height={size} className={className} aria-hidden={ariaHidden} />
  }
  return <CodedMascot pose={pose} size={size} className={className} ariaHidden={ariaHidden} alt={alt} />
}

// Placeholder illustration — simple flat-geometric young-adult student.
// Swap this out (or pass `src`) once real artwork exists; nothing else changes.
function CodedMascot({ pose, size, className, ariaHidden, alt }: { pose: MascotPose; size: number; className?: string; ariaHidden: boolean; alt: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={ariaHidden ? undefined : 'img'}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : alt}
    >
      {/* backpack */}
      <rect x="18" y="42" width="16" height="24" rx="6" fill="var(--tint-lilac)" />
      {/* body */}
      <path d="M24 88c0-15 8-24 24-24s24 9 24 24" fill="var(--primary)" />
      {/* head */}
      <circle cx="48" cy="34" r="17" fill="#F4C69B" />
      {/* hair */}
      <path d="M31 32c0-11 8-19 17-19s17 8 17 19c-4-3-9-5-17-5s-13 2-17 5z" fill="#2A211A" />
      {pose === 'read' ? (
        <>
          {/* open book */}
          <path d="M30 70h36v8a2 2 0 0 1-2 2H32a2 2 0 0 1-2-2v-8z" fill="var(--surface)" stroke="var(--sn-border-strong)" strokeWidth="1.5" />
          <path d="M48 70v10" stroke="var(--sn-border-strong)" strokeWidth="1.5" />
        </>
      ) : pose === 'point' ? (
        <path d="M70 56c6-2 10-6 12-11" stroke="var(--primary-hover)" strokeWidth="5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M74 44c4 3 6 8 5 13" stroke="var(--primary-hover)" strokeWidth="5" strokeLinecap="round" fill="none" />
      )}
      {/* smile */}
      <path d="M41 39c3 3 11 3 14 0" stroke="#2A211A" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
