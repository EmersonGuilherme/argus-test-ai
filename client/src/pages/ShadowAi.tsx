import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertTriangle, Scan } from "lucide-react";
import { toast } from "sonner";

const mockFindings = [
  { id: 1, toolName: "ChatGPT (OpenAI)", category: "chatbot", riskLevel: "high", department: "Atendimento", usersAffected: 23, dataExposure: "Dados de clientes compartilhados em prompts" },
  { id: 2, toolName: "GitHub Copilot", category: "code_assistant", riskLevel: "medium", department: "Engenharia", usersAffected: 15, dataExposure: "Código proprietário exposto" },
  { id: 3, toolName: "Claude (Anthropic)", category: "chatbot", riskLevel: "high", department: "Jurídico", usersAffected: 8, dataExposure: "Contratos confidenciais" },
  { id: 4, toolName: "Midjourney", category: "image_gen", riskLevel: "low", department: "Marketing", usersAffected: 5, dataExposure: "Materiais de marca" },
  { id: 5, toolName: "API não-autorizada", category: "api_call", riskLevel: "critical", department: "Dados", usersAffected: 3, dataExposure: "PII de clientes via API externa" },
];

export default function ShadowAi() {
  const riskColor = (r: string) => {
    if (r === "critical") return "bg-red-500/10 text-red-500";
    if (r === "high") return "bg-orange-500/10 text-orange-500";
    if (r === "medium") return "bg-yellow-500/10 text-yellow-500";
    return "bg-green-500/10 text-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Shadow AI Detection</h1><p className="text-muted-foreground">Detecte uso não-autorizado de IA na organização</p></div>
        <Button onClick={() => toast.success("Scan de rede iniciado")}><Scan className="h-4 w-4 mr-2" />Executar Scan</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{mockFindings.length}</div><p className="text-xs text-muted-foreground">Ferramentas Detectadas</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-500">{mockFindings.filter(f => f.riskLevel === "critical" || f.riskLevel === "high").length}</div><p className="text-xs text-muted-foreground">Alto Risco</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{mockFindings.reduce((sum, f) => sum + f.usersAffected, 0)}</div><p className="text-xs text-muted-foreground">Usuários Afetados</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">4</div><p className="text-xs text-muted-foreground">Departamentos</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Achados</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockFindings.map((finding) => (
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
                <p className="text-xs text-muted-foreground mt-1">{finding.usersAffected} usuários afetados</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
