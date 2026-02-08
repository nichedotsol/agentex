# Phase 11: Next.js App Setup & Layout - Hybrid Aesthetic

## Goal
Set up Next.js App Router structure with a hybrid aesthetic combining:
- **Overrides.com**: Interactive component specimens in grid layout
- **Garden Intel**: CRT effects, blurred backgrounds, analog aesthetic
- **Lain**: Floating draggable windows, layered depth

## Design Aesthetic

### Visual Style
- Terminal/CRT aesthetic with scan lines and noise
- Grid-based component showcase (Overrides.com style)
- Floating draggable windows (Lain style)
- Blurred gradient backgrounds (Garden Intel style)
- RGB chromatic aberration effects
- Mixed typography (Inter, JetBrains Mono, VT323 pixel font)

### Color Palette
- `ax-cyan`: #00ff9f (primary accent)
- `ax-red`: #ff0055
- `ax-blue`: #00d9ff
- `ax-bg`: #000000 (background)
- `ax-bg-elevated`: #0a0a0a
- `ax-border`: #1a1a1a
- `ax-text`: #ffffff
- `ax-text-dim`: #666666

## Files to Create

### 1. Enhanced Tailwind Configuration
**Location:** `tailwind.config.ts` (root)

**Features:**
- Custom color palette (ax-cyan, ax-red, ax-blue, etc.)
- Custom font families (Inter, JetBrains Mono, VT323)
- Custom animations (scanline, glitch, float, rgb-shift)
- Keyframes for CRT effects
- Extended backdrop blur utilities

### 2. Enhanced Global Styles
**Location:** `src/app/globals.css`

**Features:**
- Tailwind directives
- CSS variables for fonts
- CRT scan lines (body::before)
- CRT curvature effect (body::after)
- Chrome aberration utilities
- Grid dot and canvas patterns
- Noise background utility
- Window glass and shadow effects
- Custom scrollbar styling

### 3. Root Layout
**Location:** `src/app/layout.tsx`

**Features:**
- Load Inter, JetBrains Mono, and VT323 fonts from Google Fonts
- Apply font variables
- Metadata configuration
- HTML structure with font classes

### 4. Main Builder Page
**Location:** `src/app/page.tsx`

**Features:**
- Full-screen layout
- TopBar component
- ComponentShowcase sidebar
- Canvas workspace
- PropertiesPanel sidebar
- StatusBar footer
- BackgroundLayers component
- State management for components

### 5. BackgroundLayers Component
**Location:** `src/components/BackgroundLayers.tsx`

**Features:**
- Grid dot background
- Blurred gradient layers (Garden Intel style)
- Noise texture overlay
- Fixed positioning with z-index

### 6. TopBar Component
**Location:** `src/components/TopBar.tsx`

**Features:**
- AGENTEX/BUILDER title with chrome aberration
- Live status indicator with pulsing dot
- Build info (BUILD_001, modified time)
- Action buttons (SAVE, TEST, EXPORT)
- Terminal-style styling

### 7. ComponentShowcase Component
**Location:** `src/components/ComponentShowcase.tsx`

**Features:**
- Grid-based component specimens (Overrides.com style)
- Category sections (BRAIN, TOOLS, RUNTIME)
- Search input
- Component cards with:
  - Preview icon/emoji
  - Component name
  - Metadata (pricing, context, rate limits)
  - Hover effects with glow
  - Add indicator on hover
- Framer Motion animations

### 8. Canvas Component
**Location:** `src/components/Canvas.tsx`

**Features:**
- Animated grid background
- Empty state with instructions
- Floating draggable windows (Lain style)
- Window components with:
  - Title bar with traffic lights
  - Component info display
  - Drag handle
  - Remove functionality
- react-draggable integration

### 9. PropertiesPanel Component
**Location:** `src/components/PropertiesPanel.tsx`

**Features:**
- Cost Analysis section with animated progress bar
- System Metrics section
- Build Config section
- Real-time calculations
- Framer Motion animations for highlights

### 10. StatusBar Component
**Location:** `src/components/StatusBar.tsx`

**Features:**
- Bottom status bar
- Version info
- Status indicator
- Grid/zoom info
- Timezone display

### 11. PostCSS Configuration
**Location:** `postcss.config.js` (root)

**Features:**
- Tailwind CSS plugin
- Autoprefixer plugin

### 12. TypeScript Configuration
**Location:** `tsconfig.json` (root)

**Features:**
- Next.js TypeScript config
- Path aliases (@/components, @/lib, etc.)
- Strict mode settings

## Additional Dependencies

Update `package.json` with:
- `@monaco-editor/react`: ^4.6.0 (for future code editing)
- `react-draggable`: ^4.4.6 (for floating windows)
- Keep existing: framer-motion, zustand, three.js, react-three/fiber

## Implementation Steps

1. **Update package.json**
   - Add new dependencies (@monaco-editor/react, react-draggable)
   - Keep existing dependencies

2. **Create Tailwind configuration**
   - Custom color palette
   - Custom fonts
   - Custom animations and keyframes
   - Extended utilities

3. **Create PostCSS configuration**
   - Tailwind and Autoprefixer plugins

4. **Create global styles**
   - Tailwind directives
   - Font variables
   - CRT effects (scan lines, curvature)
   - Utility classes (chrome-aberration, grid-dots, window-glass, etc.)
   - Scrollbar styling

5. **Create root layout**
   - Load Google Fonts (Inter, JetBrains Mono, VT323)
   - Apply font variables
   - Set metadata

6. **Create BackgroundLayers component**
   - Grid background
   - Blurred gradients
   - Noise texture

7. **Create TopBar component**
   - Terminal-style header
   - Status indicators
   - Action buttons

8. **Create ComponentShowcase component**
   - Grid layout for component specimens
   - Category sections
   - Search functionality
   - Component cards with hover effects

9. **Create Canvas component**
   - Grid background
   - Empty state
   - Floating windows with react-draggable
   - Window components

10. **Create PropertiesPanel component**
    - Cost analysis
    - System metrics
    - Build config
    - Animated highlights

11. **Create StatusBar component**
    - Bottom status display
    - System info

12. **Create main builder page**
    - Layout structure
    - Component integration
    - State management setup

13. **Set up TypeScript configuration**
    - Path aliases
    - Next.js settings

## Success Criteria
- [ ] Tailwind configured with custom theme and animations
- [ ] CRT effects visible (scan lines, noise, curvature)
- [ ] All components render correctly
- [ ] Grid-based component showcase works
- [ ] Floating windows are draggable
- [ ] Background layers display correctly
- [ ] Typography mixing works (sans, mono, pixel)
- [ ] Chrome aberration effects visible
- [ ] Responsive layout works
- [ ] Ready for component integration

## Dependencies
- Phase 10 must be complete (package.json exists)

## Notes
- Aesthetic target: 80-90% match to reference designs
- Focus on visual polish and terminal aesthetic
- Prepare for component registry integration in Phase 13
- Floating windows ready for component configuration in Phase 15
- State management will be added in Phase 16
