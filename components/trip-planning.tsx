"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getActiveTrip } from "@/lib/store"
import {
    MapPin,
    Clock,
    ShieldCheck,
    Utensils,
    Wine,
    CalendarDays,
    Plane,
} from "lucide-react"
import { getLanguage, t } from "@/lib/language"

export function TripPlanning() {
    const existingTrip = getActiveTrip()
    const lang = getLanguage()

    if (!existingTrip) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
                <div className="mb-6 rounded-full bg-muted p-6">
                    <Plane className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                    {t('noTripPlanned', lang)}
                </h3>
                <p className="max-w-xs text-sm text-muted-foreground">
                    {t('noTripDesc', lang)}
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl text-[#38b6ff]">{t('yourTrip', lang)}</h1>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary whitespace-nowrap">
                    {t('activeBadge', lang)}
                </Badge>
            </div>

            <Card className="overflow-hidden border-0 bg-card shadow-sm">
                <div 
                    className="h-40 relative bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5"
                    style={{ 
                        backgroundImage: `url('https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=400&fit=crop&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/70 to-background/30" />
                    <div className="absolute inset-0 backdrop-blur-[2px]" />
                    <div className="absolute bottom-4 left-4 z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Plane className="h-5 w-5 text-primary" />
                            <h2 className="text-2xl font-bold text-foreground">
                                {existingTrip.destination}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>
                                {existingTrip.departureDate} - {existingTrip.arrivalDate}
                            </span>
                        </div>
                    </div>
                </div>
                <CardContent className="p-4 pt-2">
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {t('origin', lang)}
                            </div>
                            <span className="font-medium text-foreground">
                                {existingTrip.departureCity}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {t('timezone', lang)}
                            </div>
                            <span className="font-medium text-foreground">
                                {existingTrip.timezoneShift > 0 ? "+" : ""}
                                {existingTrip.timezoneShift}h (UTC)
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Utensils className="h-4 w-4 text-primary" />
                            {t('mustTryDishes', lang)}
                        </h3>
                        {existingTrip.selectedDishes?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {existingTrip.selectedDishes.map((d) => (
                                    <Badge
                                        key={d.name}
                                        variant="secondary"
                                        className="bg-accent text-accent-foreground hover:bg-accent/80 whitespace-nowrap"
                                    >
                                        {d.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                {t('noDishesSelected', lang)}
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Wine className="h-4 w-4 text-primary" />
                            {t('mustTryBeverages', lang)}
                        </h3>
                        {existingTrip.selectedBeverages.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {existingTrip.selectedBeverages.map((b) => (
                                    <Badge
                                        key={b.name}
                                        variant="secondary"
                                        className="bg-accent text-accent-foreground hover:bg-accent/80 whitespace-nowrap"
                                    >
                                        {b.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">
                                {t('noBeveragesSelected', lang)}
                            </p>
                        )}
                    </div>

                    {existingTrip.mealPlan && (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    {t('dailyMealPlan', lang)}
                                </h3>
                                <Badge variant="outline" className="text-[10px] capitalize text-primary border-primary/20 whitespace-nowrap">
                                    {existingTrip.mealPlan.status.replace("-", " ")}
                                </Badge>
                            </div>

                            <div className="flex flex-col gap-3">
                                {existingTrip.mealPlan.days.map((day) => (
                                    <Card key={day.date} className="border border-border bg-card/50 shadow-none">
                                        <CardContent className="p-3">
                                            <p className="mb-3 text-xs font-medium text-muted-foreground border-b pb-2">
                                                {day.date}
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                {day.meals.map((meal) => (
                                                    <div
                                                        key={meal.id}
                                                        className="flex items-start justify-between gap-3 text-sm"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                                    {meal.type}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {meal.suggestedTime}
                                                                </span>
                                                            </div>
                                                            <p className="font-medium text-foreground leading-tight">
                                                                {meal.dish}
                                                            </p>
                                                            {meal.notes && (
                                                                <p className="mt-1 text-[10px] text-muted-foreground italic line-clamp-1">
                                                                    {meal.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="font-semibold text-foreground block">
                                                                {meal.calories}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground block">
                                                                kcal
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
