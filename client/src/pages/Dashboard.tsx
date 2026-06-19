import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Activity, AlertTriangle, DollarSign, Zap, TrendingUp, Shield, Brain, Server, Code, Briefcase, Crown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type ViewMode = "developer" | "business" | "executive";

export default function Dashboard() {
  const { data: metrics, isLoading, refetch } = trpc.dashboard.metrics.useQuery();
  const seed = trpc.seed.run.useMutation({ onSuccess: () => refetch() });
  const [viewMode, setViewMode] = useState<ViewMode>("developer");

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

  const viewLabels: Record<ViewMode, { title: string; subtitle: string }> = {
    developer: { title: "Dashboard Técnico", subtitle: "Visão detalhada para developers — traces, latência, causa raiz" },
    business: { title: "Dashboard de Negócio", subtitle: "Visão para gestores — impacto operacional, SLAs, custos" },
    executive: { title: "Dashboard Executivo", subtitle: "Visão C-Level — impacto financeiro, risco, tendências" },
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{viewLabels[viewMode].title}</h1>
            <p className="text-muted-foreground text-sm">{viewLabels[viewMode].subtitle}</p>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9">
              <TabsTrigger value="developer" className="gap-1.5 text-xs px-3">
                <Code className="h-3.5 w-3.5" />
                Developer
              </TabsTrigger>
              <TabsTrigger value="business" className="gap-1.5 text-xs px-3">
                <Briefcase className="h-3.5 w-3.5" />
                Negócio
              </TabsTrigger>
              <TabsTrigger value="executive" className="gap-1.5 text-xs px-3">
                <Crown className="h-3.5 w-3.5" />
                Executivo
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* === DEVELOPER VIEW === */}
        {viewMode === "developer" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Traces</p>
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
                      <p className="text-3xl font-bold mt-1 text-destructive">{metrics ? `${metrics.failureRate.toFixed(1)}%` : "—"}</p>
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
                      <p className="text-3xl font-bold mt-1">${metrics?.tokenCost?.toFixed(2) ?? "—"}</p>
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
                      <p className="text-sm text-muted-foreground">Falhas por IA</p>
                      <p className="text-3xl font-bold mt-1 text-chart-1">{metrics?.rootCauses.ai ?? "—"}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-chart-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-card border-border/50">
                <CardHeader><CardTitle className="text-base">Causa Raiz das Falhas</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={rootCauseData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                          {rootCauseData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
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
              <Card className="lg:col-span-2 bg-card border-border/50">
                <CardHeader><CardTitle className="text-base">Tendência de Latência (últimos traces)</CardTitle></CardHeader>
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

            {/* Recent Traces - Technical */}
            <Card className="bg-card border-border/50">
              <CardHeader><CardTitle className="text-base">Traces Recentes</CardTitle></CardHeader>
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
                        <Badge variant={trace.status === "success" ? "default" : "destructive"} className="text-xs">{trace.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* === BUSINESS VIEW === */}
        {viewMode === "business" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Disponibilidade do Serviço</p>
                  <p className="text-3xl font-bold mt-1 text-green-400">{metrics ? `${(100 - metrics.failureRate).toFixed(1)}%` : "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">SLA Target: 99.5%</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Operações Afetadas</p>
                  <p className="text-3xl font-bold mt-1 text-destructive">{metrics?.failedTests ?? "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">de {metrics?.totalTests ?? 0} operações totais</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Custo Operacional IA</p>
                  <p className="text-3xl font-bold mt-1">R$ {metrics?.tokenCost ? (metrics.tokenCost * 5.5).toFixed(0) : "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Conversão: 1 USD = 5.50 BRL</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Impacto em Clientes</p>
                  <p className="text-3xl font-bold mt-1 text-chart-5">{metrics?.failedTests ? metrics.failedTests * 47 : "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">clientes potencialmente impactados</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border/50">
                <CardHeader><CardTitle className="text-base">Origem dos Problemas</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Agentes de IA (validação, análise)</span>
                      <span className="text-sm font-bold text-chart-1">{metrics?.rootCauses.ai ?? 0} falhas</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div className="bg-chart-1 h-2 rounded-full" style={{ width: `${metrics ? (metrics.rootCauses.ai / metrics.failedTests) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Código / Lógica de negócio</span>
                      <span className="text-sm font-bold text-chart-4">{metrics?.rootCauses.code ?? 0} falhas</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div className="bg-chart-4 h-2 rounded-full" style={{ width: `${metrics ? (metrics.rootCauses.code / metrics.failedTests) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Infraestrutura (AWS, DB, Kafka)</span>
                      <span className="text-sm font-bold text-chart-5">{metrics?.rootCauses.infrastructure ?? 0} falhas</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div className="bg-chart-5 h-2 rounded-full" style={{ width: `${metrics ? (metrics.rootCauses.infrastructure / metrics.failedTests) * 100 : 0}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/50">
                <CardHeader><CardTitle className="text-base">Recomendações Operacionais</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-sm font-medium">Prioridade Alta</p>
                    <p className="text-xs text-muted-foreground mt-1">Corrigir prompts dos agents de validação — responsáveis por {metrics?.rootCauses.ai ?? 0} falhas com impacto de R$ {metrics?.financialImpact ? (metrics.financialImpact * 0.5 / 1000).toFixed(0) : 0}k</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-sm font-medium">Prioridade Média</p>
                    <p className="text-xs text-muted-foreground mt-1">Revisar capacity planning da infraestrutura — {metrics?.rootCauses.infrastructure ?? 0} falhas por timeout/capacity</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium">Melhoria Contínua</p>
                    <p className="text-xs text-muted-foreground mt-1">Implementar testes de regressão automatizados no CI/CD para prevenir falhas de código</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* === EXECUTIVE VIEW === */}
        {viewMode === "executive" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-card border-border/50 lg:row-span-2">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground text-center">Impacto Financeiro Total</p>
                  <p className="text-5xl font-bold mt-3 text-chart-5">
                    R$ {metrics?.financialImpact ? (metrics.financialImpact / 1000).toFixed(0) : "0"}k
                  </p>
                  <p className="text-lg text-muted-foreground mt-1">
                    ≈ USD {metrics?.financialImpact ? (metrics.financialImpact / 5500).toFixed(1) : "0"}k
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 text-center">Perdas evitáveis com correção dos agents de IA</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Nível de Risco</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-3xl font-bold text-destructive">ALTO</p>
                    <Shield className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{metrics?.failureRate.toFixed(0)}% de falha — acima do aceitável (5%)</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">ROI da Correção</p>
                  <p className="text-3xl font-bold mt-1 text-green-400">12.4x</p>
                  <p className="text-xs text-muted-foreground mt-2">Investimento estimado: R$ 8.7k → Economia: R$ 108k</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Compliance</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-3xl font-bold text-yellow-400">67%</p>
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">3 de 6 testes de segurança com vulnerabilidades</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Tendência Mensal</p>
                  <p className="text-3xl font-bold mt-1 text-destructive">↑ 23%</p>
                  <p className="text-xs text-muted-foreground mt-2">Aumento de falhas vs mês anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border/50">
              <CardHeader><CardTitle className="text-base">Resumo Executivo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-sm font-semibold text-destructive">Risco Imediato</p>
                    <p className="text-xs text-muted-foreground mt-2">Agents de IA aprovam dados inválidos. Violação potencial de LGPD por remoção de acentos em nomes de clientes. Exposição regulatória estimada: R$ 500k+</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-sm font-semibold text-yellow-400">Ação Recomendada</p>
                    <p className="text-xs text-muted-foreground mt-2">Implementar guardrails de segurança nos agents em 2 semanas. Custo: R$ 15k. Redução de risco: 73%. Payback: 3 dias.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <p className="text-sm font-semibold text-green-400">Oportunidade</p>
                    <p className="text-xs text-muted-foreground mt-2">Otimizar prompts pode reduzir custo de tokens em 40% e melhorar precisão em 28%. Economia anual projetada: R$ 180k.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
