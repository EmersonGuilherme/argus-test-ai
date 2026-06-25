import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Server, AlertTriangle, Plus, Loader2, Scan, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function McpSecurity() {
  const [projectId] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [newServer, setNewServer] = useState({ name: "", url: "", protocol: "stdio" });

  const serversQuery = trpc.features.mcp.servers.useQuery({ projectId });
  const resultsQuery = trpc.features.mcp.scanResults.useQuery({ projectId });
  const statsQuery = trpc.features.mcp.stats.useQuery({ projectId });

  const addMutation = trpc.features.mcp.addServer.useMutation({
    onSuccess: () => { toast.success("Servidor MCP registrado!"); setShowAdd(false); serversQuery.refetch(); statsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const removeMutation = trpc.features.mcp.removeServer.useMutation({
    onSuccess: () => { toast.success("Servidor removido"); serversQuery.refetch(); resultsQuery.refetch(); statsQuery.refetch(); },
  });

  const scanMutation = trpc.features.mcp.scan.useMutation({
    onSuccess: (data) => { toast.success(`Scan concluído! ${data.findings} vulnerabilidades encontradas`); resultsQuery.refetch(); statsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const stats = statsQuery.data;
  const servers = serversQuery.data || [];
  const findings = resultsQuery.data || [];

  const severityColor = (s: string) => {
    if (s === "critical") return "bg-red-500/10 text-red-500 border-red-500/20";
    if (s === "high") return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (s === "medium") return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">MCP Security Scanner</h1>
          <p className="text-muted-foreground">Analise servidores Model Context Protocol para vulnerabilidades</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Registrar Servidor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Servidor MCP</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome do servidor" value={newServer.name} onChange={e => setNewServer(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="URL ou caminho (ex: npx @modelcontextprotocol/server-filesystem)" value={newServer.url} onChange={e => setNewServer(p => ({ ...p, url: e.target.value }))} />
              <Input placeholder="Protocolo (stdio, http, sse)" value={newServer.protocol} onChange={e => setNewServer(p => ({ ...p, protocol: e.target.value }))} />
              <Button onClick={() => addMutation.mutate({ projectId, ...newServer })} disabled={addMutation.isPending} className="w-full">
                {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.totalServers || 0}</div><p className="text-xs text-muted-foreground">Servidores MCP</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-500">{stats?.criticalFindings || 0}</div><p className="text-xs text-muted-foreground">Críticos/Alto</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-yellow-500">{stats?.openFindings || 0}</div><p className="text-xs text-muted-foreground">Findings Abertos</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{stats?.totalFindings || 0}</div><p className="text-xs text-muted-foreground">Total de Findings</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Servidores Registrados</CardTitle></CardHeader>
        <CardContent>
          {serversQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : servers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum servidor registrado. Clique em "Registrar Servidor" para começar.</p>
          ) : (
            <div className="space-y-3">
              {servers.map((server) => (
                <div key={server.id} className="flex items-center justify-between border rounded p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-medium">{server.name}</span>
                      <p className="text-xs text-muted-foreground font-mono">{server.url}</p>
                      <p className="text-xs text-muted-foreground">Protocolo: {server.protocol} | Último scan: {server.lastScanAt ? new Date(server.lastScanAt).toLocaleString() : "Nunca"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={server.status === "active" ? "default" : "destructive"}>{server.status}</Badge>
                    <Button variant="outline" size="sm" onClick={() => scanMutation.mutate({ serverId: server.id })} disabled={scanMutation.isPending}>
                      {scanMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Scan className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeMutation.mutate({ id: server.id })}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Vulnerabilidades Detectadas</CardTitle></CardHeader>
        <CardContent>
          {resultsQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : findings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma vulnerabilidade encontrada. Execute um scan para verificar.</p>
          ) : (
            <div className="space-y-3">
              {findings.map((finding) => (
                <div key={finding.id} className="border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={severityColor(finding.severity)}>{finding.severity}</Badge>
                      <Badge variant="outline">{finding.scanType.replace(/_/g, " ")}</Badge>
                    </div>
                    <Badge variant={finding.status === "open" ? "destructive" : "secondary"}>{finding.status}</Badge>
                  </div>
                  <p className="text-sm">{finding.finding}</p>
                  {finding.recommendation && (
                    <p className="text-xs text-muted-foreground mt-1"><strong>Recomendação:</strong> {finding.recommendation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
