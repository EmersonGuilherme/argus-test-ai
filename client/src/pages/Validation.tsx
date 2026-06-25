import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, ShieldCheck, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Validation() {
  const [projectId] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", type: "range" as string, config: "" });
  const [testValue, setTestValue] = useState("");
  const [testRuleId, setTestRuleId] = useState<number | null>(null);

  const rulesQuery = trpc.features.validation.rules.useQuery({ projectId });
  const resultsQuery = trpc.features.validation.results.useQuery({ projectId, limit: 20 });
  const statsQuery = trpc.features.validation.stats.useQuery({ projectId });

  const createMutation = trpc.features.validation.createRule.useMutation({
    onSuccess: () => { toast.success("Regra criada!"); setShowCreate(false); rulesQuery.refetch(); statsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.features.validation.deleteRule.useMutation({
    onSuccess: () => { toast.success("Regra removida"); rulesQuery.refetch(); statsQuery.refetch(); },
  });

  const executeMutation = trpc.features.validation.execute.useMutation({
    onSuccess: (data) => {
      if (data.passed) toast.success("Validação aprovada!");
      else toast.error(`Bloqueado! Esperado: ${data.expectedValue}`);
      resultsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const stats = statsQuery.data;
  const rules = rulesQuery.data || [];
  const results = resultsQuery.data || [];

  const handleCreate = () => {
    let config: any = {};
    try { config = JSON.parse(newRule.config); } catch { config = { value: newRule.config }; }
    createMutation.mutate({ projectId, name: newRule.name, type: newRule.type as any, config });
  };

  const handleExecute = () => {
    if (!testRuleId || !testValue) { toast.error("Selecione uma regra e insira um valor"); return; }
    executeMutation.mutate({ projectId, ruleId: testRuleId, value: testValue });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Validação Determinística</h1>
          <p className="text-muted-foreground">Valide respostas da IA contra regras determinísticas de negócio</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Regra</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Regra de Validação</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome da regra" value={newRule.name} onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))} />
              <Select value={newRule.type} onValueChange={v => setNewRule(p => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="range">Range (min/max)</SelectItem>
                  <SelectItem value="regex">Regex</SelectItem>
                  <SelectItem value="exact_match">Exact Match</SelectItem>
                  <SelectItem value="format">Format</SelectItem>
                  <SelectItem value="cross_reference">Cross Reference</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder='Config JSON: {"min": 0, "max": 1000}' value={newRule.config} onChange={e => setNewRule(p => ({ ...p, config: e.target.value }))} />
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Criar Regra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.totalRules || 0}</div><p className="text-xs text-muted-foreground">Regras Ativas</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-500">{stats?.passRate || 0}%</div><p className="text-xs text-muted-foreground">Taxa de Aprovação</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-500">{stats?.blockRate || 0}%</div><p className="text-xs text-muted-foreground">Taxa de Bloqueio</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.totalResults || 0}</div><p className="text-xs text-muted-foreground">Validações Total</p></CardContent></Card>
      </div>

      {/* Test Execution */}
      <Card>
        <CardHeader><CardTitle>Testar Validação</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select value={testRuleId?.toString() || ""} onValueChange={v => setTestRuleId(Number(v))}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Selecione regra" /></SelectTrigger>
              <SelectContent>
                {rules.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Valor para validar" value={testValue} onChange={e => setTestValue(e.target.value)} className="flex-1" />
            <Button onClick={handleExecute} disabled={executeMutation.isPending}>
              {executeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <Card>
        <CardHeader><CardTitle>Regras de Validação</CardTitle></CardHeader>
        <CardContent>
          {rulesQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : rules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma regra criada. Clique em "Nova Regra" para começar.</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between border rounded p-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-medium">{rule.name}</span>
                      <p className="text-xs text-muted-foreground font-mono">{JSON.stringify(rule.config)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rule.type}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate({ id: rule.id })}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader><CardTitle>Resultados Recentes</CardTitle></CardHeader>
        <CardContent>
          {resultsQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : results.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma validação executada ainda.</p>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.id} className="flex items-center justify-between border rounded p-3">
                  <div className="flex items-center gap-3">
                    {result.passed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    <div>
                      <span className="font-medium">Regra #{result.ruleId}</span>
                      <p className="text-xs text-muted-foreground">Valor: {result.actualValue} | Esperado: {result.expectedValue}</p>
                    </div>
                  </div>
                  <Badge variant={result.passed ? "default" : "destructive"}>{result.passed ? "Aprovado" : "Bloqueado"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
