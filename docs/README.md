# NutriFuel Documentation

Welcome to the NutriFuel documentation! This directory contains comprehensive guides to help you understand, use, develop, and deploy NutriFuel.

---

## 📚 Documentation Index

### Getting Started
- **[README](../README.md)** - Project overview, quick start, and features
- **[Installation Guide](../README.md#getting-started)** - Set up your development environment

### For Developers
- **[API Documentation](./API.md)** - Complete API reference for all endpoints
- **[Component Documentation](./COMPONENTS.md)** - Detailed component guide and usage
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to NutriFuel
- **[Code Style Guide](./CONTRIBUTING.md#style-guides)** - Coding standards and best practices

### For DevOps
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to various platforms
- **[Environment Variables](./DEPLOYMENT.md#environment-variables)** - Configuration reference

---

## 🎯 Quick Navigation

### I want to...

**Understand the Project**
→ Start with [README](../README.md)

**Set Up Development Environment**
→ Follow [Installation Guide](../README.md#installation)

**Build a New Feature**
→ Read [Contributing Guide](./CONTRIBUTING.md) and [Component Docs](./COMPONENTS.md)

**Integrate with the API**
→ Check [API Documentation](./API.md)

**Deploy to Production**
→ Follow [Deployment Guide](./DEPLOYMENT.md)

**Add a New Destination**
→ See [Adding Destinations](./CONTRIBUTING.md#adding-new-destinations)

**Add Language Support**
→ See [Adding Languages](./CONTRIBUTING.md#adding-language-support)

**Report a Bug**
→ Follow [Bug Report Template](./CONTRIBUTING.md#reporting-bugs)

---

## 📖 Documentation Contents

### 1. API Documentation (`API.md`)

Complete reference for all API endpoints including:
- Nutrition goal estimation
- Local dish discovery
- Meal plan generation
- Meal and menu analysis
- Nutrium integration
- Request/response formats
- Error handling
- Authentication

**Topics Covered:**
- RESTful endpoints
- OpenAI integration
- Local storage API
- Security considerations
- Rate limiting
- Future enhancements

---

### 2. Component Documentation (`COMPONENTS.md`)

Detailed guide to all React components:
- Core application components
- UI component library
- Custom hooks
- Styling guidelines
- Accessibility standards
- Testing strategies

**Component Categories:**
- Onboarding flow
- Dashboard
- Meal tracking (logger, analysis)
- Trip planning and review
- Settings
- Navigation
- Utilities

---

### 3. Deployment Guide (`DEPLOYMENT.md`)

Platform-specific deployment instructions:
- Vercel (recommended)
- Netlify
- Docker
- AWS (Amplify & EC2)
- DigitalOcean
- Railway

**Additional Topics:**
- Environment configuration
- Pre-deployment checklist
- Post-deployment monitoring
- Continuous deployment
- Rollback strategies
- Scaling considerations
- Cost estimation

---

### 4. Contributing Guide (`CONTRIBUTING.md`)

Everything you need to contribute:
- Code of conduct
- Development setup
- How to contribute
- Bug reporting
- Feature suggestions
- Style guides
- Commit message format
- Pull request process

**Contribution Types:**
- Bug fixes
- New features
- Documentation improvements
- Adding destinations
- Adding languages
- Performance optimizations

---

## 🔍 Technical Overview

### Architecture

```
┌─────────────────────────────────────────────┐
│            Client (Browser)                  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │   React Components (Next.js App)     │  │
│  │  - Onboarding                        │  │
│  │  - Dashboard                         │  │
│  │  - Meal Tracking                     │  │
│  │  - Trip Planning                     │  │
│  └──────────────────────────────────────┘  │
│              ↓                              │
│  ┌──────────────────────────────────────┐  │
│  │   Local Storage (Browser)            │  │
│  │  - User Profile                      │  │
│  │  - Trips & Meal Plans                │  │
│  │  - Meal Log                          │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│         Next.js API Routes                   │
│                                             │
│  /api/nutrition-goals                       │
│  /api/dishes                                │
│  /api/meal-plan                             │
│  /api/analyze-meal                          │
│  /api/analyze-menu                          │
│  /api/dynamic-targets                       │
│  /api/adapt-plan                            │
│  /api/nutrium/*                             │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│        External Services                     │
│                                             │
│  - OpenAI GPT-4 (AI Analysis)               │
│  - Nutrium API (Nutrition Plans)            │
│  - Unsplash (Destination Images)            │
└─────────────────────────────────────────────┘
```

### Tech Stack Summary

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5.7
- Tailwind CSS 3.4
- shadcn/ui components

**Backend:**
- Next.js API Routes
- OpenAI GPT-4
- Nutrium API integration

**State:**
- React hooks
- Browser localStorage

**Build:**
- pnpm
- Turbopack (dev)
- Vercel (deployment)

---

## 🗂️ File Structure Reference

```
nutrifuel/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── ui/               # shadcn/ui library
│   └── *.tsx             # App components
├── lib/                  # Utilities & logic
│   ├── api.ts            # API client
│   ├── store.ts          # Local storage
│   ├── types.ts          # TypeScript types
│   └── *.ts              # Other utilities
├── public/               # Static assets
│   ├── nutritionists/    # Avatar images
│   └── logo.png          # App logo
├── docs/                 # Documentation
│   ├── API.md
│   ├── COMPONENTS.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
├── hooks/                # Custom hooks
├── .env.local            # Environment vars (gitignored)
├── .gitignore
├── package.json
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔗 External Resources

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### APIs
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Nutrium API Docs](https://nutrium.com/api)

### Tools
- [Vercel Platform](https://vercel.com/docs)
- [pnpm Documentation](https://pnpm.io)

---

## ❓ FAQ

### How do I add a new API endpoint?
1. Create a new folder in `app/api/`
2. Add a `route.ts` file
3. Implement POST/GET handlers
4. Document in [API.md](./API.md)

### How do I add a new component?
1. Create file in `components/`
2. Define TypeScript interface
3. Implement component
4. Export as named export
5. Document in [COMPONENTS.md](./COMPONENTS.md)

### How do I test the app locally?
```bash
pnpm dev
# Visit http://localhost:3000
```

### How do I build for production?
```bash
pnpm build
pnpm start
```

### Where are user data stored?
Currently in browser's `localStorage`. Future versions will support cloud sync.

### How do I add support for a new language?
See [Adding Language Support](./CONTRIBUTING.md#adding-language-support)

### How do I deploy the app?
Follow the [Deployment Guide](./DEPLOYMENT.md)

---

## 📝 Contributing to Documentation

Found an error or want to improve the docs?

1. All documentation is in Markdown
2. Follow the same style as existing docs
3. Submit a PR with your changes
4. Use clear, concise language
5. Add examples where helpful

---

## 📞 Getting Help

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions or share ideas
- **Email**: Contact the Lifehackers team

---

## 🔄 Documentation Updates

This documentation is maintained alongside the codebase. When making changes:

- Update relevant docs in the same PR
- Keep examples up-to-date
- Increment version numbers
- Update changelog

---

## ⚖️ License

This documentation is licensed under MIT License, same as the project.

---

<div align="center">
  <p>Made with ❤️ by the Lifehackers Team</p>
  <p>© 2026 NutriFuel. All rights reserved.</p>
</div>
