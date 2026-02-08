# Phase 14: Visual Builder Workspace

## Goal
Create a 3D/visual workspace canvas where users can drag-and-drop components and visually assemble their agent.

## UI Components

### 1. Workspace Canvas
**Location:** `src/components/WorkspaceCanvas.tsx`

**Features:**
- Three.js canvas for 3D visualization
- Component nodes positioned in 3D space
- Connection lines between components
- Camera controls (orbit, pan, zoom)
- Grid or background reference

### 2. Component Node
**Location:** `src/components/ComponentNode.tsx`

**Features:**
- 3D representation of component
- Visual indicator (icon, color, shape)
- Position in workspace
- Selection state
- Connection points

### 3. Connection Lines
**Location:** `src/components/ConnectionLine.tsx`

**Features:**
- Visual connections between components
- Animated flow indicators
- Connection validation
- Click to configure connection

### 4. Workspace Controls
**Location:** `src/components/WorkspaceControls.tsx`

**Features:**
- Zoom controls
- Reset camera button
- View presets (top, side, isometric)
- Grid toggle
- Minimap (optional)

### 5. Drag and Drop Handler
**Location:** `src/hooks/useDragDrop.ts`

**Features:**
- Handle drag from component library
- Drop onto workspace
- Position calculation
- Validation (e.g., only one brain)

## Workspace Layout

### Component Zones
- **Brain Zone**: Center position (only one allowed)
- **Tools Zone**: Surrounding brain, multiple allowed
- **Runtime Zone**: Bottom position (only one allowed)

### Visual Design
- 3D space with depth
- Component nodes as 3D objects or cards
- Color coding by category
- Smooth animations
- Connection visualization

## Implementation Steps

1. **Set up Three.js scene**
   - Initialize Three.js with React Three Fiber
   - Create scene, camera, renderer
   - Add lighting
   - Add grid/background

2. **Create component nodes**
   - 3D representation of components
   - Position in workspace zones
   - Visual styling (colors, icons)
   - Selection highlighting

3. **Implement drag and drop**
   - Drag from component library
   - Drop onto workspace
   - Position validation
   - Add to build state

4. **Create connection system**
   - Visual connections between components
   - Connection validation
   - Animated flow

5. **Add workspace controls**
   - Camera controls
   - Zoom/pan functionality
   - View presets

6. **Integrate with state**
   - Connect to Zustand store
   - Update build configuration
   - Sync with component library

## Success Criteria
- [ ] 3D workspace renders correctly
- [ ] Components can be dragged from library
- [ ] Components can be dropped onto workspace
- [ ] Component nodes display correctly
- [ ] Connections show between components
- [ ] Camera controls work
- [ ] Build state updates on changes

## Dependencies
- Phase 11 must be complete (Next.js setup)
- Phase 13 must be complete (component library)
- Phase 16 should be planned (state management)

## Notes
- Use @react-three/fiber and @react-three/drei
- Consider performance with many components
- Use Framer Motion for 2D fallback if needed
- Prepare for configuration panels in Phase 15
- Integrate with validation from Phase 9
