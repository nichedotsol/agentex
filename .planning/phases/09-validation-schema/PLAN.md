# Phase 9: Validation Schema

## Goal
Create a build configuration validator that ensures build configurations are valid before code generation and deployment.

## Validator Structure

### File Location
`src/lib/validator.ts`

### Validation Function
The validator will:
- Accept a build configuration object
- Return a validation result with success status, errors, and warnings
- Check all required fields and constraints
- Provide helpful error messages

### Validation Rules

1. **Required Components**
   - Must have exactly 1 brain component
   - Must have at least 1 tool component (warning if none)
   - Must have exactly 1 runtime component

2. **Token Budget Validation**
   - If token_budget is set, check if it's reasonable
   - Warn if token_budget is very low (< 100)

3. **Component Structure**
   - Verify components match expected schema
   - Check that component IDs are valid
   - Ensure component types are correct

4. **Settings Validation**
   - Validate timeout values
   - Check retry_policy format
   - Verify numeric values are positive

### Return Type

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

## Implementation Steps

1. **Create validator.ts file**
   - Define ValidationResult interface
   - Create validateBuild function
   - Implement brain component validation (exactly 1 required)
   - Implement tools validation (at least 1, warning if none)
   - Implement runtime validation (exactly 1 required)
   - Implement token budget validation (warning if too low)
   - Return validation result with errors and warnings

2. **Validate implementation**
   - Ensure TypeScript types are correct
   - Check that all validation rules are implemented
   - Verify error messages are helpful

## Validation Details

### Error Cases (Invalid Build)
- Missing brain component
- Missing runtime component
- Invalid component structure

### Warning Cases (Valid but Suboptimal)
- No tools configured (agent will have limited capabilities)
- Very low token budget (< 100)
- Missing optional settings

## Success Criteria
- [ ] validator.ts file created in src/lib/
- [ ] ValidationResult interface defined
- [ ] validateBuild function implemented
- [ ] All validation rules implemented:
  - [ ] Exactly 1 brain required
  - [ ] At least 1 tool (warning if none)
  - [ ] Exactly 1 runtime required
  - [ ] Token budget validation
- [ ] Error messages are clear and helpful
- [ ] TypeScript types are correct
- [ ] Ready for use in build system

## Dependencies
- Phase 2 must be complete (schemas defined for reference)

## Notes
- Validator is used before code generation
- Errors prevent code generation
- Warnings allow code generation but inform user
- Can be extended later with more validation rules
- Should validate against component schemas from Phase 2
