# Phase 3: Brain Components

## Goal
Create 3 brain component JSON files that define LLM providers following the Brain Component schema from Phase 2.

## Components to Create

### 1. Claude Sonnet 4
**File:** `public/components/brain-claude-sonnet-4.json`

**Key Details:**
- Provider: Anthropic
- Model: claude-sonnet-4-20250514
- Context Window: 200,000 tokens
- Pricing: $3.00/$15.00 per million tokens (input/output)
- Capabilities: text_generation, tool_use, vision, extended_thinking
- Cache: Enabled
- Icon: 🧠
- Color: #D4A574
- Tags: production, balanced, recommended

### 2. GPT-4.0
**File:** `public/components/brain-gpt-4.json`

**Key Details:**
- Provider: OpenAI
- Model: gpt-4-turbo
- Context Window: 128,000 tokens
- Pricing: $10.00/$30.00 per million tokens (input/output)
- Capabilities: text_generation, tool_use, vision
- Cache: Disabled
- Icon: 🤖
- Color: #10A37F
- Tags: production, popular

### 3. Llama 3.3 70B
**File:** `public/components/brain-llama-3-70b.json`

**Key Details:**
- Provider: Replicate (Meta)
- Model: meta/llama-3.3-70b-instruct
- Context Window: 128,000 tokens
- Pricing: $0.35/$0.40 per million tokens (input/output)
- Capabilities: text_generation
- Cache: Disabled
- Icon: 🦙
- Color: #0668E1
- Tags: open-source, cost-effective

## Implementation Steps

1. **Create brain-claude-sonnet-4.json**
   - Follow Brain Component schema
   - Include all required fields (id, type, name, version, provider)
   - Configure model settings (temperature: 0.7, max_tokens: 4096, streaming: true)
   - Define interface with inputs/outputs/capabilities
   - Add resources (token_cost, context_window, cache_enabled, latency)
   - Add metadata (author, description, tags, icon, color)

2. **Create brain-gpt-4.json**
   - Follow Brain Component schema
   - Configure for OpenAI provider
   - Set appropriate model, pricing, and capabilities
   - Add metadata

3. **Create brain-llama-3-70b.json**
   - Follow Brain Component schema
   - Configure for Replicate provider
   - Set appropriate model, pricing, and capabilities
   - Add metadata

## Schema Compliance
All components must include:
- ✅ id (unique identifier)
- ✅ type: "brain"
- ✅ name, version, provider
- ✅ config (model, temperature, max_tokens, system_prompt, streaming)
- ✅ interface (inputs, outputs, capabilities)
- ✅ resources (token_cost, context_window, cache_enabled)
- ✅ metadata (author, description, tags, icon, color)

## Success Criteria
- [ ] All 3 brain component JSON files created
- [ ] All files follow Brain Component schema exactly
- [ ] All required fields populated
- [ ] JSON is valid and properly formatted
- [ ] Files are ready for component registry (Phase 6)

## Dependencies
- Phase 2 must be complete (schemas defined)

## Notes
- These components will be referenced in the component registry (Phase 6)
- Default temperature: 0.7 for all components
- Default max_tokens: 4096 for all components
- Streaming enabled for all components
- Pricing information should be accurate and up-to-date
