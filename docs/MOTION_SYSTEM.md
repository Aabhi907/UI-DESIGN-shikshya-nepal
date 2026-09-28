# SikshyaNepal motion system

Motion explains state and hierarchy; it never delays access to education information.

## Principles

- Keep interaction feedback between 120–220ms and page reveals below 500ms.
- Animate only opacity and transforms for entrances. Do not animate layout dimensions except progress indicators.
- Cards may rise by 2px on pointer devices. Touch and keyboard states remain stable.
- Dialogs must trap focus, close on Escape, lock background scrolling, and restore focus to the trigger.
- Content is visible during server rendering. JavaScript may enhance it after hydration, never hide it permanently.
- `prefers-reduced-motion` and `prefers-reduced-data` receive complete final states with no decorative animation.
- Do not add animation libraries for effects already covered by CSS and the shared primitives.

## Shared primitives

Import from `@/components/motion`:

- `Reveal` for a single viewport entrance.
- `RevealGroup` for a short list with capped stagger.
- `AnimatedHeading` for important section headings.
- `InteractiveCard` for consistent pointer feedback.
- `MotionLink` for links with directional arrow feedback.
- `useDialogFocus` for modal, drawer, and bottom-sheet accessibility.

## Tokens

Durations and easing curves live in `app/globals.css`. Use the semantic motion classes there instead of one-off transitions. `transition-all` is prohibited because it can animate unexpected layout and paint properties.

## Review checklist

1. The student can understand and use the interface before motion runs.
2. Focus remains visible and logical throughout the interaction.
3. Escape, outside click, and the visible close control behave consistently.
4. No animation changes data, verification state, permissions, or API behavior.
5. Test at 375px, landscape mobile, 768px, 1024px, and 1440px with no horizontal overflow.
6. Test with reduced motion enabled.
