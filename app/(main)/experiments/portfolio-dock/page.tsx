import { Metadata } from 'next'
import InteractivePortfolioDock from '@/components/portfolio-dock/InteractivePortfolioDock'

export const metadata: Metadata = {
  title: 'Interactive Portfolio Dock | Prototype',
  description: 'Interactive portfolio dock with layered 3D mockups and global background blur effect.',
}

export default function PortfolioDockPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfb] dark:bg-[#0c0d10] flex items-center justify-center">
      <InteractivePortfolioDock />
    </main>
  )
}
