import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function Models() {
  const { data: byModel } = trpc.evaluations.byModel.useQuery();

  const chartData = byModel?.map((m) => ({
    model: m.model.split("/").pop() || m.model,
    score: Number(m.avgScore),
    latency: Number(m.avgLatency),
    cost: Number(m.avgCost) * 1000,
    hallucination: Number(m.avgHallucination) * 100,
    relevance: Number(m.avgRelevance) * 100,
    faithfulness: Number(m.avgFaithfulness) * 100,
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comparação de Modelos</h1>
          <p className="text-muted-foreground">Benchmark side-by-side de qualidade, latência, custo e alucinação</p>
        </div>

        {/* Score Comparison */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Score Geral por Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="model" tick={{ fontSize: 11, fill: "oklch(0.7 0 0)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "oklch(0.7 0 0)" }} />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.18 0.01 260)", border: "1px solid oklch(0.3 0.01 260)", borderRadius: "8px" }}
                    labelStyle={{ color: "oklch(0.9 0 0)" }}
                  />
                  <Bar dataKey="score" fill="oklch(0.65 0.18 250)" radius={[4, 4, 0, 0]} name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {byModel?.map((m) => (
            <Card key={m.model} className="bg-card border-border/50 hover:border-primary/30 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono">{m.model}</CardTitle>
                  <Badge variant={Number(m.avgScore) >= 80 ? "default" : "destructive"} className="text-xs">
                    {Number(m.avgScore).toFixed(0)}/100
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{m.totalEvals} avaliações realizadas</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Latência Média</p>
                    <p className="text-lg font-bold mt-1">{Number(m.avgLatency).toFixed(0)}<span className="text-xs text-muted-foreground">ms</span></p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Custo Médio</p>
                    <p className="text-lg font-bold mt-1">${Number(m.avgCost).toFixed(4)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Alucinação</p>
                    <p className={`text-lg font-bold mt-1 ${Number(m.avgHallucination) > 0.2 ? "text-destructive" : "text-green-500"}`}>
                      {(Number(m.avgHallucination) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Relevância</p>
                    <p className={`text-lg font-bold mt-1 ${Number(m.avgRelevance) > 0.8 ? "text-green-500" : "text-yellow-500"}`}>
                      {(Number(m.avgRelevance) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Fidelidade */}
                <div className="p-3 rounded-lg bg-secondary/20">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fidelidade</p>
                    <p className={`text-sm font-bold ${Number(m.avgFaithfulness) > 0.8 ? "text-green-500" : "text-yellow-500"}`}>
                      {(Number(m.avgFaithfulness) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${Number(m.avgFaithfulness) > 0.8 ? "bg-green-500" : "bg-yellow-500"}`}
                      style={{ width: `${Number(m.avgFaithfulness) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Latency vs Cost Chart */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Latência por Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="model" tick={{ fontSize: 11, fill: "oklch(0.7 0 0)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "oklch(0.7 0 0)" }} unit="ms" />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.18 0.01 260)", border: "1px solid oklch(0.3 0.01 260)", borderRadius: "8px" }}
                    labelStyle={{ color: "oklch(0.9 0 0)" }}
                  />
                  <Bar dataKey="latency" fill="oklch(0.7 0.15 150)" radius={[4, 4, 0, 0]} name="Latência (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
