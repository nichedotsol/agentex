# Publishing @agentex/skill to npm

## Prerequisites

1. Create an npm account at https://www.npmjs.com/signup
2. Login to npm: `npm login`
3. Verify you're logged in: `npm whoami`

## Publishing Steps

1. **Navigate to package directory:**
   ```bash
   cd packages/agentex-skill
   ```

2. **Verify package.json:**
   - Check version number
   - Verify all required fields are present
   - Ensure files array includes all necessary files

3. **Test locally (optional):**
   ```bash
   npm pack
   ```
   This creates a tarball you can test installing locally.

4. **Publish to npm:**
   ```bash
   npm publish --access public
   ```
   
   Note: `--access public` is required for scoped packages (@agentex/skill)

5. **Verify publication:**
   - Check https://www.npmjs.com/package/@agentex/skill
   - Test installation: `npm install -g @agentex/skill`

## Version Updates

To publish a new version:

1. Update version in `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Update `CHANGELOG.md` with new changes

3. Commit changes:
   ```bash
   git add .
   git commit -m "Bump @agentex/skill to v1.0.1"
   git tag v1.0.1
   ```

4. Publish:
   ```bash
   npm publish --access public
   ```

## Troubleshooting

### "You do not have permission to publish"
- Make sure you're logged in: `npm login`
- Check package name isn't already taken
- For scoped packages, ensure you have access to the @agentex scope

### "Package name already exists"
- The package name is already taken
- Consider using a different name or scope

### "Invalid package name"
- Package names must be lowercase
- Scoped packages must use format: `@scope/package-name`

## Post-Publication

After successful publication:

1. Update main README.md to mention npm installation
2. Update website installation page
3. Announce on Discord/social media
4. Monitor for issues and feedback
