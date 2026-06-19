import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { ArrowDown, CheckCircle, XCircle, AlertTriangle, Clock, Brain, Server, Database, Radio, Globe, HardDrive, Cpu } from "lucide-react";

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  api_gateway: Globe,
  lambda: Cpu,
  agent_ai: Brain,
  kafka: Radio,
  database: Database,
  external_api: Globe,
  queue: Radio,
  cache: HardDrive,
  mainframe: Server,
};

export default function TraceDetail() {
  const params = useParams<{ id: string }>();
  const { data: trace, isLoading } = trpc.traces.detail.useQuery({ id: Number(params.id) });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">A carregar trace...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!trace) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">Trace não encontrado</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">{trace.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Trace ID: {trace.traceId} · {trace.totalSteps} steps · {trace.totalDuration}ms
            </p>
          </div>
          <div className="flex items-center gap-2">
            {trace.rootCause && trace.rootCause !== "unknown" && (
              <Badge variant="outline" className="gap-1">
                Causa: {trace.rootCause}
              </Badge>
            )}
            <Badge variant={trace.status === "success" ? "default" : "destructive"}>
              {trace.status}
            </Badge>
          </div>
        </div>

        {/* Root Cause Card */}
        {trace.rootCauseDetail && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Causa Raiz Identificada</p>
                  <p className="text-sm text-muted-foreground mt-1">{trace.rootCauseDetail}</p>
                  {trace.failedField && (
                    <p className="text-xs mt-2">
                      Campo com falha: <code className="bg-destructive/10 px-1.5 py-0.5 rounded text-destructive">{trace.failedField}</code>
                    </p>
                  )}
                  {trace.financialImpact && (
                    <p className="text-xs mt-1 text-chart-5 font-medium">
                      Impacto financeiro estimado: R$ {trace.financialImpact.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual Replay */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Replay Visual do Fluxo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {trace.steps?.map((step, index) => {
                const Icon = serviceIcons[step.serviceType] || Server;
                const isLast = index === (trace.steps?.length ?? 0) - 1;

                return (
                  <div key={step.id}>
                    <div className={`relative p-4 rounded-xl border transition-all ${
                      step.status === "failed" ? "border-destructive/50 bg-destructive/5" :
                      step.status === "warning" ? "border-yellow-500/50 bg-yellow-500/5" :
                      "border-border/50 bg-secondary/20"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            step.status === "failed" ? "bg-destructive/10" :
                            step.status === "warning" ? "bg-yellow-500/10" :
                            "bg-primary/10"
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              step.status === "failed" ? "text-destructive" :
                              step.status === "warning" ? "text-yellow-500" :
                              "text-primary"
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{step.name}</p>
                              <Badge variant="outline" className="text-[10px] h-5">
                                {step.serviceType.replace("_", " ")}
                              </Badge>
                            </div>
                            {step.errorMessage && (
                              <p className="text-xs text-destructive mt-1 font-mono">
                                {step.errorMessage}
                              </p>
                            )}
                            {step.errorField && (
                              <p className="text-xs mt-1">
                                Campo: <code className="bg-destructive/10 px-1 rounded text-destructive">{step.errorField}</code>
                              </p>
                            )}
                            {step.prompt && (
                              <div className="mt-2 p-2 rounded bg-secondary/50 text-xs">
                                <p className="text-muted-foreground mb-1 font-medium">Prompt:</p>
                                <p className="font-mono">{step.prompt}</p>
                              </div>
                            )}
                            {step.llmResponse && (
                              <div className="mt-1 p-2 rounded bg-primary/5 text-xs">
                                <p className="text-muted-foreground mb-1 font-medium">Resposta LLM:</p>
                                <p className="font-mono">{step.llmResponse}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {step.duration && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {step.duration}ms
                            </span>
                          )}
                          {step.tokensUsed && (
                            <span className="text-xs text-muted-foreground">
                              {step.tokensUsed} tokens
                            </span>
                          )}
                          {step.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {step.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                          {step.status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </div>

                      {/* Input/Output Data */}
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {step.inputData ? (
                          <div className="p-2 rounded bg-secondary/30 text-xs">
                            <p className="text-muted-foreground mb-1 font-medium text-[10px] uppercase tracking-wider">Input</p>
                            <pre className="font-mono text-[11px] whitespace-pre-wrap overflow-hidden">
                              {JSON.stringify(step.inputData as Record<string, unknown>, null, 2)}
                            </pre>
                          </div>
                        ) : null}
                        {step.outputData ? (
                          <div className="p-2 rounded bg-secondary/30 text-xs">
                            <p className="text-muted-foreground mb-1 font-medium text-[10px] uppercase tracking-wider">Output</p>
                            <pre className="font-mono text-[11px] whitespace-pre-wrap overflow-hidden">
                              {JSON.stringify(step.outputData as Record<string, unknown>, null, 2)}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Arrow connector */}
                    {!isLast && (
                      <div className="flex justify-center py-1">
                        <ArrowDown className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
