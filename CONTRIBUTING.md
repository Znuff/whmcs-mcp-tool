# Contributing to WHMCS MCP Server

Thank you for your interest in contributing to the WHMCS MCP Server! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Adding New Tools](#adding-new-tools)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be considerate in your interactions with other contributors.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment
4. Create a feature branch
5. Make your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Access to a WHMCS installation for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/whmcs-mcp-server.git
cd whmcs-mcp-server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your WHMCS credentials in .env
# Edit .env with your WHMCS API credentials

# Build the project
npm run build

# Run tests
npm test
```

### Running in Development

```bash
# Development mode with auto-reload
npm run dev

# Watch mode for continuous compilation
npm run watch
```

## Project Structure

```
whmcs-mcp-server/
├── src/
│   ├── index.ts          # Main MCP server entry point
│   ├── whmcs-client.ts   # WHMCS API client
│   └── test.ts           # Test script
├── dist/                 # Compiled JavaScript output
├── docs/                 # Additional documentation
├── .vscode/
│   └── mcp.json          # VS Code MCP configuration
├── .github/
│   └── copilot-instructions.md
├── package.json
├── tsconfig.json
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Adding New Tools

### 1. Add the API Method to whmcs-client.ts

```typescript
/**
 * Description of what this method does
 */
async yourNewMethod(params: {
    requiredParam: string;
    optionalParam?: number;
}) {
    return this.call<WhmcsApiResponse & {
        // Define the expected response structure
        someField: string;
    }>('YourWhmcsApiAction', params);
}
```

### 2. Register the Tool in index.ts

```typescript
server.registerTool(
    'whmcs_your_new_tool',
    {
        title: 'Your New Tool',
        description: 'Clear description of what this tool does',
        inputSchema: {
            requiredParam: z.string().describe('Description of this parameter'),
            optionalParam: z.number().optional().describe('Optional parameter'),
        },
    },
    async (params) => {
        const result = await whmcsClient.yourNewMethod(params);
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
    }
);
```

### 3. Update Documentation

- Add the tool to README.md
- Add the tool to CHANGELOG.md under [Unreleased]
- Update any relevant documentation

### Tool Naming Conventions

- All tool names should start with `whmcs_`
- Use snake_case for tool names
- Use descriptive names that reflect the action (e.g., `whmcs_get_clients`, `whmcs_create_invoice`)

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define explicit types for all function parameters and return values
- Use interfaces for complex object structures
- Avoid `any` type when possible

### Code Style

- Use 4 spaces for indentation
- Use single quotes for strings
- Add JSDoc comments for public methods
- Keep functions focused and single-purpose

### Example

```typescript
/**
 * Get clients from WHMCS with optional filtering
 * @param params - Filter and pagination options
 * @returns List of clients matching the criteria
 */
async getClients(params: GetClientsParams = {}): Promise<GetClientsResponse> {
    return this.call<GetClientsResponse>('GetClients', params);
}
```

## Testing

### Running Tests

```bash
# Run the test script
npm test

# Or manually
npx tsx src/test.ts
```

### Writing Tests

When adding new functionality:

1. Add test cases to `src/test.ts` or create dedicated test files
2. Test both success and error scenarios
3. Verify the API response structure matches expectations

### Manual Testing

For testing against a real WHMCS installation:

1. Set up your `.env` file with valid credentials
2. Run `npm run dev` to start the server
3. Use an MCP client to test the tools

## Submitting Changes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Add tests if applicable
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New features
   - `fix:` - Bug fixes
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `test:` - Test additions/changes
   - `chore:` - Build/tooling changes

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all checks pass

### Pull Request Checklist

- [ ] Code follows the project's coding standards
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Commit messages follow conventional commits

## Release Process

Releases follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backwards compatible

### Creating a Release

1. Update version in `package.json`
2. Update CHANGELOG.md with release date
3. Create a git tag: `git tag v1.x.x`
4. Push the tag: `git push origin v1.x.x`
5. Create a GitHub release

## Questions?

If you have questions about contributing, feel free to:

- Open an issue for discussion
- Reach out to the maintainers

Thank you for contributing! 🎉
