import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";

const euAiChecklist = [
  { article: "Art. 6", title: "Classificação de Risco", status: "compliant", description: "Sistema classificado como alto risco — documentação presente" },
  { article: "Art. 9", title: "Gestão de Riscos", status: "compliant", description: "Framework de gestão de riscos implementado com monitoramento contínuo" },
  { article: "Art. 12", title: "Registro e Rastreabilidade", status: "compliant", description: "Audit trail com hash-chain garante rastreabilidade total" },
  { article: "Art. 13", title: "Transparência", status: "partial", description: "Documentação parcial — falta disclosure para usuários finais" },
  { article: "Art. 14", title: "Supervisão Humana", status: "compliant", description: "Guardrails com human-in-the-loop para decisões críticas" },
  { article: "Art. 15", title: "Precisão e Robustez", status: "compliant", description: "Testes autônomos validam precisão e robustez continuamente" },
  { article: "Art. 17", title: "Qualidade de Dados", status: "partial", description: "Políticas de retenção ativas — falta documentação de bias" },
  { article: "Art. 61", title: "Monitoramento Pós-Mercado", status: "compliant", description: "Observabilidade em tempo real com alertas automáticos" },
];

export default function Compliance() {
  const compliant = euAiChecklist.filter(c => c.status === "compliant").length;
  const score = Math.round((compliant / euAiChecklist.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Compliance EU AI Act</h1><p className="text-muted-foreground">Relatório de conformidade com regulamentação europeia de IA</p></div>
        <Button onClick={() => toast.success("Relatório exportado")}><FileText className="h-4 w-4 mr-2" />Exportar Relatório</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-emerald-500">{score}%</div><p className="text-xs text-muted-foreground">Score de Conformidade</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-500">{compliant}/{euAiChecklist.length}</div><p className="text-xs text-muted-foreground">Artigos Conformes</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-500">{euAiChecklist.length - compliant}</div><p className="text-xs text-muted-foreground">Ações Pendentes</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Checklist EU AI Act</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {euAiChecklist.map((item) => (
              <div key={item.article} className="flex items-start gap-3 border rounded p-3">
                {item.status === "compliant" ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2"><Badge variant="outline">{item.article}</Badge><span className="font-medium">{item.title}</span></div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                <Badge variant={item.status === "compliant" ? "default" : "secondary"}>{item.status === "compliant" ? "Conforme" : "Parcial"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
