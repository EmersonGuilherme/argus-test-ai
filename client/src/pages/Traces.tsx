import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Clock, AlertCircle, CheckCircle, Brain, Zap, Server } from "lucide-react";

export default function Traces() {
  const { data: traces, isLoading } = trpc.traces.list.useQuery({});
  const [, navigate] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Traces Distribuídos</h1>
          <p className="text-muted-foreground">Análise detalhada de cada request no seu pipeline</p>
        </div>

        <div className="space-y-3">
          {traces?.map((trace) => (
            <Card
              key={trace.id}
              className="bg-card border-border/50 cursor-pointer hover:border-primary/30 transition-all"
              onClick={() => navigate(`/traces/${trace.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${
                      trace.status === "success" ? "bg-green-500" :
                      trace.status === "failed" ? "bg-red-500" :
                      trace.status === "running" ? "bg-yellow-500 status-pulse" : "bg-gray-500"
                    }`} />
                    <div>
                      <p className="font-mono text-sm font-medium">{trace.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {trace.traceId} · {trace.totalSteps} steps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {trace.rootCause && trace.rootCause !== "unknown" && (
                      <Badge variant="outline" className="text-xs gap-1">
                        {trace.rootCause === "ai" && <Brain className="h-3 w-3" />}
                        {trace.rootCause === "code" && <Zap className="h-3 w-3" />}
                        {trace.rootCause === "infrastructure" && <Server className="h-3 w-3" />}
                        {trace.rootCause}
                      </Badge>
                    )}
                    {trace.failedField && (
                      <Badge variant="destructive" className="text-xs">
                        {trace.failedField}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {trace.totalDuration}ms
                    </div>
                    {trace.financialImpact && (
                      <span className="text-xs font-medium text-chart-5">
                        R$ {trace.financialImpact.toLocaleString()}
                      </span>
                    )}
                    <Badge variant={trace.status === "success" ? "default" : "destructive"} className="text-xs">
                      {trace.status}
                    </Badge>
                  </div>
                </div>
                {trace.rootCauseDetail && (
                  <p className="text-xs text-muted-foreground mt-2 pl-7 line-clamp-1">
                    {trace.rootCauseDetail}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
