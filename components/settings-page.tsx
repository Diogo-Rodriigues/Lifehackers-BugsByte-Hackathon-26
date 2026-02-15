"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getProfile,
  saveProfile,
  getApiKey,
  saveApiKey,
} from "@/lib/store"
import type { UserProfile } from "@/lib/types"
import {
  Key,
  User,
  Shield,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTheme } from 'next-themes'
import { getLanguage, setLanguage, t, type Language, LANGUAGES } from "@/lib/language"

const ALLERGY_OPTIONS = [
  "Gluten",
  "Dairy",
  "Eggs",
  "Peanuts",
  "Tree Nuts",
  "Soy",
  "Fish",
  "Shellfish",
  "Wheat",
  "Sesame",
]

export function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [apiKey, setApiKeyState] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [language, setLanguageState] = useState<Language>('en')
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setProfile(getProfile())
    setApiKeyState(getApiKey())
    setLanguageState(getLanguage())
  }, [])

  function handleSaveApiKey() {
    saveApiKey(apiKey)
    toast.success(t('save', language) + " ✓")
  }

  function handleLanguageChange(lang: Language) {
    setLanguage(lang)
    setLanguageState(lang)
    const messages: Record<Language, string> = {
      en: 'Language updated',
      'pt-PT': 'Idioma atualizado',
      'pt-BR': 'Idioma atualizado',
      es: 'Idioma actualizado',
      fr: 'Langue mise à jour',
      de: 'Sprache aktualisiert',
      it: 'Lingua aggiornata',
      zh: '语言已更新',
      ja: '言語を更新しました'
    }
    toast.success(messages[lang])
  }

  function handleSaveProfile() {
    if (profile) {
      saveProfile(profile)
      toast.success(t('saveProfile', language) + " ✓")
    }
  }

  function toggleAllergy(allergy: string) {
    if (!profile) return
    const list = profile.allergies || []
    setProfile({
      ...profile,
      allergies: list.includes(allergy)
        ? list.filter((a) => a !== allergy)
        : [...list, allergy],
    })
  }

  function handleClearData() {
    if (typeof window !== "undefined") {
      localStorage.clear()
      toast.success(t('allDataCleared', language))
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  if (!profile) return null

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl text-[#38b6ff]">{t('settings', language)}</h1>

      {/* API Key */}
      <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              OpenAI API Key
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('apiKeyDescLong', language)}
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                className="pr-10"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showKey ? "Hide API key" : "Show API key"}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button
              onClick={handleSaveApiKey}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
          {apiKey && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">
                {t('keyConfigured', language)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t('profile', language)}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="s-name" className="text-sm">
                {t('name', language)}
              </Label>
              <Input
                id="s-name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="s-age" className="text-sm">
                {t('age', language)}
              </Label>
              <Input
                id="s-age"
                type="number"
                value={profile.age}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    age: parseInt(e.target.value) || 25,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="s-height" className="text-sm">
                {t('height', language)}
              </Label>
              <Input
                id="s-height"
                type="number"
                value={profile.height}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    height: parseInt(e.target.value) || 170,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="s-weight" className="text-sm">
                {t('weight', language)}
              </Label>
              <Input
                id="s-weight"
                type="number"
                value={profile.weight}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    weight: parseInt(e.target.value) || 70,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="s-cals" className="text-xs">
                {t('calTarget', language)}
              </Label>
              <Input
                id="s-cals"
                type="number"
                value={profile.dailyCalorieTarget}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    dailyCalorieTarget: parseInt(e.target.value) || 2000,
                  })
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-sm">{t('goal', language)}</Label>
            <Select
              value={profile.goal}
              onValueChange={(v) =>
                setProfile({
                  ...profile,
                  goal: v as "lose" | "maintain" | "gain",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">{t('loseWeight', language)}</SelectItem>
                <SelectItem value="maintain">{t('maintain', language)}</SelectItem>
                <SelectItem value="gain">{t('gainMuscle', language)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSaveProfile}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {t('saveProfile', language)}
          </Button>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <h2 className="text-base font-semibold text-foreground">
              {t('allergies', language)}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map((allergy) => {
              const active = profile.allergies?.includes(allergy)
              return (
                <Badge
                  key={allergy}
                  variant={active ? "destructive" : "outline"}
                  className={cn(
                    "cursor-pointer",
                    active
                      ? "bg-destructive text-destructive-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                  onClick={() => toggleAllergy(allergy)}
                >
                  {allergy}
                </Badge>
              )
            })}
          </div>
          <Button
            onClick={handleSaveProfile}
            variant="outline"
            size="sm"
            className="self-start"
          >
            {t('saveAllergies', language)}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-destructive/30 bg-card shadow-none hover:border-destructive/50 transition-all duration-200">
        <CardContent className="flex flex-col gap-4 p-5">
          <h2 className="text-base font-semibold text-destructive">
            {t('dangerZone', language)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('dangerZoneDescription', language)}
          </p>
          <Button
            onClick={handleClearData}
            variant="destructive"
            size="sm"
            className="self-start"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('clearAllData', language)}
          </Button>
        </CardContent>
      </Card>

      {/* Theme Toggle */}
      <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {t('theme', language)}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('themeDescription', language)}
          </p>
          <div className="flex gap-2 items-center">
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="transition-all duration-200 hover:scale-105"
            >
              {theme === 'dark' ? t('lightMode', language) : t('darkMode', language)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Language Selector */}
      <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              <path d="M2 12h20"/>
            </svg>
            <h2 className="text-lg font-semibold text-foreground">
              {t('language', language)}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('languageDescription', language)}
          </p>
          <Select value={language} onValueChange={(value) => handleLanguageChange(value as Language)}>
            <SelectTrigger className="w-full h-9 text-sm transition-all duration-200 shadow-sm hover:shadow border-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <SelectValue>
                {LANGUAGES.find(l => l.code === language)?.flag} {LANGUAGES.find(l => l.code === language)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="min-w-[200px]">
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="cursor-pointer text-sm">
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
