<div align="center">
  <img src="./public/logo.png" alt="NutriFuel Logo" width="200"/>
  
  # NutriFuel
  
  **Your AI-Powered Nutrition Companion for Global Travel**
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.2.3-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
</div>

---

## 🌍 About NutriFuel

NutriFuel is an intelligent nutrition tracking application designed specifically for travelers. Whether you're exploring Tokyo's ramen shops, sampling tapas in Barcelona, or enjoying street food in Bangkok, NutriFuel helps you maintain your health goals while experiencing authentic local cuisine.

### ✨ Key Features

- **🎯 Smart Onboarding**: Personalized nutrition goals based on your profile, dietary restrictions, and preferences
- **🌐 Multi-Language Support**: English, Portuguese, and expanding
- **🍽️ Local Cuisine Discovery**: AI-powered recommendations for local dishes that match your dietary needs
- **📊 Real-Time Nutrition Tracking**: Monitor calories, macros, and water intake
- **✈️ Trip Planning**: Plan meals ahead with timezone-aware nutrition adjustments
- **📸 Meal Analysis**: Snap photos of your meals for instant nutrition analysis
- **🥗 Menu Scanner**: Analyze restaurant menus to find suitable options
- **🔄 Nutrium Integration**: Connect with Nutrium for professional nutrition plan sync
- **💧 Hydration Tracking**: Stay hydrated with smart water intake reminders
- **🌙 Dark Mode**: Beautiful light and dark themes

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0 or higher
- **pnpm**: 8.0 or higher (recommended) or npm/yarn
- **OpenAI API Key**: For AI-powered features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nutrifuel.git
   cd nutrifuel
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_DEFAULT_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
nutrifuel/
├── app/                       # Next.js app directory
│   ├── api/                   # API routes
│   │   ├── adapt-plan/        # Meal plan adaptation
│   │   ├── analyze-meal/      # Meal photo analysis
│   │   ├── analyze-menu/      # Menu scanning
│   │   ├── dishes/            # Local cuisine discovery
│   │   ├── dynamic-targets/   # Nutrition goal calculations
│   │   ├── meal-plan/         # Trip meal planning
│   │   ├── nutrition-goals/   # Goal estimation
│   │   └── nutrium/           # Nutrium integration
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main application page
├── components/                # React components
│   ├── ui/                    # shadcn/ui components
│   ├── bottom-nav.tsx         # Navigation bar
│   ├── dashboard.tsx          # Main dashboard
│   ├── meal-analysis.tsx      # Meal analyzer
│   ├── meal-logger.tsx        # Manual meal entry
│   ├── onboarding.tsx         # User onboarding flow
│   ├── settings-page.tsx      # Settings & profile
│   ├── splash-screen.tsx      # App splash screen
│   ├── trip-planning.tsx      # Trip planning interface
│   ├── trip-review.tsx        # Trip review screen
│   └── welcome-screen.tsx     # Welcome screen
├── lib/                       # Utility functions
│   ├── api.ts                 # API client
│   ├── constants.ts           # App constants
│   ├── language.ts            # i18n support
│   ├── meal-culture.ts        # Cultural meal data
│   ├── store.ts               # Local storage management
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Helper functions
├── public/                    # Static assets
│   ├── favicon_io/            # Favicons
│   ├── nutritionists/         # Nutritionist avatars
│   ├── logo.png               # App logo
│   └── nutrium-logo.png       # Nutrium logo
├── hooks/                     # Custom React hooks
└── docs/                      # Documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.1.6**: React framework with App Router
- **React 19.2.3**: UI library
- **TypeScript 5.7.3**: Type safety
- **Tailwind CSS 3.4.17**: Utility-first styling
- **shadcn/ui**: High-quality UI components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icons

### State Management
- **Local Storage**: Client-side data persistence
- **React Hooks**: Component state management

### AI & APIs
- **OpenAI GPT-4**: Meal analysis, menu scanning, and recommendations
- **Nutrium API**: Professional nutrition plan integration

### Utilities
- **date-fns**: Date manipulation
- **react-day-picker**: Calendar component
- **recharts**: Data visualization
- **sonner**: Toast notifications
- **next-themes**: Theme management

---

## 🎨 Features in Detail

### 1. Onboarding Flow
- **Personal Profile**: Age, sex, height, weight, and fitness goals
- **Allergies & Dietary Preferences**: Comprehensive allergen tracking with safety guardrails
- **Nutrition Method**: Choose between AI estimation or Nutrium sync
- **Trip Details**: Destination, dates, times, with timezone awareness

### 2. Trip Planning
- **Local Cuisine Discovery**: AI-curated local dishes filtered by your dietary needs
- **Meal Plan Generation**: Personalized itinerary for your entire trip
- **Nutritionist Review**: Professional tips from local nutrition experts
- **Caffeine Management**: Jet lag mitigation recommendations

### 3. Dashboard
- **Daily Overview**: Calories, macros, water intake at a glance
- **Interactive Charts**: Visual progress tracking
- **Meal Log**: Complete history of logged meals
- **Quick Actions**: Fast access to meal logging and analysis

### 4. Meal Analysis
- **Photo Analysis**: Take a picture, get instant nutrition breakdown
- **Menu Scanning**: Scan restaurant menus for suitable options
- **Manual Entry**: Traditional food diary with autocomplete

### 5. Multi-Language Support
Currently supported:
- 🇺🇸 English
- 🇵🇹 Portuguese

More languages coming soon!

---

## 🌐 Supported Destinations

NutriFuel currently supports nutrition guidance for 15 countries:

🇯🇵 Japan | 🇹🇭 Thailand | 🇲🇽 Mexico | 🇮🇹 Italy | 🇮🇳 India | 🇫🇷 France | 🇲🇦 Morocco | 🇵🇪 Peru | 🇰🇷 South Korea | 🇪🇸 Spain | 🇹🇷 Turkey | 🇻🇳 Vietnam | 🇬🇷 Greece | 🇧🇷 Brazil | 🇨🇴 Colombia

Each destination includes:
- Local nutritionist profiles
- Cultural meal recommendations
- Timezone-aware adjustments
- Popular local dishes

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_DEFAULT_API_KEY` | OpenAI API key for AI features | Yes |

---

## 🧪 Development

### Available Scripts

```bash
# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Code Quality

This project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** (recommended) for code formatting

---

## 🗺️ Roadmap

- [ ] Add more destination countries
- [ ] Implement cloud sync with user accounts
- [ ] Add social features (share meals, trips)
- [ ] Integrate with fitness trackers
- [ ] Add recipe suggestions
- [ ] Expand language support
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Export nutrition reports

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Nutrium** for nutrition plan integration
- **OpenAI** for GPT-4 API
- **Unsplash** for destination images
- **Lifehackers Team** for development

---

## 📞 Support

For support, questions, or feedback:
- Contact the LifeHackers team

---

## 🏆 Built For

This project was created for the **BugsByte 2026 Hackathon** by the **LifeHackers** team.

---

<div align="center">
  <p>Made with ❤️ for travelers who care about their health</p>
  <p>© 2026 LifeHackers Team. All rights reserved.</p>
</div>
