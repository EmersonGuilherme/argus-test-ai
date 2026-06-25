import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Link2 } from "lucide-react";
import { toast } from "sonner";

const mockAudit = [
  { id: 1, action: "project.created", resource: "Project #1", hash: "a3f2b1c4", previousHash: "00000000", createdAt: "2026-06-20T10:00:00Z" },
  { id: 2, action: "test.executed", resource: "Security Test", hash: "b7d4e2f1", previousHash: "a3f2b1c4", createdAt: "2026-06-20T10:05:00Z" },
  { id: 3, action: "evaluation.created", resource: "Eval #12", hash: "c1a8f3d2", previousHash: "b7d4e2f1", createdAt: "2026-06-20T10:10:00Z" },
  { id: 4, action: "guardrail.blocked", resource: "PII Detection", hash: "d9e5b4c3", previousHash: "c1a8f3d2", createdAt: "2026-06-20T10:15:00Z" },
  { id: 5, action: "model.deployed", resource: "GPT-4o v2", hash: "e2f6a7d4", previousHash: "d9e5b4c3", createdAt: "2026-06-20T10:20:00Z" },
];

export default function AuditTrail() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Audit Trail</h1><p className="text-muted-foreground">Registro imutável com hash-chain SHA-256</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Integridade verificada")}><CheckCircle2 className="h-4 w-4 mr-2" />Verificar</Button>
          <Button variant="outline" onClick={() => toast.success("Exportação iniciada")}><FileText className="h-4 w-4 mr-2" />Exportar</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{mockAudit.length}</div><p className="text-xs text-muted-foreground">Total Registros</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-500">Íntegra</div><p className="text-xs text-muted-foreground">Status Cadeia</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold font-mono">{mockAudit[mockAudit.length-1]?.hash}</div><p className="text-xs text-muted-foreground">Último Hash</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5" /> Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAudit.map((entry, i) => (
              <div key={entry.id} className="flex items-start gap-4 border rounded p-3">
                <div className="flex flex-col items-center"><div className="w-3 h-3 rounded-full bg-emerald-500" />{i < mockAudit.length - 1 && <div className="w-0.5 h-8 bg-border mt-1" />}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><Badge variant="outline">{entry.action}</Badge><span className="text-sm text-muted-foreground">{entry.resource}</span></div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground"><span className="font-mono">Hash: {entry.hash}</span><span className="font-mono">Prev: {entry.previousHash}</span><span>{new Date(entry.createdAt).toLocaleString("pt-BR")}</span></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
