# Anti-AI Design Guide: Avoiding the "Slop" Aesthetic

> **Purpose**: This document serves as a reference to ensure all UI/UX decisions avoid the markers of AI-generated "slop" design. Consult this guide when adding new features or components.

---

## 🚫 Visual Markers to AVOID

### 1. Color Palette Red Flags

| ❌ AVOID | ✅ PREFER |
|----------|----------|
| Neon Purple (#A020F0) | Earth tones, muted colors |
| Cyan (#00FFFF) | Brand-specific heritage colors |
| Electric Blue gradients | High-contrast B&W or flat colors |
| Linear perfect gradients | Mesh gradients with grain/noise |
| Dual-tone smooth transitions | Hard stops, intentional color breaks |

**Our Brand Colors** (Saint Lucia inspired):
- Primary: `#0070FF` (Cerulean Blue)
- Accent: `#FCD116` (Gold/Yellow)
- Keep these flat, no gradients unless intentional

### 2. Typography Red Flags

| ❌ AVOID | ✅ PREFER |
|----------|----------|
| Inter/Roboto as the ONLY font | Mix display + body fonts |
| Mathematical scaling (2x, 1.5x) | Optical sizing with variation |
| Center-aligned body paragraphs | Left-aligned body text |
| Uniform sentence-length copy | Variable rhythm in writing |
| Default letter-spacing | Tighter tracking on headlines |

**Hierarchy Rules**:
- Headlines: Poppins (display), tighter tracking (-0.02em)
- Body: Inter, comfortable line-height (1.6)
- NEVER center-align more than 2 lines of text

### 3. Visual Asset Red Flags

| ❌ AVOID | ✅ PREFER |
|----------|----------|
| Hyper-smooth textures | Subtle grain/noise overlays |
| "Cinematic" stock lighting | Natural, contextual photography |
| Glossy/plastic finishes | Matte, textured surfaces |
| AI-generated people | Real photos or stylized illustrations |
| Generic icon libraries | Custom or hand-drawn icons |

**Image Checklist**:
- [ ] No extra fingers/limbs in photos
- [ ] Text in images is readable (not gibberish)
- [ ] Shadows are physically consistent
- [ ] No "uncanny valley" faces

### 4. Layout Red Flags

| ❌ AVOID | ✅ PREFER |
|----------|----------|
| Flat Bento grids (all equal boxes) | Hierarchical sizing (hero + supporting) |
| Perfect geometric symmetry | Intentional asymmetry |
| CTAs in visual blind spots | F-pattern aware placement |
| "Wall of text" blocks | Scannable chunks with breathing room |

---

## 🚫 Linguistic Markers to AVOID

### Banned Words & Phrases

**NEVER use these AI-telltale words**:
- "Delve" / "Delving into"
- "Tapestry" (of flavors, experiences, etc.)
- "Leverage" (as a verb)
- "Unlock" (potential, possibilities)
- "Seamless" / "Seamlessly"
- "Cutting-edge"
- "Revolutionize"
- "Unprecedented"
- "Synergy"
- "Landscape" (digital, culinary, etc.)
- "It's important to note that..."
- "In today's fast-paced world..."
- "Moreover" / "Furthermore" (overuse)

### Copy Style Rules

| ❌ AVOID | ✅ PREFER |
|----------|----------|
| Passive voice | Active voice |
| Hedging ("It could be said...") | Direct statements |
| Uniform sentence length | Varied rhythm (short. Then longer ones.) |
| Generic superlatives | Specific claims with evidence |
| Corporate neutral tone | Brand personality/voice |

**Good Copy Examples**:
```
❌ "Delve into our seamless shopping experience that leverages cutting-edge technology."
✅ "Shop Caribbean groceries. Delivered to your door in Saint Lucia."

❌ "Unlock the full potential of Caribbean flavors with our unprecedented selection."
✅ "Over 500 local products. The same brands you grew up with."
```

---

## 🚫 Structural Markers to AVOID

### UI Component Red Flags

| ❌ AVOID | ✅ PREFER |
|----------|----------|
| Heavy rounded corners (rounded-3xl) | Moderate rounding (rounded-lg, rounded-xl) |
| Glassmorphism everywhere | Selective use or flat design |
| Neumorphism (soft 3D) | Clear shadows or flat |
| Infinite smooth animations | Snappy 150-200ms transitions |
| Parallax scrolling overuse | Static or subtle movement |

### "Dead Click" Prevention

Every visual affordance MUST be functional:
- [ ] Play buttons → actually play something
- [ ] Download icons → actually download
- [ ] Charts/graphs → show real, accurate data
- [ ] "Learn more" → leads to more information
- [ ] Interactive-looking elements → are interactive

### Code Quality Signals

| ❌ AI Slop Code | ✅ Human-Crafted Code |
|----------------|----------------------|
| Div soup (nested divs everywhere) | Semantic HTML (article, section, nav) |
| Inline styles | Consistent utility classes |
| Missing alt text | Descriptive, contextual alt text |
| No ARIA labels | Full accessibility support |
| Bloated dependencies | Lean, purposeful imports |

---

## ✅ Anti-AI Design Techniques

### 1. Add Texture & Grain

```css
/* Subtle grain overlay for backgrounds */
.grain-overlay {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
```

### 2. Typography with Soul

```css
/* Tighter tracking on display headings */
.heading-display {
  letter-spacing: -0.02em;
  font-feature-settings: "ss01", "ss02"; /* Stylistic alternates */
}

/* Variable line-height based on size */
.text-large { line-height: 1.4; }
.text-body { line-height: 1.6; }
.text-small { line-height: 1.5; }
```

### 3. Micro-interactions with Personality

```css
/* Satisfying button press */
.btn-press:active {
  transform: scale(0.97);
  transition: transform 0.1s ease-out;
}

/* Bounce on success */
@keyframes success-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 4. Hand-Drawn / Lo-Fi Elements

- Use SVG filters for "sketchy" borders
- Add slight rotation (0.5-1deg) to cards for organic feel
- Include real textures (paper, fabric) as backgrounds
- Use illustrations over stock photos where possible

---

## 📋 Pre-Launch Checklist

### Visual Audit
- [ ] No purple/cyan/blue AI gradients
- [ ] No hyper-polished "plastic" imagery
- [ ] Consistent shadow direction
- [ ] Text in images is readable
- [ ] Color palette matches brand, not "tech default"

### Copy Audit
- [ ] Zero banned words (delve, tapestry, leverage, etc.)
- [ ] Active voice throughout
- [ ] Varied sentence rhythm
- [ ] Brand personality present
- [ ] No filler phrases

### Interaction Audit
- [ ] No dead clicks (every affordance works)
- [ ] Animations are snappy (<300ms)
- [ ] Loading states provide feedback
- [ ] Error states are helpful, not generic

### Code Audit
- [ ] Semantic HTML structure
- [ ] All images have meaningful alt text
- [ ] ARIA labels on interactive elements
- [ ] No div soup
- [ ] Performance: Core Web Vitals pass

---

## 🎨 Lucian Connection Brand Voice

**Tone**: Friendly, direct, proudly Caribbean

**Do say**:
- "Fresh from Saint Lucia"
- "The brands you know"
- "Delivered to your door"
- "Shop local, even from abroad"

**Don't say**:
- "Seamless delivery experience"
- "Unlock Caribbean flavors"
- "Leverage our platform"
- "Unprecedented selection"

**Personality traits**:
- Warm but efficient
- Proud of local heritage
- Straightforward pricing
- No corporate speak

---

*Last updated: January 2026*
