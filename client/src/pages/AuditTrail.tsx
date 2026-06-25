import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Shield, Loader2, Download, Link2 } from "lucide-react";
import { toast } from "sonner";

export default function AuditTrail() {
  const [projectId] = useState(1);

  const listQuery = trpc.features.audit.list.useQuery({ projectId, limit: 50 });
  const statsQuery = trpc.features.audit.stats.useQuery({ projectId });

  const verifyMutation = trpc.features.audit.verifyIntegrity.useMutation({
    onSuccess: (data) => {
      if (data.valid) toast.success(`Integridade verificada! ${data.totalEntries} registros válidos.`);
      else toast.error(`Integridade comprometida no registro #${data.brokenAt}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const recordMutation = trpc.features.audit.record.useMutation({
    onSuccess: () => {
      toast.success("Registro criado!");
      listQuery.refetch();
      statsQuery.refetch();
    },
  });

  const stats = statsQuery.data;
  const entries = listQuery.data || [];

  const handleExport = () => {
    const csv = "ID,Action,Resource,Hash,PreviousHash,CreatedAt\n" +
      entries.map(e => `${e.id},"${e.action}","${e.resource || ""}","${e.hash}","${e.previousHash || ""}","${e.createdAt}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audit-trail.csv"; a.click();
    toast.success("Exportado!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">Trilha de auditoria imutável com hash-chain criptográfico SHA-256</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => verifyMutation.mutate({ projectId })} disabled={verifyMutation.isPending}>
            {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
            Verificar Integridade
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />Exportar CSV
          </Button>
          <Button onClick={() => recordMutation.mutate({ projectId, action: "manual_entry", resource: "test", details: { note: "Registro manual" } })}>
            <FileText className="h-4 w-4 mr-2" />Novo Registro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.totalEntries || 0}</div><p className="text-xs text-muted-foreground">Total de Registros</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-blue-500">{stats?.todayEntries || 0}</div><p className="text-xs text-muted-foreground">Registros Hoje</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.uniqueActions || 0}</div><p className="text-xs text-muted-foreground">Ações Únicas</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Hash-Chain Timeline</CardTitle></CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum registro na trilha de auditoria.</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-4 border rounded p-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    {i < entries.length - 1 && <div className="w-0.5 h-8 bg-border mt-1" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{entry.action}</Badge>
                      {entry.resource && <span className="text-sm text-muted-foreground">{entry.resource}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="font-mono">Hash: {entry.hash?.substring(0, 16)}...</span>
                      {entry.previousHash && <span className="font-mono">Prev: {entry.previousHash.substring(0, 16)}...</span>}
                      <span>{entry.createdAt ? new Date(entry.createdAt).toLocaleString("pt-BR") : ""}</span>
                    </div>
                    {entry.details ? (
                      <p className="text-xs text-muted-foreground mt-1">{String(JSON.stringify(entry.details)).substring(0, 100)}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
