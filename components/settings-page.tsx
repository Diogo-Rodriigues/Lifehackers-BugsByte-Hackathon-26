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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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

  useEffect(() => {
    setProfile(getProfile())
    setApiKeyState(getApiKey())
  }, [])

  function handleSaveApiKey() {
    saveApiKey(apiKey)
    toast.success("API key saved")
  }

  function handleSaveProfile() {
    if (profile) {
      saveProfile(profile)
      toast.success("Profile updated")
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
      toast.success("All data cleared. Refreshing...")
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  if (!profile) return null

  return (
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <h1 className="font-display text-2xl text-primary">Settings</h1>

      {/* API Key */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              OpenAI API Key
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Required for meal photo analysis, local dish discovery, and AI meal
            planning. Your key is stored locally in your browser.
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
                Key configured
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="s-name" className="text-xs">
                Name
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
              <Label htmlFor="s-age" className="text-xs">
                Age
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
              <Label htmlFor="s-height" className="text-xs">
                Height (cm)
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
              <Label htmlFor="s-weight" className="text-xs">
                Weight (kg)
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
                Cal Target
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
            <Label className="text-xs">Goal</Label>
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
                <SelectItem value="lose">Lose Weight</SelectItem>
                <SelectItem value="maintain">Maintain</SelectItem>
                <SelectItem value="gain">Gain Muscle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSaveProfile}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-destructive" />
            <h2 className="text-sm font-semibold text-foreground">
              Allergies & Intolerances
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
            Save Allergies
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-destructive/30 bg-card shadow-none">
        <CardContent className="flex flex-col gap-3 p-4">
          <h2 className="text-sm font-semibold text-destructive">
            Danger Zone
          </h2>
          <p className="text-xs text-muted-foreground">
            Clear all local data including profile, trips, and meal logs.
          </p>
          <Button
            onClick={handleClearData}
            variant="destructive"
            size="sm"
            className="self-start"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
