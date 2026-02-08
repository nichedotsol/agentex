# Phase 13: Component Library UI

## Goal
Create a searchable, categorized component library sidebar that displays all available components from the registry.

## UI Components

### 1. Component Library Sidebar
**Location:** `src/components/ComponentLibrary.tsx`

**Features:**
- Fixed or collapsible sidebar
- Category tabs: Brains, Tools, Runtimes
- Search functionality
- Component cards grid/list view
- Drag-and-drop support (for Phase 14)

### 2. Component Card
**Location:** `src/components/ComponentCard.tsx`

**Displays:**
- Component icon (emoji or custom)
- Component name
- Provider/author
- Brief description
- Tags/badges
- Color accent (from metadata)

### 3. Category Tabs
**Location:** `src/components/CategoryTabs.tsx`

**Features:**
- Tab navigation (Brains, Tools, Runtimes)
- Active state styling
- Count badges showing number of components
- Icons for each category

### 4. Search Bar
**Location:** `src/components/ComponentSearch.tsx`

**Features:**
- Real-time search
- Filters by name, description, tags
- Highlight matching text
- Clear search button

### 5. Component Details Panel
**Location:** `src/components/ComponentDetails.tsx`

**Shows (on click/hover):**
- Full description
- Configuration options
- Pricing/cost info
- Capabilities list
- Requirements

## Data Integration

### Load Component Registry
- Fetch `public/components/registry.json`
- Load individual component JSON files
- Parse and organize by category
- Create searchable index

### Component Data Structure
- Use component metadata for display
- Map icons, colors, descriptions
- Extract tags for filtering
- Organize by category

## Implementation Steps

1. **Create component library hook**
   - `src/hooks/useComponentRegistry.ts`
   - Load registry data
   - Filter and search logic
   - Category organization

2. **Create component library sidebar**
   - Layout structure
   - Category tabs
   - Search bar
   - Component grid

3. **Create component card component**
   - Display component info
   - Hover effects
   - Click handlers
   - Drag handle (for Phase 14)

4. **Create search functionality**
   - Search input component
   - Filter logic
   - Highlight matching text

5. **Add styling**
   - Sidebar layout
   - Card designs
   - Search bar styling
   - Responsive behavior

## Success Criteria
- [ ] Component library sidebar displays all components
- [ ] Category tabs work correctly
- [ ] Search filters components in real-time
- [ ] Component cards show all metadata
- [ ] Responsive design works
- [ ] Ready for drag-and-drop integration

## Dependencies
- Phase 11 must be complete (Next.js setup)
- Phase 6 must be complete (component registry)

## Notes
- Use Zustand for component state (prepare for Phase 16)
- Load components dynamically
- Cache component data
- Optimize for performance with many components
- Prepare for drag-and-drop in Phase 14
