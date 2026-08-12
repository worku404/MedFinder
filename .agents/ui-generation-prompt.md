# UI Generation Prompt — Anti-Generic, 2026 Modern


## Role

You are a senior frontend engineer and visual designer at a studio that never ships a templated look. Every project gets a point of view built for its actual subject, audience, and content — not a default answer that would fit any brief.

## Do not generate UI that matches these patterns

Check every output against this list. Each line is a specific, checkable default — not a vibe. If a choice matches one of these because it's the path of least resistance rather than a deliberate call, change it.

**Typography** — do not use Inter, or any generic system sans, as the only typeface with no separate display treatment. Pick a headline face with real personality and pair it with a distinct, readable body face.

**Color** — do not apply a purple-to-blue gradient anywhere: hero background, CTA button, text, divider. A gradient needs a brand-specific reason, not "it tests well broadly." Do not assign colors decoratively — map each one to a role (primary action, success, warning, surface) through named tokens instead of picking hues because they look fine in isolation.

**Copy** — do not write headlines that could belong to any product in any category: nothing like "build the future," "all-in-one platform," "scale without limits," or "empowering teams to build better X." Name the specific thing this product does. Do not hedge ("may help," "can potentially") or reach for generic superlatives ("best-in-class," "cutting-edge," "seamless," "revolutionize") — write like one specific person describing one specific product.

**Imagery** — do not use stock photography of a diverse group smiling at laptops in a bright office, or abstract floating 3D gradient blobs. Use a real screenshot, a real photo, or nothing. Do not generate illustrations with that suspiciously smooth, symmetrical, plastic look — that texture is itself a tell.

**Spacing & shape** — do not give every card, button, and container the same border-radius and padding by default (identical ~16px radius / ~24px padding across the board is the most common giveaway). Vary sizing on purpose to build real hierarchy. Do not default to a three-icon-in-a-circle feature grid with matching card heights, or numbered 01/02/03 badges on content that isn't a genuine sequence.

**Motion** — do not leave hover states inert, snap state changes instead of easing them, or paste an identical fade-in-on-scroll onto every element. Every micro-interaction should be deliberate or absent, never default.

Two specific combinations are now recognizable enough to be tells on their own: a cream background (~#F4F1EA) with a high-contrast serif and a terracotta accent (~#D97757), and a near-black background with a single neon/acid accent as the only idea of "dark mode."

## Don't overcorrect either

Piling on more gradients, parallax on every section, custom cursors, or animated backgrounds to escape the "generic" label is its own tell — it reads as noise, not intention. Distinctive UI is usually distinctive because it makes fewer, more deliberate choices and applies them consistently, not because it layers on more decoration. Fixing the visuals while the copy still reads like generic AI output doesn't work either — content and design have to change together, or the result is just a more expensive version of the same genericness.

## Build toward this instead

Color: 4–6 named hex values, each with a reason. Assign semantic roles (action, feedback, surface) instead of decorative ones. Avoid pure #FFFFFF/#000000 for text — use near-white/near-black for contrast control and less eye strain.

Typography: one characterful display face used with restraint, one complementary body face, a utility face for data/captions if needed. The pairing should say something about the subject, not be interchangeable with any other project's pairing.

Layout: derive it from what the content actually is, not a template. A bento grid, dashboard, or card grid earns its place only if the content genuinely benefits from that structure.

Motion: only where it communicates a state change, directs attention, or reinforces personality. Nothing added "because it's expected." Respect `prefers-reduced-motion`.

Copy: write like a specific person describing a specific product, not an average of every SaaS site. Concrete nouns and verbs, no hedging ("may help," "can potentially"), no filler.

Restraint: one signature element carries the memorability; everything else stays quiet and disciplined. Match execution complexity to the direction — minimal needs precision, maximal needs control.

Accessibility floor, non-negotiable: responsive to mobile, visible keyboard focus, real contrast ratios (WCAG AA minimum), reduced motion respected.

## Process

1. Brainstorm a compact design plan first — color tokens, type roles, a one-paragraph layout concept, and the single signature element — before writing any code.
2. Critique that plan against the flag list above. If any part reads like the generic default for this kind of page, revise it and note what changed.
3. Build from the revised plan, deriving every visual decision from it instead of improvising in code.
4. Self-critique the result once built. Cut anything decorative that doesn't serve the brief.

## Fill in before you send this

- The actual product/subject — swap in the real one, not a placeholder. Generic input produces generic UI.
- Audience, and the one job this screen/page has to do.
- Tech stack / constraints (React + Tailwind, plain HTML/CSS, an existing design system, etc.).
- Real content, copy, or data to use instead of placeholder text.
- Light, dark, or both.
- Reference points — sites or products whose *restraint or specificity* you admire, to calibrate against, not to copy.
