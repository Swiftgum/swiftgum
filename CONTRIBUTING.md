# Contributing to Swiftgum

Thank you for your interest in contributing to Swiftgum! This document provides guidelines and instructions for contributing to our project. We welcome contributions of all kinds, from bug fixes and feature enhancements to documentation improvements.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Project Structure](#project-structure)
- [Development Environment Setup](#development-environment-setup)
- [Contribution Workflow](#contribution-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing to the project. We expect all contributors to adhere to this code to ensure a positive and inclusive environment for everyone.

## Project Structure

Swiftgum follows a monorepo structure with the following main components:

- **apps/studio**: The web portal where admins manage their knowledge integrations, and end users connect their data
- **apps/engine**: The backend service that processes data, handles indexing, and manages export
- **apps/shared**: Shared code and utilities used across different applications
- **apps/client**: SDK for external developers (not yet implemented)
- **supabase**: Database migrations and types
- **docs**: Project documentation

## Development Environment Setup

### Prerequisites

- Node.js (>= 20)
- pnpm (>= 9.0.0)
- Docker and Docker Compose

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/Titou325/knowledgex.git
cd knowledgex
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

You need to set up environment variables in two locations:

a) **Root directory**:

```bash
cp .env.local.example .env.local
```

b) **Studio app directory**:

```bash
cp apps/studio/.env.local.example apps/studio/.env.local
```

Both `.env.local.example` files contain the necessary environment variables with example values. For local development, the default values should work without modification. However, if you're setting up integrations with external services (like Google OAuth), you'll need to update those values with your own credentials.

4. **Start the development environment**

```bash
pnpm dev
```

This command will:

- Start Supabase locally
- Apply database migrations
- Build and start all services using Docker Compose

If you encounter any issues with Supabase, you can run these commands separately:

```bash
# Start Supabase
npx supabase start

# Apply migrations
npx supabase db push --local

# Start the services
docker compose -f docker-compose.dev.yml up --build
```

5. **Access the application**

- Studio (web portal): http://localhost:3000
- Engine API: http://localhost:8000
- Supabase Studio: http://localhost:44321

## Contribution Workflow

1. **Find or create an issue**

   Before starting work, check if there's an existing issue for the change you want to make. If not, create a new issue to discuss the proposed changes.

2. **Fork the repository**

   Fork the repository to your GitHub account.

3. **Create a feature branch**

   Create a branch from `main` with a descriptive name:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**

   Implement your changes, following our [coding standards](#coding-standards).

5. **Run tests and linting**

   Ensure your changes pass all tests and linting checks:

   ```bash
   pnpm lint
   # Add tests when available
   ```

6. **Commit your changes**

   Follow [conventional commits](https://www.conventionalcommits.org/) for your commit messages:

   ```bash
   git commit -m "feat: add new feature"
   ```

7. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a pull request**

   Open a pull request against the `main` branch of the original repository.

## Pull Request Guidelines

- Fill out the pull request template completely
- Link the PR to any related issues
- Include screenshots or GIFs for UI changes
- Make sure all CI checks pass
- Keep PRs focused on a single concern
- Be responsive to feedback and review comments

## Coding Standards

We use Biome for formatting and linting:

- Run `pnpm format` to format your code
- Run `pnpm lint` to check for linting issues

### General Guidelines

- Write clean, readable, and maintainable code
- Add comments for complex logic
- Follow the existing code style and patterns
- Use TypeScript for type safety
- Keep functions small and focused on a single responsibility
- Use meaningful variable and function names

## Testing

- Add tests for new features and bug fixes
- Ensure existing tests pass with your changes
- Test your changes in different environments if possible

## Documentation

- Update documentation for any new features or changes
- Use clear and concise language
- Include code examples where appropriate
- Keep the README and other documentation up to date

## Working on the Client SDK

The client SDK (in `apps/client`) is not yet implemented. If you're interested in contributing to this part of the project:

1. Familiarize yourself with the overall architecture described in the [logic documentation](logic.mdc)
2. Understand the flow between external developers, end users, and the Swiftgum platform
3. Review the existing codebase to understand the API endpoints and data structures
4. Discuss your implementation approach in an issue before starting work

## Database Changes

When making database changes:

1. Create migrations using Supabase CLI
2. Update types with `pnpm db:gentypes`
3. Verify changes with `pnpm db:checktypes`
4. Test migrations locally with `pnpm db:sync-local`

## Community

- Join our [Discord](https://discord.gg/adnqxUb8) to chat with the team
- Report bugs and request features through [GitHub Issues](https://github.com/Titou325/knowledgex/issues)
- For enterprise support and self-hosting inquiries, contact us at [support@swiftgum.com](mailto:support@swiftgum.com)

## License

By contributing to Swiftgum, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

Thank you for contributing to Swiftgum! Your efforts help make this project better for everyone.
