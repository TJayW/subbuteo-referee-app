# Contributing to Subbuteo Referee System

## Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/subbuteo-referee-app.git
   cd subbuteo-referee-app
   npm install
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation if needed
   - Run checks locally:
     ```bash
     npm run typecheck
     npm test
     npm run build
     ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   Use conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `refactor:` code refactoring
   - `test:` test additions/changes
   - `chore:` maintenance tasks

5. **Push & Open PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Open a Pull Request on GitHub with a clear description.

## Code Standards

- **TypeScript:** Strict mode enabled
- **Testing:** Vitest for unit/component tests
- **Linting:** ESLint (run `npm run lint`)
- **Architecture:** See `docs/spec.md` Section 11

## Project Structure

See `docs/spec.md` Section 11.2 for complete architecture.

**Key principles:**
- Centralized cross-cutting concerns (hooks, utils, types, constants in top-level folders)
- Domain logic isolated from UI
- Feature modules own their UI coordination

## Pull Request Process

1. Ensure all checks pass (CI will verify)
2. Update documentation if you change APIs
3. Add tests for new functionality
4. Maintain backward compatibility
5. Get at least one approval before merging

## Questions?

Open an issue or discussion on GitHub.
