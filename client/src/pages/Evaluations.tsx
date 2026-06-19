import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";

export default function Evaluations() {
  const { data: evaluations } = trpc.evaluations.list.useQuery();
  const { data: byModel } = trpc.evaluations.byModel.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Avaliação de Qualidade</h1>
          <p className="text-muted-foreground">LLM-as-Judge — métricas de qualidade por modelo e prompt</p>
        </div>

        {/* Model Comparison */}
        {byModel && byModel.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {byModel.map((m) => (
              <Card key={m.model} className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono">{m.model}</CardTitle>
                  <p className="text-xs text-muted-foreground">{m.totalEvals} avaliações</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <span className="text-3xl font-bold">{Number(m.avgScore).toFixed(0)}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <div className="space-y-2">
                    <MetricBar label="Alucinação" value={Number(m.avgHallucination)} inverted />
                    <MetricBar label="Relevância" value={Number(m.avgRelevance)} />
                    <MetricBar label="Fidelidade" value={Number(m.avgFaithfulness)} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>Latência: {Number(m.avgLatency).toFixed(0)}ms</span>
                    <span>Custo: ${Number(m.avgCost).toFixed(4)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Individual Evaluations */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Avaliações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluations?.map((ev) => (
                <div key={ev.id} className="p-4 rounded-lg bg-secondary/20 border border-border/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">{ev.model}</Badge>
                        <span className="text-xs text-muted-foreground">{ev.latency}ms · {ev.totalTokens} tokens</span>
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground line-clamp-1">
                        <span className="font-medium text-foreground">Prompt:</span> {ev.prompt}
                      </p>
                      <p className="text-sm mt-1 text-muted-foreground line-clamp-1">
                        <span className="font-medium text-foreground">Resposta:</span> {ev.response}
                      </p>
                    </div>
                    <div className="ml-4 text-right shrink-0">
                      <div className={`text-2xl font-bold ${
                        (ev.overallScore ?? 0) >= 80 ? "text-green-500" :
                        (ev.overallScore ?? 0) >= 60 ? "text-yellow-500" : "text-destructive"
                      }`}>
                        {ev.overallScore}
                      </div>
                      <p className="text-[10px] text-muted-foreground">score</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <MiniMetric label="Alucinação" value={ev.hallucination ?? 0} inverted />
                    <MiniMetric label="Relevância" value={ev.relevance ?? 0} />
                    <MiniMetric label="Fidelidade" value={ev.faithfulness ?? 0} />
                    <MiniMetric label="Toxicidade" value={ev.toxicity ?? 0} inverted />
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

function MetricBar({ label, value, inverted }: { label: string; value: number; inverted?: boolean }) {
  const percentage = value * 100;
  const color = inverted
    ? percentage > 20 ? "bg-destructive" : percentage > 10 ? "bg-yellow-500" : "bg-green-500"
    : percentage > 80 ? "bg-green-500" : percentage > 60 ? "bg-yellow-500" : "bg-destructive";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-[11px] text-muted-foreground w-10 text-right">{percentage.toFixed(0)}%</span>
    </div>
  );
}

function MiniMetric({ label, value, inverted }: { label: string; value: number; inverted?: boolean }) {
  const percentage = value * 100;
  const color = inverted
    ? percentage > 20 ? "text-destructive" : percentage > 10 ? "text-yellow-500" : "text-green-500"
    : percentage > 80 ? "text-green-500" : percentage > 60 ? "text-yellow-500" : "text-destructive";

  return (
    <div className="text-center">
      <p className={`text-sm font-semibold ${color}`}>{percentage.toFixed(0)}%</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
