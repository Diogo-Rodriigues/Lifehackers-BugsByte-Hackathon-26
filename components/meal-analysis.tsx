"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getProfile, addMealToLog, todayString, generateId } from "@/lib/store"
import { apiFetch } from "@/lib/api"
import type { AnalysisResult, MealLog } from "@/lib/types"
import {
  Camera,
  Upload,
  Loader2,
  AlertTriangle,
  Plus,
  ImageIcon,
} from "lucide-react"
import { toast } from "sonner"

export function MealAnalysis() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [mealType, setMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("lunch")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profile = getProfile()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
      // Extract base64 from data URL
      const base64 = dataUrl.split(",")[1]
      setImageBase64(base64)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  async function analyzePhoto() {
    if (!imageBase64) return
    setAnalyzing(true)
    try {
      const res = await apiFetch("/api/analyze-meal", {
        image: imageBase64,
        allergies: profile?.allergies || [],
      })
      if (!res.ok) throw new Error("Analysis failed")
      const data = await res.json()
      setResult(data.analysis)

      // Check allergen warnings
      if (data.analysis.allergenWarnings?.length > 0) {
        toast.warning(
          `Allergen detected: ${data.analysis.allergenWarnings.join(", ")}`
        )
      }
    } catch {
      toast.error(
        "Could not analyze photo. Check your API key in Settings."
      )
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
    toast.success("Meal logged successfully!")
    // Reset
    setImagePreview(null)
    setImageBase64(null)
    setResult(null)
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <h1 className="font-display text-2xl text-primary">Analyze Meal</h1>
      <p className="text-sm text-muted-foreground">
        Take a photo of your meal for AI-powered nutritional analysis
      </p>

      {/* Photo Upload Area */}
      {!imagePreview ? (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5 shadow-none">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Capture or upload a meal photo
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Camera className="mr-2 h-4 w-4" />
                Camera
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-primary text-primary hover:bg-primary/5"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
            <input
              ref={fileInputRef}
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

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setImagePreview(null)
                setImageBase64(null)
                setResult(null)
              }}
              className="flex-1"
            >
              Retake
            </Button>
            <Button
              onClick={analyzePhoto}
              disabled={analyzing}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Meal"
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
                    Allergen Warning
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Contains: {result.allergenWarnings.join(", ")}
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
                <p className="text-[10px] text-muted-foreground">protein</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5 text-center">
                <p className="text-lg font-bold text-foreground">
                  {result.carbs}g
                </p>
                <p className="text-[10px] text-muted-foreground">carbs</p>
              </div>
              <div className="rounded-lg bg-muted p-2.5 text-center">
                <p className="text-lg font-bold text-foreground">
                  {result.fat}g
                </p>
                <p className="text-[10px] text-muted-foreground">fat</p>
              </div>
            </div>

            {/* Ingredients */}
            {result.ingredients.length > 0 && (
              <div className="mb-4">
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Detected Ingredients
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground"
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
                {Math.round((result.confidence || 0.8) * 100)}% confidence
              </span>
            </div>

            {/* Log Action */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Meal Type</Label>
                <Select value={mealType} onValueChange={(v) => setMealType(v as typeof mealType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={logMealFromAnalysis}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Log This Meal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
