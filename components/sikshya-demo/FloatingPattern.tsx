'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, FileText, Search } from 'lucide-react'
import FloatingKey, { DepthLevel } from './FloatingKey'

type KeyItem = {
  id: number
  x: string
  y: string
  rotate: number
  depth: DepthLevel
  symbol: React.ReactNode
}

const decorations: KeyItem[] = [
  // Top left cluster
  { id: 1, x: '4%', y: '8%', rotate: -8, depth: 'near', symbol: 'A' },
  { id: 2, x: '16%', y: '4%', rotate: 6, depth: 'middle', symbol: 'π' },
  { id: 3, x: '27%', y: '11%', rotate: -4, depth: 'far', symbol: <BookOpen className="h-3.5 w-3.5" /> },

  // Top right cluster
  { id: 4, x: '73%', y: '7%', rotate: 10, depth: 'far', symbol: <GraduationCap className="h-3.5 w-3.5" /> },
  { id: 5, x: '86%', y: '5%', rotate: -6, depth: 'middle', symbol: 'B' },
  { id: 6, x: '94%', y: '14%', rotate: 8, depth: 'near', symbol: 'S' },

  // Mid left perimeter
  { id: 7, x: '3%', y: '38%', rotate: -11, depth: 'middle', symbol: 'N' },
  { id: 8, x: '6%', y: '58%', rotate: 9, depth: 'near', symbol: 'Σ' },

  // Mid right perimeter
  { id: 9, x: '92%', y: '42%', rotate: -7, depth: 'near', symbol: <Search className="h-3.5 w-3.5" /> },
  { id: 10, x: '88%', y: '61%', rotate: 12, depth: 'middle', symbol: 'A' },

  // Bottom left cluster
  { id: 11, x: '8%', y: '82%', rotate: -9, depth: 'near', symbol: 'B' },
  { id: 12, x: '19%', y: '89%', rotate: 5, depth: 'middle', symbol: <FileText className="h-3.5 w-3.5" /> },

  // Bottom right cluster
  { id: 13, x: '79%', y: '86%', rotate: -8, depth: 'middle', symbol: 'N' },
  { id: 14, x: '93%', y: '79%', rotate: 7, depth: 'near', symbol: 'S' },

  // Outer accents
  { id: 15, x: '49%', y: '3%', rotate: -3, depth: 'far', symbol: 'π' },
  { id: 16, x: '51%', y: '94%', rotate: 6, depth: 'far', symbol: <GraduationCap className="h-3.5 w-3.5" /> },
]

export default function FloatingPattern({ visible = true }: { visible?: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{
        opacity: visible ? 1 : 0,
        filter: visible ? 'blur(0px)' : 'blur(4px)',
      }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      {decorations.map((item) => (
        <FloatingKey
          key={item.id}
          x={item.x}
          y={item.y}
          rotate={item.rotate}
          depth={item.depth}
          symbol={item.symbol}
        />
      ))}
    </motion.div>
  )
}
