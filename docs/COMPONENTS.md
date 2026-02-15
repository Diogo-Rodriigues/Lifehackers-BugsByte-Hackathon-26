# Component Documentation

## Overview

NutriFuel is built with a modular component architecture using React and Next.js. All components are located in the `/components` directory.

---

## Core Components

### 1. Onboarding (`onboarding.tsx`)

Multi-step onboarding flow for new users.

**Steps:**
1. Language Selection
2. Personal Information (age, sex, height, weight, goal)
3. Allergies & Dietary Restrictions
4. Dietary Preferences
5. Trip Details (destination, dates, times)
6. Local Cuisine Discovery
7. Nutrition Goals Setup (Nutrium or AI estimation)
8. Meal Plan Generation
9. Nutritionist Review
10. Completion

**Props:**
```typescript
interface OnboardingProps {
  onComplete: () => void
  onBack?: () => void
  startAtStep?: number
  initialProfile?: Partial<UserProfile>
}
```

**Features:**
- Multi-language support (EN, PT-PT, PT-BR, ES, FR, DE, IT, ZH, JA)
- Custom allergy/diet options
- Timezone-aware trip planning
- Real-time validation
- Progress indicator
- Localized date/time formats per language

**Components Used:**
- `DatePicker`: Custom date picker with calendar
  - Localized date format display (MM/DD/YYYY for EN, DD/MM/YYYY for PT/ES/FR/IT, DD.MM.YYYY for DE, YYYY/MM/DD for ZH/JA)
  - Translated placeholders
- `TimePicker`: 12-hour time picker with AM/PM toggle
  - Translated placeholders including localized AM/PM indicators
- `Input`, `Select`, `Button` from shadcn/ui

---

### 2. Dashboard (`dashboard.tsx`)

Main application dashboard showing daily nutrition overview.

**Props:**
```typescript
interface DashboardProps {
  onNavigate: (page: PageId) => void
}
```

**Sections:**
- **Header**: Greeting, date, active trip indicator
- **Daily Stats**: Calories, protein, carbs, fat (circular progress rings)
- **Water Intake**: Hydration tracking with quick add buttons
- **Today's Meals**: Timeline of logged meals
- **Quick Actions**: Camera, manual entry, menu scan buttons

**State Management:**
- Loads profile from localStorage
- Updates in real-time when meals are logged
- Calculates remaining targets dynamically

---

### 3. Meal Logger (`meal-logger.tsx`)

Manual meal entry interface with search and autocomplete.

**Features:**
- **Tab Interface**: Recent meals, Search, Custom
- Recent meals from history
- Searchable meal database
- Custom meal creation
- Nutrition breakdown preview
- Portion size adjustment

**Props:**
```typescript
interface MealLoggerProps {
  onNavigate: (page: PageId) => void
  onMealLogged?: () => void
}
```

---

### 4. Meal Analysis (`meal-analysis.tsx`)

Photo-based meal analysis and menu scanning.

**Tabs:**
1. **Photo Analysis**: 
   - Camera/upload interface
   - AI-powered nutrition estimation
   - Detailed breakdown by ingredient

2. **Menu Scan**:
   - Restaurant menu photo upload
   - AI recommendations based on goals
   - Allergen warnings
   - Nutrition estimates

**Props:**
```typescript
interface MealAnalysisProps {
  onNavigate: (page: PageId) => void
}
```

**State:**
```typescript
{
  activeTab: 'photo' | 'menu'
  analyzing: boolean
  selectedImage: string | null
  analysis: MealAnalysis | null
}
```

---

### 5. Trip Planning (`trip-planning.tsx`)

Trip creation and management interface.

**Features:**
- New trip creation
- Active trip display
- Past trips history
- Edit/delete trip actions
- Quick trip setup shortcut

**Props:**
```typescript
interface TripPlanningProps {
  onNavigate: (page: PageId) => void
  onTripCreated?: (tripId: string) => void
}
```

---

### 6. Trip Review (`trip-review.tsx`)

Detailed view of generated meal plan with nutritionist insights.

**Sections:**
- Destination header with image
- Day-by-day meal itinerary
- Nutritionist profile and tips
- Caffeine recommendations for jet lag
- Total nutrition summary

**Props:**
```typescript
interface TripReviewProps {
  planId: string
  onBack: () => void
}
```

---

### 7. Settings Page (`settings-page.tsx`)

User settings and profile management.

