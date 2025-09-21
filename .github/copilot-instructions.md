# Copilot Instructions for upem

Keep all answers as brief as possible.

## Project Overview

upem is a command line tool that updates package.json dependencies to latest versions.

## Code Patterns

- Use TypeScript with proper interfaces (IUpemOptions, IUpemReturn, etc.)
- Follow existing error handling pattern (return {OK: false, message: ...})
- Tests are written with the node:test framework and use node:assert/strict for assertions.
- Maintain backwards compatibility
- Do not use any additional dependencies unless absolutely necessary. If you do, explain why.
