import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Activity, AlertTriangle, DollarSign, Zap, TrendingUp, Shield, Brain, Server } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const { data: metrics, isLoading, refetch } = trpc.dashboard.metrics.useQuery();
  const seed = trpc.seed.run.useMutation({ onSuccess: () => refetch() });

  // Auto-seed demo data if empty
  const hasSeeded = React.useRef(false);
  React.useEffect(() => {
    if (!isLoading && metrics && metrics.totalTests === 0 && !hasSeeded.current) {
      hasSeeded.current = true;
      seed.mutate();
    }
  }, [isLoading, metrics]);

  const rootCauseData = metrics ? [
    { name: "IA", value: metrics.rootCauses.ai, color: "oklch(0.65 0.18 250)" },
    { name: "Código", value: metrics.rootCauses.code, color: "oklch(0.7 0.18 80)" },
    { name: "Infra", value: metrics.rootCauses.infrastructure, color: "oklch(0.55 0.2 25)" },
  ] : [];

  const trendData = metrics?.recentTraces?.map((t, i) => ({
    name: `T${i + 1}`,
    duration: t.totalDuration || 0,
    status: t.status === "failed" ? 1 : 0,
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da saúde dos seus sistemas de IA</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Testes</p>
                  <p className="text-3xl font-bold mt-1">{metrics?.totalTests ?? "—"}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Falha</p>
                  <p className="text-3xl font-bold mt-1 text-destructive">
                    {metrics ? `${metrics.failureRate.toFixed(1)}%` : "—"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo de Tokens</p>
                  <p className="text-3xl font-bold mt-1">
                    ${metrics?.tokenCost?.toFixed(2) ?? "—"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impacto Financeiro</p>
                  <p className="text-3xl font-bold mt-1 text-chart-5">
                    R$ {metrics?.financialImpact ? (metrics.financialImpact / 1000).toFixed(1) + "k" : "—"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Root Cause Pie */}
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Causa Raiz das Falhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rootCauseData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {rootCauseData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "oklch(0.178 0.008 285)", border: "1px solid oklch(0.25 0.01 285)", borderRadius: "8px", color: "white" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {rootCauseData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Trend */}
          <Card className="lg:col-span-2 bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Tendência de Latência (últimos traces)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.18 250)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.65 0.18 250)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 285)" />
                    <XAxis dataKey="name" stroke="oklch(0.5 0.01 285)" fontSize={11} />
                    <YAxis stroke="oklch(0.5 0.01 285)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "oklch(0.178 0.008 285)", border: "1px solid oklch(0.25 0.01 285)", borderRadius: "8px", color: "white" }} />
                    <Area type="monotone" dataKey="duration" stroke="oklch(0.65 0.18 250)" fill="url(#colorDuration)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Traces */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Traces Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics?.recentTraces?.slice(0, 8).map((trace) => (
                <div key={trace.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${trace.status === "success" ? "bg-green-500" : trace.status === "failed" ? "bg-red-500" : "bg-yellow-500"}`} />
                    <span className="text-sm font-mono">{trace.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {trace.rootCause && trace.rootCause !== "unknown" && (
                      <Badge variant="outline" className="text-xs">
                        {trace.rootCause === "ai" && <Brain className="h-3 w-3 mr-1" />}
                        {trace.rootCause === "code" && <Zap className="h-3 w-3 mr-1" />}
                        {trace.rootCause === "infrastructure" && <Server className="h-3 w-3 mr-1" />}
                        {trace.rootCause}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{trace.totalDuration}ms</span>
                    <Badge variant={trace.status === "success" ? "default" : "destructive"} className="text-xs">
                      {trace.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
