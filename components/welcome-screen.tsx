"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, ArrowRight, Globe } from "lucide-react"
import { saveProfile } from "@/lib/store"
import type { UserProfile } from "@/lib/types"
import { toast } from "sonner"
import { getLanguage, setLanguage, t, type Language, LANGUAGES } from "@/lib/language"

interface WelcomeScreenProps {
  onStartFresh: () => void
  onPlanImported: () => void
}

export function WelcomeScreen({ onStartFresh, onPlanImported }: WelcomeScreenProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [language, setLanguageState] = useState<Language>(getLanguage())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLanguageState(getLanguage())

    // Listen for language changes
    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>
      setLanguageState(customEvent.detail)
    }

    window.addEventListener('languageChanged', handleLanguageChange)

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [])

  function handleLanguageChange(lang: Language) {
    setLanguage(lang)
    setLanguageState(lang)
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        // Validate that it has the required profile structure
        if (!data.name || !data.age || !data.dailyCalorieTarget) {
          toast.error("Invalid plan format. Please check your file.")
          setIsUploading(false)
          return
        }

        // Create a complete profile with defaults for missing fields
        const profile: UserProfile = {
          name: data.name,
          age: data.age,
          sex: data.sex || "other",
          height: data.height || 170,
          weight: data.weight || 70,
          goal: data.goal || "maintain",
          allergies: data.allergies || [],
          dietaryPreferences: data.dietaryPreferences || [],
          dailyCalorieTarget: data.dailyCalorieTarget,
          macros: data.macros || { protein: 150, carbs: 200, fat: 65 },
          waterTarget: data.waterTarget || 2000,
          onboardingComplete: true,
        }

        saveProfile(profile)
        toast.success("Plan imported successfully!")
        
        // Small delay to show success message before transitioning
        setTimeout(() => {
          onPlanImported()
        }, 500)
      } catch (error) {
        console.error("Error parsing plan file:", error)
        toast.error("Failed to read plan file. Please ensure it's a valid JSON file.")
      } finally {
        setIsUploading(false)
      }
    }

    reader.onerror = () => {
      toast.error("Failed to read file.")
      setIsUploading(false)
    }

    reader.readAsText(file)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-primary/5 px-4">
      {/* Language Selector */}
      <div className="absolute top-6 right-6">
        <Select value={language} onValueChange={(value) => handleLanguageChange(value as Language)}>
          <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-sm border-primary/20">
            <Globe className="h-4 w-4 mr-2 text-primary" />
            <SelectValue className="text-sm">
              <span className="flex items-center gap-1.5">
                {LANGUAGES.find(l => l.code === language)?.flag} {language.toUpperCase()}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm min-w-[140px]">
            {LANGUAGES.map((lang) => (
              <SelectItem 
                key={lang.code} 
                value={lang.code}
                className="hover:bg-primary/10 text-sm data-[highlighted]:bg-primary/10 focus:bg-primary/10"
                style={{ padding: '4px 8px', minHeight: '28px', lineHeight: '20px' }}
              >
                <span className="inline-flex items-center gap-2">
                  {lang.flag} {lang.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl text-[#38b6ff]">{t('welcome', language)}</h1>
          <p className="text-base text-muted-foreground">
            {t('howWouldYouLikeToBegin', language)}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Start Fresh */}
          <Card className="border-2 border-primary/20 bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-lg cursor-pointer">
            <CardContent className="p-6">
              <button
                onClick={onStartFresh}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      {t('startFresh', language)}
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('setUpProfile', language)}
                    </p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Import Plan */}
          <Card className="border-2 border-primary/20 bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    {t('haveNutritionistPlan', language)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('uploadPlanDescription', language)}
                  </p>
                </div>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isUploading ? t('uploading', language) : t('uploadPlan', language)}
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground text-center">
                    {t('acceptsJsonFormat', language)}
                  </p>
                  <a
                    href="/sample-nutritionist-plan.json"
                    download
                    className="block text-xs text-primary hover:underline text-center"
                  >
                    {t('downloadSampleFormat', language)}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground">
          {t('dontWorryAdjustLater', language)}
        </p>
      </div>
    </div>
  )
}
