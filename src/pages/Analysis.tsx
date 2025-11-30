import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Target,
  Lightbulb,
  Banknote,
  Megaphone,
  Activity,
  ArrowRight,
  Users,
  Monitor,
  Calendar,
  Info,
  Smartphone,
  CalendarClock,
  Database,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Metrics {
  totalSpend: number | null;
  totalImpressions: number | null;
  totalClicks: number | null;
  totalPurchases: number | null;
  totalLeads: number | null;
  totalRevenue: number | null;
  ctr: number | null;
  cpc: number | null;
  cpp: number | null;
  cpl: number | null;
  cpm: number | null;
  roas: number | null;
  goal?: string;
  primaryKpiKey?: string;
  primaryKpiLabel?: string;
  primaryKpiValue?: number | null;
  resultsLabel?: string;
  resultsValue?: number | null;
}

interface AIInsights {
  insights: {
    healthScore?: number;
    quickVerdict: string;
    quickVerdictTone: "positive" | "negative" | "mixed";
    bestPerformers: { id: string; reason: string }[];
    needsAttention: { id: string; reason: string }[];
    whatsWorking?: { title: string; detail: string }[];
    whatsNotWorking?: { title: string; detail: string }[];
    deepAnalysis?: {
      funnelHealth: { status: string; title: string; description: string; metricToWatch: string };
      opportunities: { title: string; description: string; impact?: string }[];
      moneyWasters: { title: string; description: string; impact?: string }[];
      creativeFatigue: { title: string; description: string; impact?: string }[];
    };
    segmentAnalysis?: {
      demographics: { title: string; finding: string };
      placement: { title: string; finding: string };
      time: { title: string; finding: string };
    } | null;
  };
}

interface LocationState {
  rowCount?: number;
  columnNames?: string[];
  platform?: string;
  dataLevel?: string;
  metrics?: Metrics;
  aiInsights?: AIInsights | null;
  aiInsightsError?: string | null;
  rawData?: Record<string, any>[];
}

