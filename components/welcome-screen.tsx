"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { saveApiKey, getApiKey } from "@/lib/store"
import { getLanguage, setLanguage, t, type Language, LANGUAGES } from "@/lib/language"
import { Key, ChevronRight, Sparkles, Upload } from "lucide-react"
import Image from "next/image"

interface WelcomeScreenProps {
  onStartFresh: () => void
  onPlanImported: () => void
}

export function WelcomeScreen({ onStartFresh, onPlanImported }: WelcomeScreenProps) {
  const [language, setLanguageState] = useState<Language>("en")
  const [apiKey, setApiKeyState] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLanguageState(getLanguage())
    setApiKeyState(getApiKey() || "")
  }, [])

  function persistApiKey() {
    if (apiKey.trim()) saveApiKey(apiKey.trim())
  }

  function handleStartFresh() {
    persistApiKey()
    onStartFresh()
  }

  function handlePlanUploadClick() {
    persistApiKey()
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
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-background via-primary/[0.03] to-primary/[0.08]">
      <div className="absolute right-6 top-6 z-10">
        <Select
          value={language}
          onValueChange={(value) => {
            setLanguage(value as Language)
            setLanguageState(value as Language)
          }}
        >
          <SelectTrigger className="h-8 w-[90px] border-0 bg-primary text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="cursor-pointer text-xs">
                {lang.code.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Image src="/logo.png" alt="NutriFuel" width={140} height={140} priority className="mb-6" />

        <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-primary italic sm:text-5xl">
          {t("welcome", language)}
        </h1>
        <p className="mb-10 text-center text-base font-medium text-muted-foreground">
          {t("howWouldYouLikeToBegin", language)}
        </p>

        <div className="flex w-full max-w-sm flex-col gap-5">
          <div className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
            <Label htmlFor="api-key-welcome" className="mb-2.5 flex items-center gap-2 text-sm font-semibold">
              <Key className="h-4 w-4 text-primary" />
              {t("apiKey", language)}
            </Label>
            <Input
              id="api-key-welcome"
              type="password"
              placeholder={t("apiKeyPlaceholder", language)}
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              className="mb-2 h-11"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">{t("apiKeyDescription", language)}</p>
          </div>

          <button
            onClick={handleStartFresh}
            className="group w-full cursor-pointer rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-primary/[0.12] p-5 text-left shadow-sm transition-all duration-300 hover:from-primary/[0.10] hover:to-primary/[0.18] hover:shadow-md"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground">{t("startFresh", language)}</span>
              <ChevronRight className="ml-auto h-5 w-5 text-primary opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("setUpProfile", language)}</p>
          </button>

          <button
            onClick={handlePlanUploadClick}
            disabled={isImporting}
            className="group w-full cursor-pointer rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/[0.08] to-secondary/[0.18] p-5 text-left shadow-sm transition-all duration-300 hover:from-secondary/[0.12] hover:to-secondary/[0.24] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <Upload className="h-5 w-5 text-secondary-foreground" />
              <span className="text-lg font-bold text-foreground">{t("haveNutritionistPlan", language)}</span>
              <ChevronRight className="ml-auto h-5 w-5 text-secondary-foreground opacity-70 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isImporting ? t("uploading", language) : t("uploadPlanDescription", language)}
            </p>
          </button>
        </div>

        <p className="mt-10 max-w-xs text-center text-xs leading-relaxed text-muted-foreground/70">
          {t("dontWorryAdjustLater", language)}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handlePlanUpload}
        />
      </div>
    </div>
  )
}