**Sections:**
- **Profile**: Name, age, physical stats
- **Goals**: Weight goal, activity level
- **Nutrition Targets**: Calories, macros, water
- **Allergies**: Manage allergen list
- **Dietary Preferences**: Manage diet types
- **Language**: Switch between EN/PT
- **Theme**: Light/Dark mode toggle
- **Data Management**: Export data, clear data

**Props:**
```typescript
interface SettingsPageProps {
  onNavigate: (page: PageId) => void
}
```

---

### 8. Bottom Navigation (`bottom-nav.tsx`)

Main navigation bar with 5 routes.

**Pages:**
- 🏠 Dashboard
- 📊 Analysis
- ➕ Logger
- ✈️ Planning
- ⚙️ Settings

**Props:**
```typescript
interface BottomNavProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

type PageId = 'dashboard' | 'analysis' | 'logger' | 'planning' | 'settings'
```

**Features:**
- Active page indicator
- Icon-based navigation
- Responsive design
- Safe area padding for mobile

---

### 9. Progress Ring (`progress-ring.tsx`)

Circular progress indicator for nutrition tracking.

**Props:**
```typescript
interface ProgressRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  unit?: string
  showPercentage?: boolean
}
```

**Usage:**
```tsx
<ProgressRing 
  value={1200} 
  max={2200} 
  size={120} 
  color="hsl(170, 98%, 26%)"
  label="Calories"
  unit="kcal"
/>
```

---

### 10. Welcome Screen (`welcome-screen.tsx`)

Initial splash screen shown on first launch.

**Features:**
- App branding/logo
- Feature highlights
- "Get Started" CTA
- Smooth fade-in animation

---

### 11. Splash Screen (`splash-screen.tsx`)

Loading screen shown during app initialization.

**Features:**
- Logo animation
- Loading indicator
- Auto-dismiss after mount

---

## UI Components (`components/ui/`)

Powered by **shadcn/ui** - a collection of reusable components built with Radix UI and Tailwind CSS.

### Form Components
- `input.tsx`: Text inputs with variants
- `textarea.tsx`: Multi-line text input
- `select.tsx`: Dropdown selection
- `label.tsx`: Form labels
- `button.tsx`: Buttons with variants
- `checkbox.tsx`: Checkboxes
- `switch.tsx`: Toggle switches
- `slider.tsx`: Range sliders

### Layout Components
- `card.tsx`: Container cards
- `separator.tsx`: Dividers
- `tabs.tsx`: Tab interface
- `accordion.tsx`: Collapsible sections
- `dialog.tsx`: Modal dialogs
- `sheet.tsx`: Side panels
- `popover.tsx`: Popup containers

### Feedback Components
- `toast.tsx` / `sonner.tsx`: Toast notifications
- `alert.tsx`: Alert messages
- `badge.tsx`: Status badges
- `progress.tsx`: Progress bars

### Data Display
- `table.tsx`: Data tables
- `calendar.tsx`: Date picker calendar

### Navigation
- `navigation-menu.tsx`: Menu components
- `dropdown-menu.tsx`: Dropdown menus

---

## Custom Hooks

### `use-mobile.tsx`

Detects mobile viewport.

```typescript
const isMobile = useMobile()
```

### `use-toast.ts`

Toast notification hook.

```typescript
const { toast } = useToast()

toast({
  title: "Success",
  description: "Meal logged successfully"
})
```

---

## Styling Guidelines

### Tailwind Classes
- Use semantic color tokens: `bg-background`, `text-foreground`, `border-border`
- Responsive: `sm:`, `md:`, `lg:` breakpoints
- Dark mode: Automatically handled via theme tokens

### Component Patterns
```typescript
// Consistent class merging
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  className
)} />
```

---

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader compatibility
- Color contrast compliance

---

## Testing

Component testing guidelines:
1. Test user interactions
2. Verify accessibility
3. Check responsive behavior
4. Validate error states
5. Test with real data

---

## Best Practices

1. **Type Safety**: All components use TypeScript interfaces
2. **Prop Validation**: Required vs optional props clearly defined
3. **Error Boundaries**: Wrap async operations in try-catch
4. **Loading States**: Show spinners during API calls
5. **Optimistic UI**: Update UI before API confirmation when appropriate
6. **Memoization**: Use `useMemo` and `useCallback` for expensive operations

---

## Future Improvements

- [ ] Add Storybook for component documentation
- [ ] Implement unit tests with Jest/React Testing Library
- [ ] Add E2E tests with Cypress/Playwright
- [ ] Create component variants guide
- [ ] Add animation documentation
