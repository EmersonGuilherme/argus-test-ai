import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const mockRules = [
  { id: 1, name: "Valor PIX", type: "range", config: "min: 0.01, max: 1000000", status: "active" },
  { id: 2, name: "CPF Válido", type: "regex", config: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$", status: "active" },
  { id: 3, name: "Saldo Não-Negativo", type: "range", config: "min: 0", status: "active" },
  { id: 4, name: "Data Formato BR", type: "format", config: "DD/MM/YYYY", status: "active" },
  { id: 5, name: "Moeda BRL", type: "regex", config: "^R\\$\\s?[\\d.,]+$", status: "active" },
];

const mockResults = [
  { id: 1, ruleName: "Valor PIX", input: "R$ 150,00", expected: "150.00", actual: "150.00", passed: true },
  { id: 2, ruleName: "CPF Válido", input: "123.456.789-00", expected: "valid", actual: "valid", passed: true },
  { id: 3, ruleName: "Saldo Não-Negativo", input: "-50.00", expected: ">= 0", actual: "-50.00", passed: false },
  { id: 4, ruleName: "Valor PIX", input: "R$ 2.000.000,00", expected: "<= 1000000", actual: "2000000", passed: false },
  { id: 5, ruleName: "Data Formato BR", input: "2026-06-20", expected: "DD/MM/YYYY", actual: "YYYY-MM-DD", passed: false },
];

export default function Validation() {
  const passRate = Math.round((mockResults.filter(r => r.passed).length / mockResults.length) * 100);
  const blockRate = 100 - passRate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Validação Determinística</h1><p className="text-muted-foreground">Valide respostas da IA contra regras determinísticas de negócio</p></div>
        <Button onClick={() => toast.success("Validação executada")}><ShieldCheck className="h-4 w-4 mr-2" />Executar Validação</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{mockRules.length}</div><p className="text-xs text-muted-foreground">Regras Ativas</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-500">{passRate}%</div><p className="text-xs text-muted-foreground">Taxa de Aprovação</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-500">{blockRate}%</div><p className="text-xs text-muted-foreground">Taxa de Bloqueio</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{mockResults.length}</div><p className="text-xs text-muted-foreground">Validações Hoje</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Regras de Validação</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between border rounded p-3">
                <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /><div><span className="font-medium">{rule.name}</span><p className="text-xs text-muted-foreground font-mono">{rule.config}</p></div></div>
                <Badge variant="outline">{rule.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Resultados Recentes</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between border rounded p-3">
                <div className="flex items-center gap-3">
                  {result.passed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <div><span className="font-medium">{result.ruleName}</span><p className="text-xs text-muted-foreground">Input: {result.input} | Esperado: {result.expected} | Atual: {result.actual}</p></div>
                </div>
                <Badge variant={result.passed ? "default" : "destructive"}>{result.passed ? "Aprovado" : "Bloqueado"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
