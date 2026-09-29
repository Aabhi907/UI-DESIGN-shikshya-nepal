import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-noto-serif)', 'var(--font-noto-devanagari)', 'Georgia', 'serif'],
        nepali:  ['var(--font-noto-devanagari)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-dm-sans)', 'var(--font-noto-devanagari)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'Menlo', 'monospace'],
        // ── Phase 1 design system — new, additive keys. Existing display/sans/mono
        // above are untouched so unconverted pages render exactly as before.
        baloo:   ['var(--font-baloo)', 'var(--font-noto-devanagari)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        nunito:  ['var(--font-nunito)', 'var(--font-noto-devanagari)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Phase 1 design system — isolated "sn" namespace (SikshyaNepal
        // redesign). Deliberately not named `primary`/`ink`/etc. to avoid
        // colliding with the tokens below, which the rest of the site still
        // depends on until later phases convert those pages too.
        sn: {
          ground:      'var(--ground)',
          surface:     'var(--surface)',
          'surface-alt': 'var(--surface-alt)',
          ink:         'var(--ink)',
          'ink-soft':  'var(--ink-soft)',
          'ink-muted': 'var(--ink-muted)',
          primary:     'var(--primary)',
          'primary-hover': 'var(--primary-hover)',
          'primary-bg':    'var(--primary-bg)',
          verified:        'var(--verified)',
          'verified-ink':  'var(--verified-ink)',
          'verified-bg':   'var(--verified-bg)',
          confirm:         'var(--confirm)',
          'confirm-ink':   'var(--confirm-ink)',
          'confirm-bg':    'var(--confirm-bg)',
          limited:         'var(--limited)',
          'limited-ink':   'var(--limited-ink)',
          'limited-bg':    'var(--limited-bg)',
          border:          'var(--sn-border)',
          'border-strong': 'var(--sn-border-strong)',
          'tint-mint':   'var(--tint-mint)',
          'tint-peach':  'var(--tint-peach)',
          'tint-butter': 'var(--tint-butter)',
          'tint-lilac':  'var(--tint-lilac)',
        },
        // ── Primary — deep Teal Waters (scholastic & premium) ──
        primary: {
          DEFAULT: '#204654',
          50:  '#f0f7f9',
          100: '#dbeef3',
          200: '#b7dde6',
          300: '#86c4d4',
          600: '#173743',
          700: '#102933',
        },
        // ── Accent — vibrant Spring Meadow (fresh & energizing) ──
        accent: {
          DEFAULT: '#CAFFA6',
          50:  '#f8fef5',
          100: '#edfde4',
          200: '#dbfccb',
          600: '#9de76d',
        },
        // ── Dark sections ─────────────────────────────
        navy: 'var(--navy)',
        // ── Surfaces & cards ─────────────────────────
        card:    'var(--card)',
        surface: 'var(--surface)',
        // ── Text ─────────────────────────────────────
        ink: {
          DEFAULT:   'var(--ink)',
          secondary: 'var(--ink-soft)',
          muted:     'var(--ink-muted)',
        },
        // ── Borders ──────────────────────────────────
        border: {
          DEFAULT: 'var(--border)',
          strong:  'var(--border-strong)',
          subtle:  'var(--border-subtle)',
        },
        // ── Brand alias (backward compat) ────────────
        brand: {
          DEFAULT: '#1847c4',
          light:   '#3b82f6',
          glow:    '#1340b0',
          50:      '#eff3fe',
          100:     '#dde6fd',
        },
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
        'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
        // Phase 1 design system
        'sn-card':   'var(--sn-shadow-card)',
        'sn-float':  'var(--sn-shadow-float)',
        'sn-button': 'var(--sn-shadow-button)',
      },
      borderRadius: {
        'sn-card':    '16px',
        'sn-control': '10px',
        'sn-pill':    '999px',
      },
      spacing: {
        // The brief's 4px-scale (4,8,12,16,20,24,32,40,48,64,80,96) already
        // matches Tailwind's native keys 1,2,3,4,5,6,8,10,12,16,20,24 — this
        // is the one value outside that default scale.
        '30': '120px',
      },
      maxWidth: {
        // ~1200px page container, per the spacing-system brief.
        'sn': '1200px',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },        '100%': { opacity: '1' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