// Formatting helpers
const formatCurrency = (value: number | null): string => {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number | null): string => {
  if (value === null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
};

const formatPercent = (value: number | null): string => {
  if (value === null) return "—";
  return `${value.toFixed(2)}%`;
};

const formatRoas = (value: number | null): string => {
  if (value === null) return "—";
  return `${value.toFixed(2)}x`;
};

const formatPrimaryKpi = (value: number | null, kpiKey?: string): string => {
  if (value === null || value === undefined) return "—";

  // Currency format for cost metrics
  if (kpiKey === "cpl" || kpiKey === "cpp" || kpiKey === "cpc" || kpiKey === "cpm") {
    return formatCurrency(value);
  }

  // ROAS as plain number
  if (kpiKey === "roas") {
    return value.toFixed(2);
  }

  // Default: number with 2 decimals
  return value.toFixed(2);
};

const Analysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const metrics = state?.metrics;
  const aiInsights = state?.aiInsights;
  const aiInsightsError = state?.aiInsightsError;
  const rawData = state?.rawData || [];
  const columnNames = state?.columnNames || [];
  
  // Use insights directly from navigation state
  const insights = aiInsights?.insights;
  const hasAiInsights = !!insights;

  // Format primary KPI for display (simple version without Campaign type)

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary" />
              <span className="text-xl font-display font-semibold text-foreground">AdPilot</span>
            </div>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Performance Analysis</h1>
          <p className="text-muted-foreground">
            {state?.platform || "Meta Ads"} • {state?.dataLevel || "Campaign Level"} • Last 30 days
          </p>
        </div>


        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Spend</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatCurrency(metrics?.totalSpend ?? null)}
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{metrics?.primaryKpiLabel || "Primary KPI"}</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatPrimaryKpi(
                    metrics?.primaryKpiValue ??
                      (metrics?.primaryKpiKey ? (metrics as any)[metrics.primaryKpiKey] : null),
                    metrics?.primaryKpiKey,
                  )}
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  {metrics?.roas !== null && metrics?.roas !== undefined ? "ROAS" : metrics?.resultsLabel || "Results"}
                </p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {metrics?.roas !== null && metrics?.roas !== undefined
                    ? formatRoas(metrics.roas)
                    : metrics?.resultsValue !== null && metrics?.resultsValue !== undefined
                      ? formatNumber(metrics.resultsValue)
                      : "—"}
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">CTR</p>
                <p className="text-2xl font-display font-bold text-foreground">{formatPercent(metrics?.ctr ?? null)}</p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Impressions</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatNumber(metrics?.totalImpressions ?? null)}
                </p>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Clicks</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatNumber(metrics?.totalClicks ?? null)}
                </p>
              </Card>
            </div>

            {/* Health Score & Verdict */}
            <Card className="p-6 border-l-4 border-l-primary relative overflow-hidden">
              {aiInsightsError || !insights ? (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">AI Verdict</h3>
                    <p className="text-muted-foreground text-sm">
                      {aiInsightsError || "AI insights not available yet"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Score Circle */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`h-24 w-24 rounded-full flex items-center justify-center border-4 text-3xl font-bold font-display transition-colors
                      ${
                        (insights.healthScore ?? 0) >= 80
                          ? "border-green-500 text-green-600"
                          : (insights.healthScore ?? 0) >= 50
                            ? "border-yellow-500 text-yellow-600"
                            : "border-red-500 text-red-600"
                      }`}
                    >
                      {insights.healthScore ?? "?"}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background px-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</span>
                    </div>
                  </div>

                  {/* Text Section with Badge */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">AI Verdict</h3>

                      {/* Status Badge based on tone */}
                      {insights.quickVerdictTone === "positive" && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Healthy</Badge>
                      )}
                      {insights.quickVerdictTone === "mixed" && (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Stable</Badge>
                      )}
                      {insights.quickVerdictTone === "negative" && (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
                      )}

                      {/* Info Tooltip */}
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button className="inline-flex items-center justify-center rounded-full hover:bg-muted/50 p-1 transition-colors">
                              <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            align="start"
                            className="w-[300px] sm:w-[400px] p-4 text-sm bg-popover border shadow-xl z-50"
                          >
                            <div className="space-y-3">
                              <h4 className="font-semibold text-base border-b pb-2">How is this calculated?</h4>
                              <p className="text-muted-foreground">
                                The Health Score (0-100) is an AI-weighted metric based on:
                              </p>
                              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                                <li>
                                  <strong>Efficiency (40%):</strong> comparing your ROAS/CPA against industry benchmarks.
                                </li>
                                <li>
                                  <strong>Funnel Health (30%):</strong> analyzing the drop-off from Click to Purchase.
                                </li>
                                <li>
                                  <strong>Consistency (30%):</strong> checking for stability in results over time.
                                </li>
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <p className="text-foreground/80 leading-relaxed text-lg">
                      {insights.quickVerdict}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Best & Worst Performers */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Best Performers
                </h3>
                <div className="space-y-3">
                  {insights?.bestPerformers?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium text-foreground">{item.id}</span>
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                        {item.reason}
                      </Badge>
                    </div>
                  ))}
                  {!insights?.bestPerformers?.length && (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No specific top performers identified.
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-warning" />
                  Needs Attention
                </h3>
                <div className="space-y-3">
                  {insights?.needsAttention?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm font-medium text-foreground">{item.id}</span>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        {item.reason}
                      </Badge>
                    </div>
                  ))}
                  {!insights?.needsAttention?.length && (
                    <p className="text-muted-foreground text-sm text-center py-4">No campaigns need attention.</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab - Deep Dive Dashboard */}
          <TabsContent value="insights" className="space-y-6">
            {!aiInsights ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      Failed to Load Insights
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      The AI analysis could not be completed. Please ensure your environment variables are configured correctly.
                    </p>
                </div>
                </div>
              </Card>
            ) : (
              <>
                {/* MAIN DEEP DIVE */}
                {insights?.deepAnalysis ? (
                  <>
                    {/* Funnel Health */}
                    {insights.deepAnalysis.funnelHealth && (
                      <Card
                        className={`p-6 border-l-4 ${
                          insights.deepAnalysis.funnelHealth.status === "Broken"
                            ? "border-l-destructive"
                            : insights.deepAnalysis.funnelHealth.status === "Warning"
                              ? "border-l-warning"
                              : "border-l-accent"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Activity className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-foreground">
                                {insights.deepAnalysis.funnelHealth.title}
                              </h3>
                              <Badge
                                variant={
                                  insights.deepAnalysis.funnelHealth.status === "Broken" ? "destructive" : "default"
                                }
                              >
                                {insights.deepAnalysis.funnelHealth.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {insights.deepAnalysis.funnelHealth.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* What's Working / What's Not Working */}
                    {(insights.whatsWorking && insights.whatsWorking.length > 0) || 
                     (insights.whatsNotWorking && insights.whatsNotWorking.length > 0) ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* What's Working */}
                        {insights.whatsWorking && insights.whatsWorking.length > 0 && (
                          <Card className="p-6 border-l-4 border-l-accent">
                            <h3 className="font-semibold text-accent flex items-center gap-2 mb-4">
                              <CheckCircle2 className="h-5 w-5" /> What's Working
                            </h3>
                            <div className="space-y-3">
                              {insights.whatsWorking.map((item, i) => (
                                <div key={i} className="bg-accent/5 p-3 rounded-lg">
                                  <p className="font-medium text-sm text-foreground mb-1">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}

                        {/* What's Not Working */}
                        {insights.whatsNotWorking && insights.whatsNotWorking.length > 0 && (
                          <Card className="p-6 border-l-4 border-l-warning">
                            <h3 className="font-semibold text-warning flex items-center gap-2 mb-4">
                              <AlertCircle className="h-5 w-5" /> What's Not Working
                            </h3>
                            <div className="space-y-3">
                              {insights.whatsNotWorking.map((item, i) => (
                                <div key={i} className="bg-warning/5 p-3 rounded-lg">
                                  <p className="font-medium text-sm text-foreground mb-1">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}
                      </div>
                    ) : null}

                    {/* SEGMENT TRENDS (Only if real data exists) */}
                    {insights.segmentAnalysis && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                        {insights.segmentAnalysis.demographics && (
                          <Card className="p-5 border-l-4 border-l-purple-500 bg-purple-50/5">
                            <h4 className="font-semibold text-sm mb-2 flex gap-2">
                              <Users className="h-4 w-4" /> Demographics
                            </h4>
                            <p className="text-sm text-foreground">{insights.segmentAnalysis.demographics.finding}</p>
                          </Card>
                        )}
                        {insights.segmentAnalysis.placement && (
                          <Card className="p-5 border-l-4 border-l-blue-500 bg-blue-50/5">
                            <h4 className="font-semibold text-sm mb-2 flex gap-2">
                              <Smartphone className="h-4 w-4" /> Placement
                            </h4>
                            <p className="text-sm text-foreground">{insights.segmentAnalysis.placement.finding}</p>
                          </Card>
                        )}
                        {insights.segmentAnalysis.time && (
                          <Card className="p-5 border-l-4 border-l-orange-500 bg-orange-50/5">
                            <h4 className="font-semibold text-sm mb-2 flex gap-2">
                              <CalendarClock className="h-4 w-4" /> Timing
                            </h4>
                            <p className="text-sm text-foreground">{insights.segmentAnalysis.time.finding}</p>
                          </Card>
                        )}
                      </div>
                    )}

                    {/* Financial Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Opportunities */}
                      <Card className="p-6">
                        <h3 className="font-semibold text-accent flex items-center gap-2 mb-4">
                          <TrendingUp className="h-5 w-5" /> Profit Opportunities
                        </h3>
                        <div className="space-y-3">
                          {insights.deepAnalysis.opportunities?.map((item, i) => (
                            <div key={i} className="bg-accent/5 p-3 rounded-lg border border-accent/10">
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">{item.title}</p>
                                <Badge variant="outline" className="text-[10px]">
                                  {(item as any).impact || "High"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          ))}
                          {insights.deepAnalysis.opportunities.length === 0 && (
                            <p className="text-sm text-muted-foreground">No high-impact opportunities found.</p>
                          )}
                        </div>
                      </Card>

                      {/* Money Wasters */}
                      <Card className="p-6">
                        <h3 className="font-semibold text-destructive flex items-center gap-2 mb-4">
                          <Banknote className="h-5 w-5" /> Budget Leaks
                        </h3>
                        <div className="space-y-3">
                          {insights.deepAnalysis.moneyWasters?.map((item, i) => (
                            <div key={i} className="bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                              <div className="flex justify-between">
                                <p className="font-medium text-sm">{item.title}</p>
                                <Badge variant="outline" className="text-[10px]">
                                  {(item as any).impact || "Savings"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                          ))}
                          {insights.deepAnalysis.moneyWasters.length === 0 && (
                            <p className="text-sm text-muted-foreground">Budget spend looks efficient.</p>
                          )}
                        </div>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">Deep analysis unavailable.</div>
                )}
              </>
            )}
          </TabsContent>

          {/* Recommendations Tab - Action-Focused */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* Priority Action Items */}
            <Card className="p-6 border-l-4 border-l-primary">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Priority Actions This Week
              </h3>
              <div className="space-y-3">
                {/* Generate action items from insights */}
                {insights?.deepAnalysis?.opportunities?.slice(0, 2).map((opp, i) => (
                  <div key={`action-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Scale: {opp.title.replace(/^Scale top performer: |^Replicate creative from /, '')}</p>
                      <p className="text-xs text-muted-foreground mt-1">Increase budget by 30-50% to capture more efficient conversions</p>
                    </div>
                  </div>
                ))}
                {insights?.deepAnalysis?.moneyWasters?.slice(0, 1).map((leak, i) => (
                  <div key={`leak-action-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="h-6 w-6 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-destructive">{(insights?.deepAnalysis?.opportunities?.slice(0, 2).length || 0) + i + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Pause: {leak.title.replace(/^Pause or rebuild: |^Reduce budget: /, '')}</p>
                      <p className="text-xs text-muted-foreground mt-1">Stop spend immediately to prevent further losses</p>
                    </div>
                  </div>
                ))}
                {!insights?.deepAnalysis?.opportunities?.length && !insights?.deepAnalysis?.moneyWasters?.length && (
                  <p className="text-muted-foreground text-sm py-2">No priority actions identified.</p>
                )}
              </div>
            </Card>

            {/* Quick Wins vs Strategic Changes */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Quick Wins (Do Today)
                </h3>
                <ul className="space-y-3">
                  {insights?.bestPerformers?.slice(0, 2).map((performer, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Duplicate <strong>{performer.id}</strong> and test new audience</span>
                    </li>
                  ))}
                  {insights?.needsAttention?.slice(0, 1).map((item, i) => (
                    <li key={`pause-${i}`} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Set daily budget cap on <strong>{item.id}</strong></span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Review placement performance and exclude underperformers</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Strategic Changes (This Week)
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Restructure ad sets by performance tier</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Create lookalike audiences from top converters</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Test dayparting based on conversion patterns</span>
                  </li>
                  {insights?.deepAnalysis?.funnelHealth?.status === "Warning" && (
                    <li className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Review landing page to improve funnel conversion</span>
                    </li>
                  )}
                </ul>
              </Card>
            </div>

            {/* Creative Recommendations */}
            <Card className="p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-warning" />
                Creative Testing Ideas
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="font-medium text-sm mb-2">Hook Variations</p>
                  <p className="text-xs text-muted-foreground">Test 3 new opening hooks in your top ad creative</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="font-medium text-sm mb-2">Format Testing</p>
                  <p className="text-xs text-muted-foreground">Convert top static ads to video/carousel format</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="font-medium text-sm mb-2">UGC Content</p>
                  <p className="text-xs text-muted-foreground">Add user-generated content to refresh creative pool</p>
                </div>
              </div>
            </Card>

            {/* Budget Reallocation */}
            {(insights?.deepAnalysis?.opportunities?.length || insights?.deepAnalysis?.moneyWasters?.length) && (
              <Card className="p-6 bg-gradient-to-r from-accent/5 to-primary/5">
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-foreground" />
                  Suggested Budget Reallocation
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                  {insights?.deepAnalysis?.moneyWasters?.[0] && (
                    <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-xs text-muted-foreground mb-1">Reduce from</p>
                      <p className="font-medium text-sm text-destructive">{insights.deepAnalysis.moneyWasters[0].title.replace(/^Pause or rebuild: |^Reduce budget: /, '').substring(0, 25)}...</p>
                    </div>
                  )}
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                  {insights?.deepAnalysis?.opportunities?.[0] && (
                    <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-xs text-muted-foreground mb-1">Reallocate to</p>
                      <p className="font-medium text-sm text-accent">{insights.deepAnalysis.opportunities[0].title.replace(/^Scale top performer: |^Replicate creative from /, '').substring(0, 25)}...</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

          </TabsContent>

          {/* Raw Data Tab */}
          <TabsContent value="raw" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">Uploaded Data</h3>
                </div>
                <Badge variant="outline">
                  {state?.rowCount || rawData.length} rows • {columnNames.length} columns
                </Badge>
              </div>
              
              {rawData.length > 0 ? (
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <div className="max-h-[600px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          {columnNames.map((col, idx) => (
                            <TableHead key={idx} className="min-w-[120px] font-medium">
                              {col}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rawData.map((row, rowIdx) => (
                          <TableRow key={rowIdx}>
                            {columnNames.map((col, colIdx) => (
                              <TableCell key={colIdx} className="text-sm">
                                {row[col] !== undefined && row[col] !== null 
                                  ? String(row[col]).substring(0, 50) 
                                  : "—"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Database className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No raw data available</p>
                  <p className="text-sm text-muted-foreground/70">Upload a CSV file to see the data here</p>
                </div>
              )}
              
              {rawData.length > 0 && rawData.length < (state?.rowCount || 0) && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing first {rawData.length} of {state?.rowCount} rows
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analysis;
