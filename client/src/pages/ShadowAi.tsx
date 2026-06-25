import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertTriangle, Scan, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ShadowAi() {
  const [projectId] = useState(1);

  const findingsQuery = trpc.features.shadow.findings.useQuery({ projectId });
  const statsQuery = trpc.features.shadow.stats.useQuery({ projectId });

  const scanMutation = trpc.features.shadow.scan.useMutation({
    onSuccess: (data) => { toast.success(`Scan concluído! ${data.findings} achados`); findingsQuery.refetch(); statsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const stats = statsQuery.data;
  const findings = findingsQuery.data || [];

  const riskColor = (r: string) => {
    if (r === "critical") return "bg-red-500/10 text-red-500";
    if (r === "high") return "bg-orange-500/10 text-orange-500";
    if (r === "medium") return "bg-yellow-500/10 text-yellow-500";
    return "bg-green-500/10 text-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shadow AI Detection</h1>
          <p className="text-muted-foreground">Detecte uso não-autorizado de IA na organização</p>
        </div>
        <Button onClick={() => scanMutation.mutate({ projectId })} disabled={scanMutation.isPending}>
          {scanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Scan className="h-4 w-4 mr-2" />}
          Executar Scan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.totalFindings || 0}</div><p className="text-xs text-muted-foreground">Ferramentas Detectadas</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-500">{stats?.criticalFindings || 0}</div><p className="text-xs text-muted-foreground">Alto Risco</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.usersAtRisk || 0}</div><p className="text-xs text-muted-foreground">Usuários Afetados</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.departments || 0}</div><p className="text-xs text-muted-foreground">Departamentos</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Achados</CardTitle></CardHeader>
        <CardContent>
          {findingsQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : findings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum achado. Execute um scan para detectar uso não-autorizado de IA.</p>
          ) : (
            <div className="space-y-3">
              {findings.map((finding) => (
                <div key={finding.id} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">{finding.toolName}</span>
                      <Badge className={riskColor(finding.riskLevel)}>{finding.riskLevel}</Badge>
                    </div>
                    <Badge variant="outline">{finding.department}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{finding.dataExposure}</p>
                  <p className="text-xs text-muted-foreground mt-1">{finding.usersAffected} usuários afetados | Categoria: {finding.category}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
