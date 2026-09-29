'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp } from 'lucide-react'

export default function AskBar({
  placeholder = 'Ask about colleges, courses, fees in Nepal...',
}: {
  placeholder?: string
}) {
  const [value, setValue] = useState('')
  const router = useRouter()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const query = value.trim()
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ask-bar" role="search">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="ask-bar-input"
        aria-label="Ask about colleges, courses, fees"
      />
      <button
        type="submit"
        className="send-button"
        aria-label="Submit search inquiry"
        title="Search"
      >
        <ArrowUp className="h-4 w-4 stroke-[2.5]" />
      </button>
    </form>
  )
}
