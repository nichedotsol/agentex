# Phase 16: State Management & Build System

## Goal
Set up Zustand store for managing build state, integrate validation, and create build configuration management system.

## State Store Structure

### 1. Build Store
**Location:** `src/lib/stores/buildStore.ts`

**State:**
- Current build configuration
- Selected components (brain, tools[], runtime)
- Component positions in workspace
- Connections between components
- Build settings (token budget, timeout, etc.)
- Build metadata (name, description, author)

### 2. UI Store
**Location:** `src/lib/stores/uiStore.ts`

**State:**
- Component library visibility
- Configuration panel state
- Selected component in workspace
- Workspace camera position
- Active category tab
- Search query

### 3. Component Registry Store
**Location:** `src/lib/stores/registryStore.ts`

**State:**
- Loaded component registry
- Filtered components
- Component details cache
- Loading state

## Actions & Methods

### Build Store Actions
- `addComponent(component, position)` - Add component to build
- `removeComponent(componentId)` - Remove component
- `updateComponentConfig(componentId, config)` - Update component settings
- `connectComponents(fromId, toId)` - Create connection
- `updateBuildSettings(settings)` - Update global settings
- `validateBuild()` - Run validation
- `exportBuild()` - Generate export data
- `loadBuild(config)` - Load existing build
- `resetBuild()` - Clear build

### UI Store Actions
- `toggleComponentLibrary()` - Show/hide library
- `openConfigPanel(componentId)` - Open config for component
- `closeConfigPanel()` - Close config panel
- `selectComponent(componentId)` - Select component in workspace
- `setSearchQuery(query)` - Update search
- `setActiveCategory(category)` - Switch category tab

## Integration Points

### Validation Integration
- Use validator from Phase 9
- Validate on build changes
- Show errors/warnings in UI
- Prevent export if invalid

### Component Registry Integration
- Load registry on app start
- Cache component data
- Filter and search components
- Get component details

### Export Integration
- Prepare build config for export
- Format for code generation
- Include all component configs
- Generate build ID and timestamp

## Implementation Steps

1. **Set up Zustand stores**
   - Create build store
   - Create UI store
   - Create registry store
   - Define types/interfaces

2. **Implement build actions**
   - Component management
   - Configuration updates
   - Connection management
   - Settings management

3. **Integrate validation**
   - Call validator on changes
   - Store validation results
   - Display errors/warnings

4. **Create build utilities**
   - Export formatter
   - Build loader
   - Configuration merger
   - Default value generators

5. **Add persistence (optional)**
   - LocalStorage for drafts
   - Save/load builds
   - Auto-save functionality

6. **Connect to UI components**
   - Connect workspace to store
   - Connect config panels to store
   - Connect library to store

## Success Criteria
- [ ] Zustand stores created and working
- [ ] Build state updates correctly
- [ ] Validation runs on changes
- [ ] Export generates correct config
- [ ] UI components connected to stores
- [ ] State persists (if implemented)
- [ ] Performance is good with state updates

## Dependencies
- Phase 9 must be complete (validator)
- Phase 13 should be complete (component library)
- Phase 14 should be complete (workspace)
- Phase 15 should be complete (config panels)

## Notes
- Use TypeScript for type safety
- Keep state normalized
- Optimize re-renders
- Consider state persistence
- Prepare for export in Phase 17
