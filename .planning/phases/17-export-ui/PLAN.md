# Phase 17: Export & Deployment UI

## Goal
Create export interface that allows users to export their agent builds to GitHub, Vercel, Cursor, or download as ZIP.

## UI Components

### 1. Export Modal
**Location:** `src/components/ExportModal.tsx`

**Features:**
- Modal/dialog overlay
- Export target selection
- Build summary display
- Validation status
- Export button

### 2. Export Target Cards
**Location:** `src/components/ExportTarget.tsx`

**Targets:**
- **GitHub**: Create new repository
- **Vercel**: Deploy to Vercel account
- **Cursor**: Generate Cursor deep link
- **Local**: Download as ZIP

**Each card shows:**
- Icon
- Name
- Description
- Requirements/notes
- Action button

### 3. Build Summary
**Location:** `src/components/BuildSummary.tsx`

**Displays:**
- Selected brain
- Selected tools (count and list)
- Selected runtime
- Token budget
- Estimated cost
- Validation status

### 4. Code Preview (Optional)
**Location:** `src/components/CodePreview.tsx`

**Features:**
- Preview generated code
- Syntax highlighting
- Copy to clipboard
- Language tabs (TypeScript/Python)

### 5. Export Progress
**Location:** `src/components/ExportProgress.tsx`

**Features:**
- Progress indicator
- Step-by-step status
- Success/error messages
- Download link when ready

## Export Functions

### 1. GitHub Export
- Generate code from templates
- Create repository via GitHub API
- Push code to repository
- Return repository URL

### 2. Vercel Export
- Generate Next.js code
- Deploy via Vercel API
- Return deployment URL

### 3. Cursor Export
- Generate Cursor project link
- Include build configuration
- Deep link to open in Cursor

### 4. Local Export
- Generate code from templates
- Create ZIP file
- Include all necessary files
- Trigger download

## Code Generation

### Template Processing
- Load templates from `templates/`
- Replace template variables:
  - `{{BUILD_ID}}` → UUID
  - `{{TIMESTAMP}}` → ISO timestamp
  - `{{AGENT_CONFIG}}` → JSON config
- Generate TypeScript or Python code
- Include package.json, README, etc.

### File Structure
- Generated code files
- Configuration files
- Dependencies (package.json, requirements.txt)
- README with setup instructions
- .gitignore

## Implementation Steps

1. **Create export modal component**
   - Modal layout
   - Target selection
   - Build summary
   - Action buttons

2. **Create export target components**
   - GitHub card
   - Vercel card
   - Cursor card
   - Local download card

3. **Implement code generation**
   - Template processor
   - Variable replacement
   - File generation
   - ZIP creation

4. **Implement GitHub export**
   - GitHub API integration
   - Repository creation
   - Code push

5. **Implement Vercel export**
   - Vercel API integration
   - Deployment process

6. **Implement Cursor export**
   - Link generation
   - Configuration encoding

7. **Implement local export**
   - ZIP file creation
   - Download trigger

8. **Add progress tracking**
   - Export steps
   - Progress indicator
   - Error handling
   - Success messages

## Success Criteria
- [ ] Export modal displays correctly
- [ ] All export targets available
- [ ] Code generation works correctly
- [ ] GitHub export creates repository
- [ ] Vercel export deploys successfully
- [ ] Local export downloads ZIP
- [ ] Progress tracking works
- [ ] Error handling works

## Dependencies
- Phase 7 must be complete (TypeScript template)
- Phase 8 must be complete (Python template)
- Phase 16 must be complete (state management)
- Phase 9 provides validation

## Notes
- Handle API authentication
- Show clear error messages
- Validate build before export
- Provide helpful instructions
- Consider rate limits for APIs
- Support both export formats
