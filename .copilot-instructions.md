# FDM Monster Client-Next Development Instructions

## Windows PowerShell Commands (WebStorm + Node 22/24)

When working with the `fdm-monster-client-next` repository in Windows PowerShell with WebStorm, remember these key points:

### Directory Navigation
Always prefix commands with directory change:
```powershell
cd "..\fdm-monster-client-next"
```

### Command Chaining
Use `;` (semicolon) instead of `&&` for command chaining in PowerShell:
```powershell
# ❌ Don't use (bash syntax)
cd "path" && yarn test

# ✅ Use (PowerShell syntax) 
cd "path"; yarn test
```

### Yarn Scripts Available
```powershell
yarn build            # TypeScript check + Build for production (preferred for validation)
vue-tsc --noEmit      # TypeScript type checking only
yarn test:unit        # Run unit tests
yarn test:coverage    # Run tests with coverage
yarn lint             # Run ESLint
yarn dev              # Start development server (use sparingly)
```

### Validation Commands (Preferred)
```powershell
# Validate changes with TypeScript checking and build
yarn build

# Quick TypeScript type check only
npx vue-tsc --noEmit

# Run linting
yarn lint

# Run tests for validation
yarn test:unit
```

### Testing Commands
```powershell
# Run all tests
yarn test:unit

# Run specific test file
yarn test:unit --run src/components/path/to/test.spec.ts

# Run tests in watch mode
yarn test:unit --watch
```

### Common Issues
- PowerShell may reset to `fdm-monster` directory between commands
- Use `Set-Location` or `cd` to ensure you're in the right directory
- File paths use backslashes (`\`) in Windows
- Always use Yarn (not NPM) - Node 22/24 environment
- **Prefer `yarn build` for validation over `yarn dev` for running the server**
- Use typecheck (`vue-tsc --noEmit`) to validate TypeScript without building

### Test Files Created
- `OctoFarmImportDialog.spec.ts` - Main component tests
- `OctoFarmValidation.spec.ts` - Unit validation tests  
- `OctoFarmImportDialog.integration.spec.ts` - Integration tests

---
*GitHub Copilot Instructions - WebStorm + Yarn + Node 22/24*
