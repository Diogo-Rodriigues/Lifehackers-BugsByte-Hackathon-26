"use client"

import { useState, useEffect } from "react"
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
import { Key, ChevronRight, Sparkles } from "lucide-react"
import Image from "next/image"

interface WelcomePageProps {
    onStart: () => void
}

export function WelcomePage({ onStart }: WelcomePageProps) {
    const [language, setLanguageState] = useState<Language>("en")
    const [apiKey, setApiKey_] = useState("")

    useEffect(() => {
        setLanguageState(getLanguage())
        setApiKey_(getApiKey() || "")
    }, [])

    function handleStart() {
        if (apiKey.trim()) {
            saveApiKey(apiKey.trim())
        }
        onStart()
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-primary/[0.03] to-primary/[0.08] relative">
            {/* Language Selector - Top Right */}
            <div className="absolute top-6 right-6 z-10">
                <Select
                    value={language}
                    onValueChange={(value) => {
                        setLanguage(value as Language)
                        setLanguageState(value as Language)
                    }}
                >
                    <SelectTrigger className="w-[90px] h-8 text-xs border-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm font-semibold">
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

            {/* Content */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                {/* Logo */}
                <Image src="/logo.png" alt="NutriFuel" width={140} height={140} priority className="mb-6" />

                {/* Welcome Title */}
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-2 tracking-tight italic">
                    {t("welcome", language)}
                </h1>
                <p className="text-base text-muted-foreground font-medium text-center mb-10">
                    {t("howToBegin", language)}
                </p>

                {/* Cards Section */}
                <div className="w-full max-w-sm flex flex-col gap-5">
                    {/* API Key Card */}
                    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 shadow-sm">
                        <Label htmlFor="api-key-welcome" className="flex items-center gap-2 text-sm font-semibold mb-2.5">
                            <Key className="h-4 w-4 text-primary" />
                            {t("apiKey", language)}
                        </Label>
                        <Input
                            id="api-key-welcome"
                            type="password"
                            placeholder={t("apiKeyPlaceholder", language)}
                            value={apiKey}
                            onChange={(e) => setApiKey_(e.target.value)}
                            className="h-11 mb-2"
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {t("apiKeyDescription", language)}
                        </p>
                    </div>

                    {/* Start Onboarding Card */}
                    <button
                        onClick={handleStart}
                        className="group w-full rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] to-primary/[0.12] hover:from-primary/[0.10] hover:to-primary/[0.18] p-5 shadow-sm hover:shadow-md transition-all duration-300 text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-lg font-bold text-foreground">
                                {t("startOnboarding", language)}
                            </span>
                            <ChevronRight className="h-5 w-5 text-primary ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("startOnboardingDesc", language)}
                        </p>
                    </button>
                </div>

                {/* Footer Note */}
                <p className="mt-10 text-xs text-muted-foreground/70 text-center max-w-xs leading-relaxed">
                    {t("welcomeFooter", language)}
                </p>
            </div>
        </div>
    )
}
