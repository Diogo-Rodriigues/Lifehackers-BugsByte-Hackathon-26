# Contributing to NutriFuel

First off, thank you for considering contributing to NutriFuel! It's people like you that make NutriFuel such a great tool for travelers around the world. 🌍

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guides](#style-guides)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Collaborative**: Work together towards common goals
- **Be Professional**: Keep discussions focused and constructive
- **Be Open-Minded**: Welcome different viewpoints and ideas

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0 or higher
- **pnpm** 8.0 or higher
- **Git** installed and configured
- A **GitHub account**
- An **OpenAI API key** for testing AI features

### Development Setup

1. **Fork the Repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/nutrifuel.git
   cd nutrifuel
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/original-owner/nutrifuel.git
   ```

4. **Install Dependencies**
   ```bash
   pnpm install
   ```

5. **Create Environment File**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your OpenAI API key
   ```

6. **Start Development Server**
   ```bash
   pnpm dev
   ```

7. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When submitting a bug report, include:**

- **Description**: Clear and concise description of the bug
- **Steps to Reproduce**: Detailed steps to reproduce the issue
  1. Go to '...'
  2. Click on '...'
  3. Scroll down to '...'
  4. See error
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable
- **Environment**:
  - OS: [e.g., macOS 14.0]
  - Browser: [e.g., Chrome 120]
  - Node.js version: [e.g., 20.10.0]
  - NutriFuel version: [e.g., 1.0.0]

**Bug Report Template:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS]
- Browser: [e.g., Chrome]
- Version: [e.g., 1.0.0]
```

### ✨ Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When suggesting an enhancement, include:**

- **Clear Title**: Use a descriptive title
- **Detailed Description**: Explain the enhancement in detail
- **Use Cases**: Describe how this would be useful
- **Alternative Solutions**: Have you considered any alternatives?
- **Additional Context**: Add any other context or screenshots

### 🌍 Adding New Destinations

Want to add a new country/destination? Great!

**Required Files/Changes:**

1. **Add to Constants** (`lib/constants.ts`):
   ```typescript
   export const DESTINATIONS = [
     // ...existing
     "New Country",
   ]
   
   export const DESTINATION_IMAGES: Record<string, number> = {
     "New Country": "https://unsplash.com/...",
   }
   
   export const TIMEZONE_OFFSETS: Record<string, number> = {
     "New Country": 0, // UTC offset
   }
   ```

2. **Add Nutritionist** (`components/onboarding.tsx`):
   ```typescript
   const NUTRITIONIST_BY_DESTINATION: Record<string, NutritionistProfile> = {
     "New Country": { 
       name: "Dr. Name", 
       photoUrl: "/nutritionists/new-country.png" 
     },
   }
   ```

3. **Add Nutritionist Image** (`public/nutritionists/`):
   - Add `new-country.png` (512x512px recommended)

4. **Add Meal Culture Data** (`lib/meal-culture.ts`):
   ```typescript
   // Add typical meal times and dishes
   ```

5. **Add Translations** (`lib/language.ts`):
   - Add country name in all supported languages

### 🌐 Adding Language Support

To add a new language:

1. **Update Language Type** (`lib/language.ts`):
   ```typescript
   export type Language = "en" | "pt" | "your-lang-code"
   ```

2. **Add to LANGUAGES Array**:
   ```typescript
   export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
     // ...existing
     { code: "your-lang-code", name: "Language Name", flag: "🏳" },
   ]
   ```

3. **Add Translations**:
   ```typescript
   const translations: Record<string, Record<Language, string>> = {
     keyName: {
       en: "English",
       pt: "Portuguese",
       "your-lang-code": "Translation",
     },
   }
   ```

4. **Test All UI Flows**: Ensure all strings are translated

### 📝 Improving Documentation

Documentation improvements are always welcome!

- Fix typos or grammatical errors
- Add missing information
- Improve clarity or structure
- Add examples or screenshots
- Update outdated information

---

## Development Process

### Branching Strategy

We use **Git Flow** for development:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes
- `docs/*`: Documentation updates

### Branch Naming

Use descriptive branch names:

```bash
# Features
feature/add-new-destination-portugal
feature/implement-meal-sharing

# Bug fixes
bugfix/fix-meal-logger-crash
bugfix/correct-macro-calculation

# Documentation
docs/update-api-documentation
docs/add-deployment-guide
```

### Testing Your Changes

Before submitting a PR:

1. **Run the Development Server**
   ```bash
   pnpm dev
   ```

2. **Test All Affected Features**
   - Walk through the user flow
   - Test edge cases
   - Verify mobile responsiveness
   - Check dark mode compatibility

3. **Check for TypeScript Errors**
   ```bash
   pnpm build
   ```

4. **Run Linter**
   ```bash
   pnpm lint
   ```

5. **Test on Multiple Browsers**
   - Chrome
   - Firefox
   - Safari
   - Mobile browsers

---

## Style Guides

### TypeScript Style Guide

**General Principles:**

- Use TypeScript for all new code
- Define interfaces for all props
- Use type inference when possible
- Avoid `any` type
- Use `const` for immutable variables

**Example:**

```typescript
// ✅ Good
interface MealProps {
  name: string
  calories: number
  protein: number
  onSelect?: () => void
}

export function Meal({ name, calories, protein, onSelect }: MealProps) {
  const total = calories + protein
  // ...
}

// ❌ Bad
export function Meal(props: any) {
  var total = props.calories + props.protein
  // ...
}
```

### React Component Style Guide

**Component Structure:**

```typescript
"use client" // Only if needed

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "@/lib/types"

interface MyComponentProps {
  title: string
  onAction?: () => void
  className?: string
}

export function MyComponent({ title, onAction, className }: MyComponentProps) {
  const [state, setState] = useState(false)
  
  const handleClick = () => {
    setState(true)
    onAction?.()
  }
  
  return (
    <div className={cn("base-classes", className)}>
      <h2>{title}</h2>
      <Button onClick={handleClick}>Action</Button>
    </div>
  )
}
```

**Component Guidelines:**

- One component per file (unless closely related)
- Use PascalCase for component names
- Use camelCase for functions and variables
- Export components as named exports
- Keep components focused and single-purpose
- Extract complex logic into custom hooks

### CSS/Tailwind Style Guide

**Use Tailwind Utilities:**

```tsx
// ✅ Good
<div className="flex items-center gap-4 rounded-lg bg-card p-4">

// ❌ Bad (avoid inline styles)
<div style={{ display: 'flex', gap: '16px' }}>
```

**Class Organization:**

```tsx
// Order: Layout → Spacing → Sizing → Colors → Typography → Effects
<div className="flex flex-col gap-4 w-full max-w-md rounded-lg bg-card p-6 text-foreground shadow-lg">
```

**Use `cn()` for Conditional Classes:**

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes",
  className
)} />
```

### File Naming

- **Components**: PascalCase → `MealLogger.tsx`
- **Utilities**: camelCase → `formatDate.ts`
- **Types**: PascalCase → `UserProfile.ts`
- **Constants**: UPPER_CASE → `API_KEYS.ts`

---

## Commit Messages

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI configuration changes

### Examples

```bash
# Feature
feat(onboarding): add Portugal as destination
feat(meal-logger): implement search functionality

# Bug fix
fix(dashboard): correct macro calculation for logged meals
fix(trip-planning): resolve timezone offset issue

# Documentation
docs(api): add endpoint documentation for meal analysis
docs(readme): update installation instructions

# Refactor
refactor(components): extract date picker to separate component
refactor(api): simplify meal plan generation logic

# Performance
perf(dashboard): optimize chart rendering
perf(images): implement lazy loading for meal photos
```

### Writing Good Commit Messages

- **Use the imperative mood**: "add" not "added"
- **Capitalize the subject line**
- **No period at the end of the subject**
- **Limit subject line to 50 characters**
- **Wrap body at 72 characters**
- **Explain what and why, not how**

---

## Pull Request Process

### Before Submitting

1. ✅ Update the README.md if needed
2. ✅ Update documentation
3. ✅ Add tests if applicable
4. ✅ Ensure all tests pass
5. ✅ Run linter and fix issues
6. ✅ Build succeeds locally
7. ✅ Rebase on latest `develop`

### Submitting a PR

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select `develop` as the base branch
   - Fill out the PR template

3. **PR Title Format**
   ```
   <type>: <description>
   ```
   
   Example: `feat: add meal sharing functionality`

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran to verify your changes.

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have checked my code and corrected any misspellings
```

### Review Process

1. **Automated Checks**:
   - Build succeeds
   - Linter passes
   - Type checking passes

2. **Code Review**:
   - At least one maintainer approval required
   - Address all review comments
   - Make requested changes

3. **Merge**:
   - Squash and merge into `develop`
   - Delete feature branch

---

## Recognition

Contributors will be:
- Added to the Contributors section
- Mentioned in release notes
- Recognized in the README

---

## Questions?

- Open an issue with the `question` label
- Contact the maintainers
- Check existing documentation

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to NutriFuel! 🙏
