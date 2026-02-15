"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getLanguage, setLanguage, t, type Language, LANGUAGES } from "@/lib/language"
import { ArrowRight, Upload, Globe } from "lucide-react"

interface WelcomeScreenProps {
  onStartFresh: () => void
  onPlanImported: () => void
}

export function WelcomeScreen({ onStartFresh, onPlanImported }: WelcomeScreenProps) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLanguageState(getLanguage())
  }, [])

  function handlePlanUploadClick() {
    fileInputRef.current?.click()
  }

  async function handlePlanUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      await file.text()
      onPlanImported()
    } finally {
      setIsImporting(false)
      event.target.value = ""
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-primary/5 px-4">
      <div className="absolute right-6 top-6 z-10">
        <Select
          value={language}
          onValueChange={(value) => {
            setLanguage(value as Language)
            setLanguageState(value as Language)
          }}
        >
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
                className="hover:bg-primary/10 text-sm data-[highlighted]:bg-primary/10 focus:bg-primary/10 !pl-2 [&>span:first-child]:hidden"
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
          <h1 className="font-display text-4xl text-[#38b6ff]">
            {t("welcome", language)}
          </h1>
          <p className="text-base text-muted-foreground">
            {t("howWouldYouLikeToBegin", language)}
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
                      {t("startFresh", language)}
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </h2>
                    <p className="text-sm text-muted-foreground">{t("setUpProfile", language)}</p>
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
                    {t("haveNutritionistPlan", language)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isImporting ? t("uploading", language) : t("uploadPlanDescription", language)}
                  </p>
                </div>

                <Button
                  onClick={handlePlanUploadClick}
                  disabled={isImporting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isImporting ? t("uploading", language) : t("uploadPlan", language)}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handlePlanUpload}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground">
          {t("dontWorryAdjustLater", language)}
        </p>
      </div>
    </div>
  )
}
