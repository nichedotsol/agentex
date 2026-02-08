# Phase 15: Component Configuration UI

## Goal
Create configuration panels that allow users to edit component settings (brain model, tool parameters, runtime options).

## UI Components

### 1. Configuration Panel
**Location:** `src/components/ConfigPanel.tsx`

**Features:**
- Slide-out or modal panel
- Tabbed interface for different component types
- Form inputs for all config options
- Real-time validation
- Save/cancel buttons

### 2. Brain Configuration
**Location:** `src/components/BrainConfig.tsx`

**Settings:**
- Model selection (if multiple available)
- Temperature slider (0.0 - 1.0)
- Max tokens input
- System prompt textarea
- Streaming toggle
- Cost/pricing display

### 3. Tool Configuration
**Location:** `src/components/ToolConfig.tsx`

**Settings:**
- Endpoint URL (if editable)
- Authentication setup
- Required parameters form
- Optional parameters form
- Rate limit display
- Test connection button

### 4. Runtime Configuration
**Location:** `src/components/RuntimeConfig.tsx`

**Settings:**
- Platform selection
- Framework options
- Environment variables editor
- Deployment settings
- Pricing information

### 5. Build Settings
**Location:** `src/components/BuildSettings.tsx`

**Settings:**
- Token budget input
- Timeout settings
- Retry policy selection
- Build name and description
- Author information

## Form Components

### Input Components
- Text inputs
- Number inputs
- Sliders
- Toggles/switches
- Dropdowns/selects
- Textareas
- Key-value editors (for env vars)

### Validation
- Real-time validation
- Error messages
- Required field indicators
- Type checking
- Range validation

## Implementation Steps

1. **Create configuration panel component**
   - Panel layout
   - Tab navigation
   - Form structure

2. **Create brain configuration form**
   - All brain-specific settings
   - Validation rules
   - Default values

3. **Create tool configuration form**
   - Tool-specific settings
   - Parameter forms
   - Auth configuration

4. **Create runtime configuration form**
   - Runtime-specific settings
   - Environment variables editor
   - Deployment options

5. **Create build settings form**
   - Global build settings
   - Metadata fields

6. **Add form validation**
   - Use validation from Phase 9
   - Real-time error display
   - Prevent invalid saves

7. **Integrate with state**
   - Connect to Zustand store
   - Update build configuration
   - Sync with workspace

## Success Criteria
- [ ] Configuration panel opens/closes correctly
- [ ] All component types have config forms
- [ ] Form inputs work correctly
- [ ] Validation displays errors
- [ ] Changes save to build state
- [ ] Default values load correctly
- [ ] Responsive design works

## Dependencies
- Phase 14 must be complete (workspace for selection)
- Phase 16 should be planned (state management)
- Phase 9 provides validation logic

## Notes
- Use React Hook Form for form management
- Validate against component schemas
- Show helpful tooltips and descriptions
- Auto-save or explicit save button
- Support for multiple component instances
