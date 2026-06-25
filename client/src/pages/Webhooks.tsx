import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Bell, Plus, Trash2, Send, CheckCircle2, XCircle, Webhook } from "lucide-react";

export default function Webhooks() {
  const [projectId] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", type: "slack" as const, events: ["test_failed", "security_alert"] });

  const webhooksQuery = trpc.autonomous.webhooks.list.useQuery({ projectId });
  const createMutation = trpc.autonomous.webhooks.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Webhook criado! Secret: ${data?.secret}`);
      setShowCreate(false);
      webhooksQuery.refetch();
    },
  });
  const toggleMutation = trpc.autonomous.webhooks.toggle.useMutation({
    onSuccess: () => {
      webhooksQuery.refetch();
    },
  });
  const removeMutation = trpc.autonomous.webhooks.remove.useMutation({
    onSuccess: () => {
      toast.success("Webhook removido");
      webhooksQuery.refetch();
    },
  });
  const testMutation = trpc.autonomous.webhooks.test.useMutation({
    onSuccess: (data) => {
      if (data.success) toast.success(`Webhook testado com sucesso (${data.statusCode})`);
      else toast.error(`Falha no teste: ${data.error}`);
    },
  });

  const eventOptions = [
    { value: "test_failed", label: "Teste Falhou" },
    { value: "security_alert", label: "Alerta de Segurança" },
    { value: "guardrail_blocked", label: "Guardrail Bloqueou" },
    { value: "mcp_vulnerability", label: "Vulnerabilidade MCP" },
    { value: "shadow_ai_detected", label: "Shadow AI Detectado" },
    { value: "compliance_violation", label: "Violação de Compliance" },
    { value: "ci_gate_failed", label: "CI Gate Falhou" },
    { value: "pii_detected", label: "PII Detectado" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks & Notificações</h1>
          <p className="text-muted-foreground">Configure alertas automáticos para Slack, Discord, email ou endpoints customizados</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Webhook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Webhook</DialogTitle>
              <DialogDescription>Configure um endpoint para receber notificações automáticas</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input placeholder="Ex: Alertas Slack #security" value={newWebhook.name} onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">URL do Webhook</label>
                <Input placeholder="https://hooks.slack.com/services/..." value={newWebhook.url} onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <Select value={newWebhook.type} onValueChange={(v) => setNewWebhook({ ...newWebhook, type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="custom">Custom HTTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Eventos</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {eventOptions.map((event) => (
                    <label key={event.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event.value] });
                          } else {
                            setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(ev => ev !== event.value) });
                          }
                        }}
                        className="rounded"
                      />
                      {event.label}
                    </label>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate({ projectId, ...newWebhook })}
                disabled={!newWebhook.name || !newWebhook.url || createMutation.isPending}
              >
                Criar Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhooks Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {webhooksQuery.data && webhooksQuery.data.length > 0 ? (
            <div className="space-y-3">
              {webhooksQuery.data.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      webhook.type === "slack" ? "bg-purple-100 text-purple-600" :
                      webhook.type === "discord" ? "bg-indigo-100 text-indigo-600" :
                      webhook.type === "email" ? "bg-blue-100 text-blue-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{webhook.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{webhook.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-md">{webhook.url}</p>
                      <div className="flex gap-1 mt-1">
                        {(webhook.events as string[] || []).slice(0, 3).map((ev) => (
                          <Badge key={ev} variant="secondary" className="text-[10px]">{ev.replace("_", " ")}</Badge>
                        ))}
                        {(webhook.events as string[] || []).length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">+{(webhook.events as string[]).length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.isActive}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: webhook.id, isActive: checked })}
                    />
                    <Button variant="outline" size="sm" onClick={() => testMutation.mutate({ id: webhook.id })}>
                      <Send className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeMutation.mutate({ id: webhook.id })}>
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum webhook configurado</p>
              <p className="text-xs text-muted-foreground mt-1">Crie webhooks para receber alertas automáticos quando eventos importantes acontecerem</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Eventos Disponíveis</CardTitle>
          <CardDescription>Eventos que podem disparar notificações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {eventOptions.map((event) => (
              <div key={event.value} className="flex items-center gap-3 border rounded p-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div>
                  <span className="text-sm font-medium">{event.label}</span>
                  <p className="text-xs text-muted-foreground font-mono">{event.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
