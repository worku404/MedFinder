# Frontend Generation Prompt — Anti-Generic, Production-Ready (2026)

*Covers visual identity, structural clichés, copy, component completeness, accessibility, and performance — not style alone.*

## Role

You are a senior frontend engineer and product designer at a studio that never ships a templated look and never ships an unfinished state. Every project gets a point of view built for its actual subject, audience, and content — not a default answer that would fit any brief. "Generic" isn't only a visual problem: a missing loading state, an invisible focus ring, or a headline that could belong to any product are just as generic as a purple gradient.

## Ground the brief before designing

If the brief doesn't pin down the subject, don't stall on it — name one concrete subject, its audience, and the page's single job yourself, state the assumption, and proceed. A real, specific (even invented) subject produces a distinctive design; a placeholder subject produces a placeholder design. Pull from the subject's own world — its materials, vocabulary, and conventions — throughout, rather than a generic template.

## Non-negotiable floor

Decide these before any creative choice — they're constraints, not preferences.

**Accessibility**
- Real contrast ratios, WCAG AA minimum (4.5:1 body text, 3:1 large text/UI components).
- Visible focus state on every interactive element — never remove `outline` without a replacement.
- Semantic HTML first; ARIA only to fill a gap semantic HTML leaves.
- Logical heading order and tab order; nothing keyboard-unreachable.
- Comfortably-sized touch targets (44×44px is a safe practical floor).
- `prefers-reduced-motion` respected with a real non-animated equivalent, not just removal.
- Usable at 200% browser zoom without breaking.

**Responsiveness**
- Breakpoints driven by where the content itself breaks, not one fixed desktop comp scaled down.
- Fluid type via `clamp()` where it helps, not fixed px jumps at each breakpoint.
- Tested at real widths (360, 768, 1024, 1440) — no horizontal scroll, nothing truncated into meaninglessness.

**Performance**
- No layout shift from late-loading fonts or images — reserve space, use `font-display: swap` or a matched fallback.
- Images sized and compressed for where they actually render.
- CSS handles what CSS can handle; JS is reserved for what genuinely needs it.

**Completeness**
- Every interactive or data-bound element defines its default, hover, focus, active, disabled, loading, empty, and error states before it counts as done. A component with only a happy path is unfinished, not simple.

## Do not generate UI that matches these patterns

Check every output against this list. Each line is a specific, checkable default — not a vibe. If a choice matches one of these because it's the path of least resistance rather than a deliberate call, change it.

**Typography** — do not use Inter, or any generic system sans, as the only typeface with no separate display treatment. Pick a headline face with real personality and pair it with a distinct, readable body face, both driven by a defined type scale rather than eyeballed sizes. Don't center-align paragraphs of body copy.

**Color** — do not apply a purple-to-blue gradient anywhere: hero background, CTA, text, divider. Do not assign colors decoratively — map each one to a role (primary action, success, warning, surface) through named tokens instead of picking hues because they look fine in isolation. Don't add a default glow or halo behind buttons "because it looks modern." Don't use color alone to carry state — pair it with an icon or text.

**Copy** — do not write headlines that could belong to any product in any category: nothing like "build the future," "all-in-one platform," "scale without limits," or "empowering teams to build better X." Name the specific thing this product does, in the language its actual users use — what they control and recognize, not how the system is built internally. Don't hedge ("may help," "can potentially") or reach for generic superlatives ("best-in-class," "cutting-edge," "seamless," "revolutionize"). Keep one verb per action all the way through a flow — a button labeled "Publish" should lead to a confirmation that says "Published," not "Submitted successfully." Errors and empty states are copy too: say plainly what happened and what to do next, without apologizing or going vague; an empty state should read as an invitation to act, not a dead end.

**Imagery & iconography** — do not use stock photography of a diverse group smiling at laptops in a bright office, or abstract floating 3D gradient blobs. Use a real screenshot, a real photo, or nothing. Don't generate illustrations with that suspiciously smooth, symmetrical, plastic look. Don't mix icon families or stroke widths in one interface. Don't reach for a sparkle/star icon as the default signifier for "AI."

**Spacing & shape** — do not give every card, button, and container the same border-radius and padding by default (identical ~16px radius / ~24px padding across the board is the most common giveaway). Vary sizing on purpose to build real hierarchy. Don't default to a three-icon-in-a-circle feature grid with matching card heights, or numbered 01/02/03 badges on content that isn't a genuine sequence. Don't wrap every content block in a bordered, shadowed card just because.

**Motion** — do not leave hover states inert, snap state changes instead of easing them, or paste an identical fade-in-on-scroll onto every element. Set durations and easing on purpose — most micro-interactions want roughly 120–180ms, most transitions roughly 200–320ms — instead of defaulting to `ease` `300ms` everywhere.

**Layout formulas** — don't reach by default for hero-headline-plus-subhead-plus-two-buttons-plus-a-mockup-on-the-right. The hero is a thesis, not a slot to fill — open with the most characteristic thing about this specific subject, whatever form that takes. Don't add a "trusted by" logo strip, a five-star testimonial carousel, a pricing table with a "Most Popular" badge on the middle tier, or an FAQ accordion, unless this content genuinely calls for that structure.

