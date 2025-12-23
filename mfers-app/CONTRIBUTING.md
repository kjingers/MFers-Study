# Contributing to MFers Bible Study App

Thank you for your interest in contributing to the MFers Bible Study App! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## 📜 Code of Conduct

This project is meant to support Bible study and fellowship. Please be respectful and kind in all interactions.

- Be welcoming and inclusive
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

## 🚀 Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/mfers-study.git
   cd mfers-study/mfers-app
   ```
3. Add the upstream repository as a remote:
   ```bash
   git remote add upstream https://github.com/original-owner/mfers-study.git
   ```

## 🤝 How to Contribute

### Types of Contributions

- **Bug Fixes**: Fix issues reported in the issue tracker
- **Features**: Add new functionality (please discuss first)
- **Documentation**: Improve README, code comments, or wiki
- **Tests**: Add or improve test coverage
- **Translations**: Help translate the app to other languages

### Before You Start

1. Check existing issues and PRs to avoid duplicates
2. For new features, open an issue first to discuss
3. For bug fixes, check if there's an existing issue

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Installation

```bash
# Install frontend dependencies
npm install

# Install API dependencies
cd api && npm install && cd ..

# Copy environment file
cp .env.example .env
```

### Running Locally

```bash
# Start frontend dev server
npm run dev

# In a separate terminal, start API
cd api && npm start
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

## 📝 Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over type aliases for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

```typescript
// Good
interface VerseReference {
  book: string;
  chapter: number;
  verse: number;
}

// Avoid
type VR = { b: string; c: number; v: number };
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types with TypeScript

```tsx
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### File Organization

- One component per file
- Group related files in directories
- Use index.ts for exports
- Keep files under 500 lines

```
components/
├── verse-modal/
│   ├── index.ts          # Exports
│   ├── VerseModal.tsx    # Main component
│   ├── VerseDisplay.tsx  # Sub-component
│   └── types.ts          # Types for this module
```

### Styling

- Use Tailwind CSS utility classes
- Create reusable component classes for complex patterns
- Follow mobile-first responsive design
- Use semantic color variables

### Commits

- Use conventional commit messages:
  - `feat:` New features
  - `fix:` Bug fixes
  - `docs:` Documentation changes
  - `style:` Code style changes (formatting)
  - `refactor:` Code refactoring
  - `test:` Adding or updating tests
  - `chore:` Maintenance tasks

```bash
# Good commit messages
git commit -m "feat: add verse bookmarking functionality"
git commit -m "fix: resolve modal not closing on ESC key"
git commit -m "docs: update API documentation"
```

## 📬 Submitting Changes

### Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request on GitHub

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Tests pass locally
- [ ] New code has appropriate test coverage
- [ ] Documentation is updated if needed
- [ ] PR description explains the changes
- [ ] PR is linked to relevant issues

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, the PR will be merged

## 🐛 Reporting Issues

### Bug Reports

When reporting a bug, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: How to trigger the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, device type
6. **Screenshots**: If applicable

### Feature Requests

For feature requests, please include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives Considered**: Other approaches you've thought of
4. **Additional Context**: Mockups, examples, etc.

## 🙏 Thank You!

Your contributions help make this Bible study tool better for everyone. Thank you for taking the time to contribute!

If you have questions, feel free to open an issue or reach out to the maintainers.
