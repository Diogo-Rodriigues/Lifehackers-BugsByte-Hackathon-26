"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getProfile, addMealToLog, todayString, generateId, getActiveTrip, getDailyLog, saveDailyLog } from "@/lib/store"
import { apiFetch } from "@/lib/api"
import type { AnalysisResult, MealLog, DailyLog } from "@/lib/types"
import {
  Camera,
  Upload,
  Loader2,
  AlertTriangle,
  Plus,
  ImageIcon,
  Menu,
  UtensilsCrossed,
  CheckCircle,
  Edit,
  Droplets,
  Footprints,
  Activity,
  Trash2,
  Minus,
  FileImage,
  PencilLine,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getLanguage, t, type Language } from "@/lib/language"

export function MealAnalysis() {
  const today = todayString()
  const [analysisMode, setAnalysisMode] = useState<"meal" | "menu" | "manual">("meal")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [dishName, setDishName] = useState<string>("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [menuItems, setMenuItems] = useState<AnalysisResult[]>([])
  const [selectedMenuItems, setSelectedMenuItems] = useState<Set<number>>(new Set())
  const [mealType, setMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("lunch")
  const mealFileInputRef = useRef<HTMLInputElement>(null)
  const menuFileInputRef = useRef<HTMLInputElement>(null)
  const profile = getProfile()
  const [lang, setLang] = useState<Language>(getLanguage())

  // Manual entry states
  const [dailyLog, setDailyLog] = useState<DailyLog>(getDailyLog(today))
  const [showMealForm, setShowMealForm] = useState(false)
  const [mealForm, setMealForm] = useState({
    name: "",
    type: "lunch" as "breakfast" | "lunch" | "dinner" | "snack",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    notes: "",
  })

  // Reload daily log when date changes
  useEffect(() => {
    setDailyLog(getDailyLog(today))
  }, [today])

  // Reload daily log when switching to manual mode
  useEffect(() => {
    if (analysisMode === "manual") {
      setDailyLog(getDailyLog(today))
    }
  }, [analysisMode, today])

  // Listen for language changes
  useEffect(() => {
    setLang(getLanguage())

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>
      setLang(customEvent.detail)
    }

    window.addEventListener('languageChanged', handleLanguageChange)

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange)
    }
  }, [])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Prevent file selection if already analyzing
    if (analyzing) {
      toast.error(t('pleaseWaitAnalysis', lang))
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
      // Extract base64 from data URL
      const base64 = dataUrl.split(",")[1]
      setImageBase64(base64)
      setResult(null)
      setDishName("") // Reset dish name when new photo is selected
    }
    reader.onerror = () => {
      toast.error(t('failedToReadImage', lang))
    }
    reader.readAsDataURL(file)
  }

  async function analyzePhoto() {
    if (!imageBase64) return
    setAnalyzing(true)
    try {
      const activeTrip = getActiveTrip()
      const res = await apiFetch("/api/analyze-meal", {
        image: imageBase64,
        allergies: profile?.allergies || [],
        dishName: dishName.trim() || undefined,
        destination: activeTrip?.destination || undefined,
      })
      if (!res.ok) throw new Error("Analysis failed")
      const data = await res.json()
      setResult(data.analysis)

      // Check allergen warnings
      if (data.analysis.allergenWarnings?.length > 0) {
        toast.warning(
          `${t('allergenDetected', lang)}: ${data.analysis.allergenWarnings.join(", ")}`
        )
      }
    } catch {
      toast.error(
        t('couldNotAnalyze', lang)
      )
    } finally {
      setAnalyzing(false)
    }
  }

  async function analyzeMenu() {
    if (!imageBase64) return
    setAnalyzing(true)
    try {
      const activeTrip = getActiveTrip()
      const res = await apiFetch("/api/analyze-menu", {
        image: imageBase64,
        allergies: profile?.allergies || [],
        destination: activeTrip?.destination || undefined,
      })
      if (!res.ok) throw new Error("Menu analysis failed")
      const data = await res.json()
      setMenuItems(data.items || [])
      setSelectedMenuItems(new Set())

      if (data.items?.length === 0) {
        toast.error(t('couldNotAnalyze', lang))
      }
    } catch {
      toast.error(t('couldNotAnalyze', lang))
    } finally {
      setAnalyzing(false)
    }
  }

  function logMealFromAnalysis() {
    if (!result) return
    const now = new Date()
    const meal: MealLog = {
      id: generateId(),
      date: todayString(),
      time: `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      type: mealType,
      name: result.name,
      photoUrl: imagePreview || undefined,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      ingredients: result.ingredients,
      allergenWarnings: result.allergenWarnings,
      notes: "",
      isOffPlan: false,
    }
    addMealToLog(todayString(), meal)
    toast.success(t('mealLoggedSuccess', lang))
    // Reset
    setImagePreview(null)
    setImageBase64(null)
    setResult(null)
    setDishName("")
  }

  function logSelectedMenuItems() {
    if (selectedMenuItems.size === 0) return
    const now = new Date()
    const date = todayString()

    selectedMenuItems.forEach((index) => {
      const item = menuItems[index]
      if (!item) return

      const meal: MealLog = {
        id: generateId(),
        date,
        time: `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
        type: mealType,
        name: item.name,
        photoUrl: imagePreview || undefined,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        ingredients: item.ingredients,
        allergenWarnings: item.allergenWarnings,
        notes: "From menu",
        isOffPlan: false,
      }
      addMealToLog(date, meal)
    })

    toast.success(`${selectedMenuItems.size} ${t('meals', lang).toLowerCase()} ${t('logged', lang)}`)
    // Reset
    setImagePreview(null)
    setImageBase64(null)
    setMenuItems([])
    setSelectedMenuItems(new Set())
  }

  // Manual entry functions
  function handleAddMeal() {
    if (!mealForm.name.trim()) {
      toast.error(t('pleaseEnterMealName', lang))
      return
    }

    // Validate numeric values
    const calories = parseInt(mealForm.calories) || 0
    const protein = parseInt(mealForm.protein) || 0
    const carbs = parseInt(mealForm.carbs) || 0
    const fat = parseInt(mealForm.fat) || 0

    if (calories < 0 || protein < 0 || carbs < 0 || fat < 0) {
      toast.error(t('negativeValuesError', lang))
      return
    }

    const now = new Date()
    const meal: MealLog = {
      id: generateId(),
      date: today,
      time: `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      type: mealForm.type,
      name: mealForm.name.trim(),
      calories,
      protein,
      carbs,
      fat,
      ingredients: [],
      allergenWarnings: [],
      notes: mealForm.notes.trim(),
      isOffPlan: false,
    }
    const updated = addMealToLog(today, meal)
    setDailyLog(updated)
    setMealForm({
      name: "",
      type: "lunch",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      notes: "",
    })
    setShowMealForm(false)
    toast.success(t('mealLogged', lang))
  }

  function removeMeal(mealId: string) {
    const updated = {
      ...dailyLog,
      meals: dailyLog.meals.filter((m) => m.id !== mealId),
    }
    saveDailyLog(updated)
    setDailyLog(updated)
    toast.success(t('mealRemoved', lang))
  }

  function updateWater(amount: number) {
    const updated = {
      ...dailyLog,
      waterIntake: Math.max(0, dailyLog.waterIntake + amount),
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  function updateSteps(value: string) {
    const updated = {
      ...dailyLog,
      steps: parseInt(value) || 0,
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  function updateActivity(
    level: "sedentary" | "light" | "moderate" | "active"
  ) {
    const updated = {
      ...dailyLog,
      activityLevel: level,
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  function updateNotes(notes: string) {
    const updated = {
      ...dailyLog,
      activityNotes: notes,
    }
    saveDailyLog(updated)
    setDailyLog(updated)
  }

  const waterPercent = profile
    ? Math.min(100, (dailyLog.waterIntake / profile.waterTarget) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <h1 className="font-display text-2xl text-[#38b6ff]">{t('addEntry', lang)}</h1>
      <p className="text-sm text-muted-foreground">
        {t('addEntryDesc', lang)}
      </p>

      {/* Analysis Mode Tabs */}
      <Tabs value={analysisMode} onValueChange={(v) => {
        setAnalysisMode(v as "meal" | "menu" | "manual")
        // Reset state when changing modes
        if (v !== "manual") {
          setImagePreview(null)
          setImageBase64(null)
          setResult(null)
          setMenuItems([])
          setSelectedMenuItems(new Set())
          setDishName("")
          setAnalyzing(false)
        } else {
          // Reset form when entering manual mode
          setShowMealForm(false)
          setMealForm({
            name: "",
            type: "lunch",
            calories: "",
            protein: "",
            carbs: "",
            fat: "",
            notes: "",
          })
        }
      }}>
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="meal" className="flex items-center justify-center text-xs sm:text-sm">
            <span className="whitespace-nowrap">{t('mealPhoto', lang)}</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center justify-center text-xs sm:text-sm">
            <span className="whitespace-nowrap">{t('menuPhoto', lang)}</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center justify-center text-xs sm:text-sm">
            <span className="whitespace-nowrap">{t('manualEntry', lang)}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meal" className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground">{t('mealPhotoDesc', lang)}</p>
          {renderMealPhotoAnalysis()}
        </TabsContent>

        <TabsContent value="menu" className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground">{t('menuPhotoDesc', lang)}</p>
          {renderMenuPhotoAnalysis()}
        </TabsContent>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <p className="text-xs text-muted-foreground">{t('manualEntryDesc', lang)}</p>
          {renderManualEntry()}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderMealPhotoAnalysis() {
    return (
      <>
        {/* Photo Upload Area */}
        {!imagePreview ? (
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5 shadow-none">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {t('captureOrUpload', lang)}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => mealFileInputRef.current?.click()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {t('camera', lang)}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => mealFileInputRef.current?.click()}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('uploadPhoto', lang)}
                </Button>
              </div>
              <input
                ref={mealFileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload meal photo"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Image Preview */}
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="relative aspect-video w-full">
                <img
                  src={imagePreview}
                  alt="Meal photo preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </Card>

            {/* Dish Name Input */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dishName" className="text-sm">
                {t('dishName', lang)} <span className="text-xs text-muted-foreground">{t('dishNameOptional', lang)}</span>
              </Label>
              <Input
                id="dishName"
                placeholder={t('dishNamePlaceholder', lang)}
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="text-sm"
              />
              {dishName.trim() && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>✓</span> {t('improvesAccuracy', lang)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setImagePreview(null)
                  setImageBase64(null)
                  setResult(null)
                  setDishName("")
                }}
                className="flex-1"
              >
                {t('retake', lang)}
              </Button>
              <Button
                onClick={analyzePhoto}
                disabled={analyzing}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('analyzing', lang)}
                  </>
                ) : (
                  t('analyzeMeal', lang)
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Analysis Result */}
        {result && (
          <Card className="border-0 bg-card shadow-sm">
            <CardContent className="p-4">
              <h3 className="mb-3 text-base font-semibold text-foreground">
                {result.name}
              </h3>

              {/* Allergen Warnings */}
              {result.allergenWarnings.length > 0 && (
                <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-xs font-medium text-destructive">
                      {t('allergenWarning', lang)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('contains', lang)}: {result.allergenWarnings.join(", ")}
                  </p>
                </div>
              )}

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="rounded-lg bg-muted p-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {result.calories}
                  </p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {result.protein}g
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t('protein', lang)}</p>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {result.carbs}g
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t('carbs', lang)}</p>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-center">
                  <p className="text-lg font-bold text-foreground">
                    {result.fat}g
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t('fat', lang)}</p>
                </div>
              </div>

              {/* Ingredients */}
              {result.ingredients.length > 0 && (
                <div className="mb-4">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    {t('detectedIngredients', lang)}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground whitespace-nowrap"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(result.confidence || 0.8) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round((result.confidence || 0.8) * 100)}% {t('confidence', lang)}
                </span>
              </div>

              {/* Log Action */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>{t('mealType', lang)}</Label>
                  <Select value={mealType} onValueChange={(v) => setMealType(v as typeof mealType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">{t('breakfast', lang)}</SelectItem>
                      <SelectItem value="lunch">{t('lunch', lang)}</SelectItem>
                      <SelectItem value="dinner">{t('dinner', lang)}</SelectItem>
                      <SelectItem value="snack">{t('snack', lang)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={logMealFromAnalysis}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('logThisMeal', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </>
    )
  }

  function renderMenuPhotoAnalysis() {
    return (
      <>
        {/* Menu Photo Upload Area */}
        {!imagePreview ? (
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5 shadow-none">
            <CardContent className="flex flex-col items-center gap-4 p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Menu className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {t('captureOrUpload', lang)}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => menuFileInputRef.current?.click()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {t('camera', lang)}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => menuFileInputRef.current?.click()}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('uploadPhoto', lang)}
                </Button>
              </div>
              <input
                ref={menuFileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload menu photo"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Menu Image Preview */}
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="relative aspect-video w-full">
                <img
                  src={imagePreview}
                  alt="Menu photo preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setImagePreview(null)
                  setImageBase64(null)
                  setMenuItems([])
                  setSelectedMenuItems(new Set())
                }}
                className="flex-1"
              >
                {t('retake', lang)}
              </Button>
              <Button
                onClick={analyzeMenu}
                disabled={analyzing}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('analyzing', lang)}
                  </>
                ) : (
                  t('analyzeMeal', lang)
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Menu Items Result */}
        {menuItems.length > 0 && (
          <Card className="border-0 bg-card shadow-sm">
            <CardContent className="p-4">
              <h3 className="mb-3 text-base font-semibold text-foreground">
                {t('menuDetected', lang)} ({menuItems.length})
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {t('selectItemsToLog', lang)}
              </p>

              {/* Menu Items List */}
              <div className="space-y-3 mb-4">
                {menuItems.map((item, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all ${selectedMenuItems.has(index)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                      }`}
                    onClick={() => {
                      const newSelected = new Set(selectedMenuItems)
                      if (newSelected.has(index)) {
                        newSelected.delete(index)
                      } else {
                        newSelected.add(index)
                      }
                      setSelectedMenuItems(newSelected)
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            {item.name}
                            {selectedMenuItems.has(index) && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </h4>

                          {/* Allergen Warnings */}
                          {item.allergenWarnings.length > 0 && (
                            <div className="mt-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                              <span className="text-xs text-destructive">
                                {item.allergenWarnings.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Macros */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        <div className="rounded bg-muted p-1.5 text-center">
                          <p className="text-sm font-bold text-foreground">{item.calories}</p>
                          <p className="text-[9px] text-muted-foreground">kcal</p>
                        </div>
                        <div className="rounded bg-muted p-1.5 text-center">
                          <p className="text-sm font-bold text-foreground">{item.protein}g</p>
                          <p className="text-[9px] text-muted-foreground">{t('protein', lang)}</p>
                        </div>
                        <div className="rounded bg-muted p-1.5 text-center">
                          <p className="text-sm font-bold text-foreground">{item.carbs}g</p>
                          <p className="text-[9px] text-muted-foreground">{t('carbs', lang)}</p>
                        </div>
                        <div className="rounded bg-muted p-1.5 text-center">
                          <p className="text-sm font-bold text-foreground">{item.fat}g</p>
                          <p className="text-[9px] text-muted-foreground">{t('fat', lang)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Log Action */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>{t('mealType', lang)}</Label>
                  <Select value={mealType} onValueChange={(v) => setMealType(v as typeof mealType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">{t('breakfast', lang)}</SelectItem>
                      <SelectItem value="lunch">{t('lunch', lang)}</SelectItem>
                      <SelectItem value="dinner">{t('dinner', lang)}</SelectItem>
                      <SelectItem value="snack">{t('snack', lang)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={logSelectedMenuItems}
                  disabled={selectedMenuItems.size === 0}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('logThisMeal', lang)} ({selectedMenuItems.size})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </>
    )
  }

  function renderManualEntry() {
    return (
      <Tabs defaultValue="meals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="meals" className="data-[state=active]:bg-card data-[state=active]:text-foreground">{t('meals', lang)}</TabsTrigger>
          <TabsTrigger value="water" className="data-[state=active]:bg-card data-[state=active]:text-foreground">{t('water', lang)}</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-card data-[state=active]:text-foreground">{t('activity', lang)}</TabsTrigger>
        </TabsList>

        {/* Meals Tab */}
        <TabsContent value="meals" className="mt-4 flex flex-col gap-4">
        {/* Logged Meals */}
        {dailyLog.meals.length > 0 && (
          <div className="flex flex-col gap-2">
            {dailyLog.meals.map((meal) => (
              <Card key={meal.id} className="border-0 bg-card shadow-sm">
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {meal.name}
                    </span>
                    <span className="text-xs capitalize text-muted-foreground">
                      {meal.type} - {meal.time}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {meal.calories} kcal | P: {meal.protein}g | C:{" "}
                      {meal.carbs}g | F: {meal.fat}g
                    </span>
                  </div>
                  <button
                    onClick={() => removeMeal(meal.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label={`Remove ${meal.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Meal Form */}
        {showMealForm ? (
          <Card className="border border-primary/20 bg-card shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4">
              <h3 className="text-base font-semibold text-foreground">
                {t('addManualMeal', lang)}
              </h3>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="meal-name">{t('mealName', lang)}</Label>
                <Input
                  id="meal-name"
                  placeholder="e.g. Grilled Chicken Salad"
                  value={mealForm.name}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, name: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t('mealType', lang)}</Label>
                <Select
                  value={mealForm.type}
                  onValueChange={(v) =>
                    setMealForm({
                      ...mealForm,
                      type: v as typeof mealForm.type,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">{t('breakfast', lang)}</SelectItem>
                    <SelectItem value="lunch">{t('lunch', lang)}</SelectItem>
                    <SelectItem value="dinner">{t('dinner', lang)}</SelectItem>
                    <SelectItem value="snack">{t('snack', lang)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meal-cal">{t('calories', lang)}</Label>
                  <Input
                    id="meal-cal"
                    type="number"
                    placeholder="kcal"
                    value={mealForm.calories}
                    onChange={(e) =>
                      setMealForm({ ...mealForm, calories: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meal-prot">{t('protein', lang)} (g)</Label>
                  <Input
                    id="meal-prot"
                    type="number"
                    placeholder="g"
                    value={mealForm.protein}
                    onChange={(e) =>
                      setMealForm({ ...mealForm, protein: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meal-carbs">{t('carbs', lang)} (g)</Label>
                  <Input
                    id="meal-carbs"
                    type="number"
                    placeholder="g"
                    value={mealForm.carbs}
                    onChange={(e) =>
                      setMealForm({ ...mealForm, carbs: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meal-fat">{t('fat', lang)} (g)</Label>
                  <Input
                    id="meal-fat"
                    type="number"
                    placeholder="g"
                    value={mealForm.fat}
                    onChange={(e) =>
                      setMealForm({ ...mealForm, fat: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="meal-notes">{t('notes', lang)}</Label>
                <Textarea
                  id="meal-notes"
                  placeholder="Any notes about this meal"
                  value={mealForm.notes}
                  onChange={(e) =>
                    setMealForm({ ...mealForm, notes: e.target.value })
                  }
                  className="min-h-[60px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMealForm(false)}
                  className="flex-1"
                >
                  {t('cancel', lang)}
                </Button>
                <Button
                  onClick={handleAddMeal}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t('addMeal', lang)}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={() => setShowMealForm(true)}
            variant="outline"
            className="border-dashed border-primary/30 text-primary hover:bg-primary/5"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('addMealManually', lang)}
          </Button>
        )}
        </TabsContent>

        {/* Water Tab */}
        <TabsContent value="water" className="mt-4 flex flex-col gap-4">
          <Card className="border-0 bg-card shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <Droplets className="h-12 w-12 text-secondary" />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">
                  {dailyLog.waterIntake}
                  <span className="text-base font-normal text-muted-foreground">
                    ml
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('water', lang)}: {profile?.waterTarget || 2500}ml {t('ofTarget', lang)}
                </p>
              </div>
              {/* Progress bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-secondary transition-all duration-300"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateWater(-250)}
                  disabled={dailyLog.waterIntake <= 0}
                >
                  <Minus className="mr-1 h-3 w-3" />
                  250ml
                </Button>
                <Button
                  onClick={() => updateWater(250)}
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  250ml
                </Button>
                <Button
                  onClick={() => updateWater(500)}
                  size="sm"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  500ml
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4 flex flex-col gap-4">
          <Card className="border-0 bg-card shadow-sm">
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Footprints className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="steps">{t('stepCount', lang)}</Label>
                  <Input
                    id="steps"
                    type="number"
                    placeholder="0"
                    value={dailyLog.steps || ""}
                    onChange={(e) => updateSteps(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">{t('activityLevel', lang)}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                      {
                        key: "sedentary",
                        label: t('sedentary', lang),
                        desc: t('deskWork', lang),
                      },
                      {
                        key: "light",
                        label: t('lightActivity', lang),
                        desc: t('walkingTours', lang),
                      },
                      {
                        key: "moderate",
                        label: t('moderate', lang),
                        desc: t('hikingCycling', lang),
                      },
                      {
                        key: "active",
                        label: t('activeLevel', lang),
                        desc: t('sportsIntense', lang),
                      },
                    ] as const
                  ).map((level) => (
                    <button
                      key={level.key}
                      onClick={() => updateActivity(level.key)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-colors",
                        dailyLog.activityLevel === level.key
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <span className="text-sm font-medium">
                        {level.label}
                      </span>
                      <span className="text-[10px]">{level.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="activity-notes">{t('activityNotes', lang)}</Label>
                <Textarea
                  id="activity-notes"
                  placeholder="Walked around the temple district..."
                  value={dailyLog.activityNotes}
                  onChange={(e) => updateNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    )
  }
}
