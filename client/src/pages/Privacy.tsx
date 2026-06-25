import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, Eye, Clock, FileText, Lock, Trash2, Plus } from "lucide-react";

export default function Privacy() {
  const [projectId] = useState(1);
  const [piiText, setPiiText] = useState("");
  const [maskedResult, setMaskedResult] = useState<{ masked: string; findings: Array<{ type: string; original: string; masked: string }> } | null>(null);

  const retentionQuery = trpc.autonomous.privacy.retentionPolicies.useQuery({ projectId });
  const maskingRulesQuery = trpc.autonomous.privacy.maskingRules.useQuery({ projectId });
  const consentQuery = trpc.autonomous.privacy.consentLog.useQuery({});

  const maskPiiMutation = trpc.autonomous.ai.maskPii.useMutation({
    onSuccess: (data) => {
      setMaskedResult(data);
      toast.success(`${data.findings.length} dados sensíveis encontrados e mascarados`);
    },
  });

  const createRetentionMutation = trpc.autonomous.privacy.createRetentionPolicy.useMutation({
    onSuccess: () => {
      toast.success("Política de retenção criada");
      retentionQuery.refetch();
    },
  });

  const createMaskingRuleMutation = trpc.autonomous.privacy.createMaskingRule.useMutation({
    onSuccess: () => {
      toast.success("Regra de masking criada");
      maskingRulesQuery.refetch();
    },
  });

  const dpiaReportMutation = trpc.autonomous.privacy.dpiaReport.useMutation({
    onSuccess: (data) => {
      toast.success("Relatório DPIA gerado com sucesso");
      // Could open a modal with the report
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LGPD & Privacidade</h1>
        <p className="text-muted-foreground">Conformidade com Lei Geral de Proteção de Dados e gestão de privacidade</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{retentionQuery.data?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Políticas de Retenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{maskingRulesQuery.data?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Regras de Masking</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{consentQuery.data?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Registros de Consentimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">LGPD</div>
                <p className="text-xs text-muted-foreground">Framework Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="masking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="masking">PII Masking</TabsTrigger>
          <TabsTrigger value="retention">Retenção de Dados</TabsTrigger>
          <TabsTrigger value="consent">Consentimento</TabsTrigger>
          <TabsTrigger value="dpia">DPIA</TabsTrigger>
        </TabsList>

        {/* PII Masking Tab */}
        <TabsContent value="masking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Teste de Masking de PII
              </CardTitle>
              <CardDescription>Cole um texto para detectar e mascarar dados pessoais automaticamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ex: O cliente João Silva, CPF 123.456.789-00, email joao@email.com, telefone (11) 98765-4321..."
                value={piiText}
                onChange={(e) => setPiiText(e.target.value)}
                rows={4}
              />
              <Button onClick={() => maskPiiMutation.mutate({ text: piiText })} disabled={!piiText || maskPiiMutation.isPending}>
                {maskPiiMutation.isPending ? "Analisando..." : "Detectar e Mascarar PII"}
              </Button>

              {maskedResult && (
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-700 mb-2">Texto Mascarado</h4>
                    <p className="text-sm font-mono">{maskedResult.masked}</p>
                  </div>
                  {maskedResult.findings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Dados Encontrados ({maskedResult.findings.length})</h4>
                      {maskedResult.findings.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm border rounded p-2">
                          <Badge variant="destructive" className="text-xs">{f.type.toUpperCase()}</Badge>
                          <span className="text-muted-foreground line-through">{f.original}</span>
                          <span>→</span>
                          <span className="font-mono text-green-600">{f.masked}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Masking Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Regras de Masking Configuradas</CardTitle>
              <CardDescription>Regras automáticas aplicadas a todos os traces ingeridos</CardDescription>
            </CardHeader>
            <CardContent>
              {maskingRulesQuery.data && maskingRulesQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {maskingRulesQuery.data.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between border rounded p-3">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{rule.fieldPattern}</span>
                        <Badge variant="outline">{rule.dataCategory}</Badge>
                        <Badge variant="secondary">{rule.maskType}</Badge>
                      </div>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma regra configurada. Adicione regras para mascarar PII automaticamente.</p>
              )}
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  createMaskingRuleMutation.mutate({
                    projectId,
                    fieldPattern: "*.response.content",
                    maskType: "partial",
                    dataCategory: "cpf",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Regra Padrão (CPF)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Retention Tab */}
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Políticas de Retenção de Dados
              </CardTitle>
              <CardDescription>Configure por quanto tempo os dados são mantidos (Art. 16 LGPD)</CardDescription>
            </CardHeader>
            <CardContent>
              {retentionQuery.data && retentionQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {retentionQuery.data.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between border rounded p-3">
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium capitalize">{policy.dataType.replace("_", " ")}</span>
                          <p className="text-xs text-muted-foreground">{policy.retentionDays} dias de retenção</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {policy.autoDelete && <Badge variant="destructive" className="text-xs">Auto-delete</Badge>}
                        {policy.anonymizeOnExpiry && <Badge variant="secondary" className="text-xs">Anonimizar</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma política definida. Crie políticas para conformidade LGPD.</p>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => createRetentionMutation.mutate({
                    projectId,
                    dataType: "traces",
                    retentionDays: 90,
                    autoDelete: true,
                    anonymizeOnExpiry: true,
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Traces (90 dias)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => createRetentionMutation.mutate({
                    projectId,
                    dataType: "security_tests",
                    retentionDays: 180,
                    autoDelete: false,
                    anonymizeOnExpiry: true,
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Security (180 dias)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Tab */}
        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Registro de Consentimento
              </CardTitle>
              <CardDescription>Log imutável de consentimentos (Art. 8 LGPD)</CardDescription>
            </CardHeader>
            <CardContent>
              {consentQuery.data && consentQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {consentQuery.data.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between border rounded p-3">
                      <div>
                        <span className="font-medium">{entry.purpose}</span>
                        <p className="text-xs text-muted-foreground">
                          Base legal: {entry.legalBasis.replace("_", " ")} — {new Date(entry.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant={entry.granted ? "default" : "destructive"}>
                        {entry.granted ? "Concedido" : "Negado"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum registro de consentimento ainda.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DPIA Tab */}
        <TabsContent value="dpia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                DPIA — Relatório de Impacto à Proteção de Dados
              </CardTitle>
              <CardDescription>Gere um relatório DPIA automaticamente com IA (Art. 38 LGPD)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                O DPIA (Data Protection Impact Assessment) é obrigatório pela LGPD quando o tratamento de dados pode resultar em alto risco
                aos direitos e liberdades dos titulares. A IA analisa seus traces, testes de segurança e configurações para gerar um relatório completo.
              </p>
              <Button onClick={() => dpiaReportMutation.mutate({ projectId })} disabled={dpiaReportMutation.isPending}>
                {dpiaReportMutation.isPending ? "Gerando relatório..." : "Gerar Relatório DPIA"}
              </Button>
              {dpiaReportMutation.data && (
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <pre className="text-xs whitespace-pre-wrap">{dpiaReportMutation.data.report}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
