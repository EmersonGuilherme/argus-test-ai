import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Shield, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

export default function Security() {
  const { data: results } = trpc.security.list.useQuery();

  const severityColor = (s: string) => {
    switch (s) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const stats = results ? {
    total: results.length,
    critical: results.filter((r: typeof results[number]) => r.severity === "critical").length,
    high: results.filter((r: typeof results[number]) => r.severity === "high").length,
    passed: results.filter((r: typeof results[number]) => r.status === "safe").length,
    failed: results.filter((r: typeof results[number]) => r.status === "vulnerable").length,
  } : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Segurança & Red Teaming</h1>
          <p className="text-muted-foreground">Testes de prompt injection, data leakage, jailbreak e bypass</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Testes</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-500">{stats.high}</p>
                <p className="text-xs text-muted-foreground">Altos</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-500">{stats.passed}</p>
                <p className="text-xs text-muted-foreground">Passou</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Falhou</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results?.map((result: typeof results[number]) => (
            <Card key={result.id} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      result.status === "safe" ? "bg-green-500/10" : "bg-destructive/10"
                    }`}>
                      {result.status === "safe" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{result.testType.replace("_", " ")}</p>
                        <Badge className={`text-[10px] ${severityColor(result.severity)}`}>
                          {result.severity}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {result.description?.slice(0, 30) || result.testType}
                        </Badge>
                      </div>
                      {result.attackPayload && (
                        <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/10">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Payload de Ataque</p>
                          <p className="text-xs font-mono line-clamp-2">{result.attackPayload}</p>
                        </div>
                      )}
                      {result.response && (
                        <div className="mt-2 p-2 rounded bg-secondary/30">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Resposta do Modelo</p>
                          <p className="text-xs font-mono line-clamp-2">{result.response}</p>
                        </div>
                      )}
                      {result.suggestion && (
                        <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                          <p className="text-[10px] text-primary uppercase tracking-wider mb-1 font-medium">Correção Sugerida</p>
                          <p className="text-xs">{result.suggestion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