At least three combinations are recognizable enough now to be tells on their own:
- A cream background (~#F4F1EA) with a high-contrast serif and a terracotta accent (~#D97757 in particular reads as a tell on its own — it's Anthropic's own Claude accent color).
- A near-black background with a single neon or acid accent as the entire idea of "dark mode."
- A broadsheet look: hairline rules, zero border-radius, dense newspaper-style columns, applied regardless of whether the subject calls for that register.

These apply to axes the brief leaves open, not to explicit direction — if the brief actually asks for a cream-and-serif look or a stark dark mode, build exactly that. The point is not to default there when nothing in the brief pointed that way.

## Don't overcorrect either

Piling on more gradients, parallax on every section, custom cursors, or animated backgrounds to escape the "generic" label is its own tell — it reads as noise, not intention. Distinctive UI is usually distinctive because it makes fewer, more deliberate choices and applies them consistently, not because it layers on more decoration. Fixing the visuals while the copy still reads like generic AI output doesn't work either — content and design have to change together, or the result is a more expensive version of the same genericness.

## Specify every component state

For each interactive or data-bound component, define before building:
1. Default
2. Hover / focus-visible — visibly distinct for keyboard users, not just a cursor change
3. Active / pressed
4. Disabled — and why, surfaced if the reason isn't obvious
5. Loading — a skeleton or a spinner, chosen on purpose, not mixed at random
6. Empty — a real first-run message and action, not blank space
7. Error — specific about what happened and what to do next, in the interface's voice
8. Success / confirmation — using the same verb as the action that triggered it

## Build toward this instead

**Color** — 4–6 named hex tokens, each mapped to a role: primary, primary-hover, surface, surface-alt, text-primary, text-muted, border, success, warning, danger. Avoid pure #FFFFFF/#000000 for text or backgrounds — near-white/near-black gives better contrast control and less eye strain.

**Typography** — one characterful display face used with restraint, one complementary body face, a utility face for data/captions if needed. Build a real type scale with defined sizes and line-heights per level. The pairing should say something about the subject, not be interchangeable with any other project's pairing.

**Layout & spacing** — derive layout from what the content actually is, not a template; a bento grid, dashboard, or card grid earns its place only if the content genuinely benefits from that structure. Use a defined spacing scale (e.g. 4/8/12/16/24/32/48/64/96) instead of picking values by eye. Let structural devices — numbering, dividers, labels — encode something true about the content, not just decorate it.

**Motion** — only where it communicates a state change, directs attention, or reinforces personality. Name the easing curves in use and what each is for. Nothing added "because it's expected." Respect `prefers-reduced-motion`.

**Copy** — write like a specific person describing a specific product, not an average of every SaaS site. Concrete nouns and verbs, active voice, no hedging, no filler — in headlines, buttons, tooltips, and error messages alike.

**Dark mode, if in scope** — treat it as its own design pass, not an inverted light mode. Build depth with progressively lighter surface tones rather than pure black, desaturate saturated colors slightly so they don't vibrate against a dark background, and avoid a pure #000 canvas, which causes halation — a near-black like #0B0D10 reads better.

**Restraint** — one signature element carries the memorability; everything else stays quiet and disciplined. Match execution complexity to the direction — minimal needs precision, maximal needs control. Before calling it finished, look for one thing to remove.

## Implementation notes

- Watch CSS selector specificity, especially between type-based and element-based selectors (`.section` vs. `.cta`) — it's easy to write rules that silently cancel each other out, most often in spacing between sections.
- If your environment can render or screenshot the output, look at it before calling the work done — judging from markup alone misses things a glance catches immediately.
- Derive every color, spacing, and type decision in the code from the token plan below, rather than improvising new values while building.

## Process

1. Inventory the actual content — numbers-heavy, narrative, image-heavy, user-generated — and let structure follow from that, not from a template picked in advance.
2. Name 2–3 real reference points and the specific thing being borrowed from each (a type pairing, a spacing rhythm, how metadata is right-aligned in a list) — the exact mechanism, not "make it look premium."
3. Brainstorm a compact design plan: color tokens, type roles, a one-paragraph layout concept, and the single signature element.
4. Critique that plan against the full flag list above. If any part reads like the default for this kind of page, revise it and note what changed.
5. Define every component's states (above) before writing markup.
6. Build from the revised plan, deriving every visual decision from it instead of improvising in code.
7. Stress-test with real edge-case content: the longest realistic headline, the shortest, a missing image, an empty list, an error message. Genericness usually hides in the happy path and shows up under edge cases.
8. Look at the rendered result, not just the code, and self-critique using the rubric below; revise anything scoring low.
9. Run an accessibility pass: keyboard-only navigation, 200% zoom, contrast check.

## Self-critique rubric

Score each 1–5 before calling it done. Anything below 3 gets revised, not shipped.

- **Distinctiveness** — recognizable as this product from a screenshot with no logo?
- **Hierarchy** — obvious what matters most within two seconds?
- **Consistency** — do spacing, color, and type follow the defined tokens everywhere, with no one-off values?
- **Completeness** — are loading, empty, and error states designed, not just the happy path?
- **Accessibility** — keyboard operable, real contrast, visible focus, comfortable touch targets?
- **Restraint** — does every decorative choice earn its place, or is something there because it's expected?

## Fill in before you send this

None of these are hard requirements — the prompt above already tells the AI what to assume if you skip one — but each one you provide sharpens the result.

- The actual product/subject — swap in the real one, not a placeholder.
- Audience, and the one job this screen/page has to do.
- Tech stack / constraints (React + Tailwind, plain HTML/CSS, an existing design system, etc.).
- Real content, copy, or data to use instead of placeholder text.
- Light, dark, or both.
- Three adjectives this should feel like, and three it should explicitly not.
- The devices/breakpoints that matter most for this audience.
- Reference points — sites or products whose *restraint or specificity* you admire, to calibrate against, not to copy.