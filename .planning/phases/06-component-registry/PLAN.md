# Phase 6: Component Registry

## Goal
Create a component registry index JSON file that catalogs all available components (brains, tools, runtimes) and provides metadata about each category.

## Registry Structure

### File Location
`public/components/registry.json`

### Structure
The registry will include:
- Version information
- Last updated timestamp
- Components organized by type (brains, tools, runtimes)
- Category metadata (name, description, icon, color for each category)

### Component Lists

**Brains (3 components):**
- brain-claude-sonnet-4.json
- brain-gpt-4.json
- brain-llama-3-70b.json

**Tools (5 components):**
- tool-web-search.json
- tool-code-execution.json
- tool-blockchain-query.json
- tool-token-price.json
- tool-twitter-post.json

**Runtimes (2 components):**
- runtime-vercel.json
- runtime-local-docker.json

### Category Metadata

**Brains Category:**
- Name: "Brains"
- Description: "LLM providers that power your agent's reasoning"
- Icon: 🧠
- Color: #D4A574

**Tools Category:**
- Name: "Tools"
- Description: "External capabilities your agent can use"
- Icon: 🛠️
- Color: #3B82F6

**Runtimes Category:**
- Name: "Runtimes"
- Description: "Where your agent runs"
- Icon: 🚀
- Color: #10B981

## Implementation Steps

1. **Create registry.json file**
   - Set version to "0.1.0"
   - Set last_updated to current date (ISO format)
   - Create components object with three arrays:
     - brains: list all 3 brain component filenames
     - tools: list all 5 tool component filenames
     - runtimes: list all 2 runtime component filenames
   - Create categories object with metadata for each category

2. **Validate structure**
   - Ensure all component filenames match actual files
   - Verify JSON is valid
   - Check that all categories have complete metadata

## Success Criteria
- [ ] registry.json file created in public/components/
- [ ] All 10 components listed correctly
- [ ] Category metadata complete for all three types
- [ ] JSON is valid and properly formatted
- [ ] Version and timestamp included
- [ ] Ready for use by the visual builder UI

## Dependencies
- Phase 3 must be complete (3 brain components)
- Phase 4 must be complete (5 tool components)
- Phase 5 must be complete (2 runtime components)

## Notes
- The registry serves as the index for the component library
- Component filenames must match exactly (case-sensitive)
- Categories help organize components in the UI
- Version tracking helps with future updates
- The registry can be extended with additional metadata later
