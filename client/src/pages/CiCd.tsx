import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, CheckCircle2, XCircle, Copy } from "lucide-react";
import { toast } from "sonner";

const mockGates = [
  { id: 1, name: "Quality Score", threshold: 80, current: 87, passed: true },
  { id: 2, name: "Security Score", threshold: 90, current: 92, passed: true },
  { id: 3, name: "Hallucination Rate", threshold: 5, current: 3.2, passed: true },
  { id: 4, name: "Latency P95 (ms)", threshold: 2000, current: 1850, passed: true },
  { id: 5, name: "PII Leak Rate", threshold: 0, current: 0, passed: true },
];

const githubExample = `# .github/workflows/ai-quality.yml
name: AI Quality Gate
on: [push]
jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Argus Quality Gate
        run: |
          curl -X POST https://your-argus.com/api/ci/evaluate \\
            -H "Authorization: Bearer \${{ secrets.ARGUS_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{"projectId": 1, "commitSha": "\${{ github.sha }}"}'`;

export default function CiCd() {
  const [tab, setTab] = useState("gates");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para clipboard");
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">CI/CD Quality Gates</h1><p className="text-muted-foreground">Bloqueie deploys automaticamente se a IA não atender aos padrões</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-500">{mockGates.filter(g => g.passed).length}/{mockGates.length}</div><p className="text-xs text-muted-foreground">Gates Passando</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">Deploy</div><p className="text-xs text-muted-foreground text-green-500">Aprovado</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">v2.4.1</div><p className="text-xs text-muted-foreground">Última Versão</p></CardContent></Card>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList><TabsTrigger value="gates">Quality Gates</TabsTrigger><TabsTrigger value="integration">Integração</TabsTrigger></TabsList>
        <TabsContent value="gates">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" /> Gates Configurados</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockGates.map((gate) => (
                  <div key={gate.id} className="flex items-center justify-between border rounded p-3">
                    <div className="flex items-center gap-3">
                      {gate.passed ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="font-medium">{gate.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Threshold: {gate.threshold}</span>
                      <Badge variant={gate.passed ? "default" : "destructive"}>Atual: {gate.current}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integration">
          <Card><CardHeader><CardTitle>GitHub Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="relative">
                <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => copyToClipboard(githubExample)}><Copy className="h-4 w-4" /></Button>
                <pre className="bg-zinc-900 text-zinc-100 p-4 rounded text-xs overflow-x-auto">{githubExample}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
