"use client";

import { useState } from "react";
import { WeeklyData, MonthlyData, MuscleBalance } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreBarChart } from "./ScoreBarChart";
import { MonthlyLineChart } from "./MonthlyLineChart";
import { MuscleRadarChart } from "./MuscleRadarChart";

interface Props {
  weekly12: WeeklyData[];
  weekly26: WeeklyData[];
  monthly12: MonthlyData[];
  muscleBalance30: MuscleBalance[];
  muscleBalance90: MuscleBalance[];
}

export function ChartsView({ weekly12, weekly26, monthly12, muscleBalance30, muscleBalance90 }: Props) {
  const [weeklyRange, setWeeklyRange] = useState<12 | 26>(12);
  const [balanceRange, setBalanceRange] = useState<30 | 90>(30);

  const weeklyData = weeklyRange === 12 ? weekly12 : weekly26;
  const balanceData = balanceRange === 30 ? muscleBalance30 : muscleBalance90;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Volume */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Weekly Volume by Muscle Group</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={weeklyRange === 12 ? "default" : "outline"}
              size="sm"
              onClick={() => setWeeklyRange(12)}
            >
              12 weeks
            </Button>
            <Button
              variant={weeklyRange === 26 ? "default" : "outline"}
              size="sm"
              onClick={() => setWeeklyRange(26)}
            >
              26 weeks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScoreBarChart data={weeklyData} />
        </CardContent>
      </Card>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyLineChart data={monthly12} />
        </CardContent>
      </Card>

      {/* Muscle Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Muscle Group Balance</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={balanceRange === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setBalanceRange(30)}
            >
              30d
            </Button>
            <Button
              variant={balanceRange === 90 ? "default" : "outline"}
              size="sm"
              onClick={() => setBalanceRange(90)}
            >
              90d
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MuscleRadarChart data={balanceData} />
        </CardContent>
      </Card>
    </div>
  );
}
