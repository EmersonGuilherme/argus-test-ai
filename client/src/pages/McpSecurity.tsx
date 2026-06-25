import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Server, Scan } from "lucide-react";
import { toast } from "sonner";

const mockServers = [
  { id: 1, name: "Filesystem MCP", url: "stdio://fs-server", status: "active" },
  { id: 2, name: "Database MCP", url: "stdio://db-server", status: "active" },
  { id: 3, name: "Web Search MCP", url: "https://search-mcp.example.com", status: "error" },
];

const mockFindings = [
  { id: 1, scanType: "excessive_permissions", severity: "high", finding: "Server has write access to entire filesystem without restrictions", status: "open" },
  { id: 2, scanType: "data_exfiltration", severity: "critical", finding: "Tool can send file contents to external URLs without user confirmation", status: "open" },
  { id: 3, scanType: "tool_poisoning", severity: "medium", finding: "Tool description contains hidden instructions that override user intent", status: "resolved" },
  { id: 4, scanType: "privilege_escalation", severity: "high", finding: "Server can escalate to admin privileges via chained tool calls", status: "open" },
  { id: 5, scanType: "hidden_instructions", severity: "medium", finding: "System prompt injection detected in tool metadata", status: "open" },
];

export default function McpSecurity() {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); toast.success("Scan concluído"); }, 2000);
  };

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
          <p className="text-muted-foreground">Detecte vulnerabilidades em servidores Model Context Protocol</p>
        </div>
        <Button onClick={handleScan} disabled={scanning}><Scan className="h-4 w-4 mr-2" />{scanning ? "Escaneando..." : "Executar Scan"}</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{mockServers.length}</div><p className="text-xs text-muted-foreground">Servidores MCP</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-red-500">{mockFindings.filter(f => f.severity === "critical").length}</div><p className="text-xs text-muted-foreground">Críticos</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-orange-500">{mockFindings.filter(f => f.severity === "high").length}</div><p className="text-xs text-muted-foreground">Alto Risco</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-500">{mockFindings.filter(f => f.status === "resolved").length}</div><p className="text-xs text-muted-foreground">Resolvidos</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Servidores Registrados</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockServers.map((server) => (
              <div key={server.id} className="flex items-center justify-between border rounded p-3">
                <div className="flex items-center gap-3"><Shield className="h-4 w-4 text-primary" /><div><span className="font-medium">{server.name}</span><p className="text-xs text-muted-foreground">{server.url}</p></div></div>
                <Badge variant={server.status === "active" ? "default" : "destructive"}>{server.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Vulnerabilidades</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockFindings.map((finding) => (
              <div key={finding.id} className="border rounded p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={severityColor(finding.severity)}>{finding.severity}</Badge>
                  <Badge variant="outline">{finding.scanType.replace(/_/g, " ")}</Badge>
                  {finding.status === "resolved" && <Badge variant="secondary">Resolvido</Badge>}
                </div>
                <p className="text-sm">{finding.finding}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
