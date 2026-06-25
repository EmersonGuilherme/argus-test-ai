import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Bot, Play, Shield, Bug, GitCompare, FileCheck, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function AutonomousTesting() {
  const [projectId] = useState(1);
  const [testType, setTestType] = useState<string>("red_team");
  const [targetPrompt, setTargetPrompt] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runsQuery = trpc.autonomous.runs.list.useQuery({ projectId });
  const statsQuery = trpc.autonomous.runs.stats.useQuery({ projectId });
  const startMutation = trpc.autonomous.runs.start.useMutation({
    onSuccess: (data) => {
      toast.success(`Teste autônomo iniciado! Run #${data.runId}`);
      setIsRunning(false);
      runsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
      setIsRunning(false);
    },
  });

  const handleStartTest = () => {
    setIsRunning(true);
    startMutation.mutate({
      projectId,
      type: testType as any,
      targetPrompt: targetPrompt || undefined,
      customInstructions: customInstructions || undefined,
    });
  };

  const stats = statsQuery.data;
  const runs = runsQuery.data || [];

  const testTypes = [
    { value: "red_team", label: "Red Team", icon: Shield, description: "IA ataca IA — testa prompt injection, jailbreak, data extraction" },
    { value: "regression", label: "Regression", icon: GitCompare, description: "Compara versões — detecta degradação de qualidade" },
    { value: "fuzzing", label: "Fuzzing", icon: Bug, description: "Edge-cases — Unicode, encoding, inputs extremos" },
    { value: "generated", label: "Misto", icon: Bot, description: "Combinação de red-team + fuzzing para cobertura máxima" },
    { value: "compliance", label: "Compliance", icon: FileCheck, description: "EU AI Act + LGPD — verifica conformidade regulatória" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Testes Autônomos com IA</h1>
        <p className="text-muted-foreground">Motor de testes que usa IA para gerar, executar e analisar cenários automaticamente</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.totalRuns || 0}</div>
            <p className="text-xs text-muted-foreground">Total de Execuções</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{(stats?.avgScore || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Score Médio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.totalCases || 0}</div>
            <p className="text-xs text-muted-foreground">Casos Testados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{(stats?.passRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Taxa de Aprovação</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="run" className="space-y-4">
        <TabsList>
          <TabsTrigger value="run">Executar Teste</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="run" className="space-y-4">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Configurar Teste Autônomo
              </CardTitle>
              <CardDescription>A IA vai gerar cenários de teste, executá-los contra o sistema alvo e analisar os resultados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {testTypes.map((type) => (
                  <div
                    key={type.value}
                    onClick={() => setTestType(type.value)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      testType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <type.icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">System Prompt do Alvo (opcional)</label>
                  <Textarea
                    placeholder="Cole aqui o system prompt do sistema que deseja testar..."
                    value={targetPrompt}
                    onChange={(e) => setTargetPrompt(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Instruções Customizadas (opcional)</label>
                  <Textarea
                    placeholder="Ex: Foque em cenários do setor bancário, teste em português..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <Button
                onClick={handleStartTest}
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Executando testes autônomos...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Teste Autônomo
                  </>
                )}
              </Button>

              {isRunning && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">A IA está gerando cenários, executando testes e analisando resultados. Isso pode levar 1-3 minutos.</p>
                  <Progress value={33} className="animate-pulse" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Run History */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              {runs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum teste executado ainda. Inicie seu primeiro teste autônomo!</p>
              ) : (
                <div className="space-y-3">
                  {runs.map((run) => (
                    <RunCard key={run.id} run={run} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RunCard({ run }: { run: any }) {
  const [expanded, setExpanded] = useState(false);
  const detailQuery = trpc.autonomous.runs.get.useQuery(
    { id: run.id },
    { enabled: expanded }
  );

  const statusIcons: Record<string, React.ReactNode> = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
    running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    pending: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  };
  const statusIcon = statusIcons[run.status as string] || <AlertTriangle className="h-4 w-4" />;

  const typeLabel = {
    red_team: "Red Team",
    regression: "Regression",
    fuzzing: "Fuzzing",
    generated: "Misto",
    compliance: "Compliance",
  }[run.type as string] || run.type;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          {statusIcon}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{typeLabel}</span>
              <Badge variant="outline" className="text-xs">{run.triggeredBy}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(run.createdAt).toLocaleString("pt-BR")} — {run.summary || "Em andamento..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {run.score !== null && (
            <Badge variant={run.score >= 70 ? "default" : run.score >= 40 ? "secondary" : "destructive"}>
              {run.score.toFixed(0)}%
            </Badge>
          )}
        </div>
      </div>

      {expanded && detailQuery.data && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {detailQuery.data.aiAnalysis && (
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-1">Análise da IA</h4>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">{detailQuery.data.aiAnalysis}</p>
            </div>
          )}
          {detailQuery.data.cases && detailQuery.data.cases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Casos de Teste ({detailQuery.data.cases.length})</h4>
              {detailQuery.data.cases.slice(0, 5).map((tc: any) => (
                <div key={tc.id} className="flex items-start gap-2 text-xs border rounded p-2">
                  {tc.status === "passed" ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px]">{tc.category}</Badge>
                      <Badge variant={tc.severity === "critical" ? "destructive" : "secondary"} className="text-[10px]">{tc.severity}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 truncate">{tc.input}</p>
                    {tc.reasoning && <p className="text-muted-foreground mt-0.5 italic">{tc.reasoning}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
