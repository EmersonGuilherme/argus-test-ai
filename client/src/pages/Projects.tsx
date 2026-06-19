import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { FolderOpen, Plus, Key, Link2, Copy, Trash2, Power, PowerOff, Github, BarChart3, Radio, Cloud, MessageSquare, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const integrationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  datadog: BarChart3,
  kafka: Radio,
  aws: Cloud,
  slack: MessageSquare,
  langfuse: Eye,
  langsmith: EyeOff,
};

export default function Projects() {
  const { data: projectsList } = trpc.projects.list.useQuery();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectEnv, setNewProjectEnv] = useState<"development" | "staging" | "production">("development");
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [intDialogOpen, setIntDialogOpen] = useState(false);
  const [newIntType, setNewIntType] = useState<string>("github");
  const [newIntName, setNewIntName] = useState("");

  const utils = trpc.useUtils();
  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      setCreateDialogOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
      toast.success("Projeto criado com sucesso!");
    },
  });

  const generateKey = trpc.keys.generate.useMutation({
    onSuccess: (data) => {
      if (data) {
        setGeneratedKey(data.key);
        if (selectedProject) utils.keys.list.invalidate({ projectId: selectedProject });
        toast.success("API Key gerada com sucesso!");
      }
    },
  });

  const revokeKey = trpc.keys.revoke.useMutation({
    onSuccess: () => {
      if (selectedProject) utils.keys.list.invalidate({ projectId: selectedProject });
      toast.success("API Key revogada");
    },
  });

  const createIntegration = trpc.integrations.create.useMutation({
    onSuccess: () => {
      if (selectedProject) utils.integrations.list.invalidate({ projectId: selectedProject });
      setIntDialogOpen(false);
      setNewIntName("");
      toast.success("Integração adicionada!");
    },
  });

  const toggleIntegration = trpc.integrations.toggle.useMutation({
    onSuccess: () => {
      if (selectedProject) utils.integrations.list.invalidate({ projectId: selectedProject });
    },
  });

  const { data: keysList } = trpc.keys.list.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  const { data: integrationsList } = trpc.integrations.list.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  const activeProject = projectsList?.find(p => p.id === selectedProject);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
            <p className="text-muted-foreground">Gestão de projetos, integrações e API keys</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Projeto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome do Projeto</Label>
                  <Input
                    placeholder="Ex: Banking API - Production"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Descrição breve do projeto"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ambiente</Label>
                  <Select value={newProjectEnv} onValueChange={(v) => setNewProjectEnv(v as typeof newProjectEnv)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createProject.mutate({ name: newProjectName, description: newProjectDesc, environment: newProjectEnv })}
                  disabled={!newProjectName || createProject.isPending}
                >
                  {createProject.isPending ? "A criar..." : "Criar Projeto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsList?.map((project) => (
            <Card
              key={project.id}
              className={`bg-card border-border/50 hover:border-primary/30 transition-all cursor-pointer ${selectedProject === project.id ? "border-primary/60 ring-1 ring-primary/20" : ""}`}
              onClick={() => setSelectedProject(project.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{project.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>
                    </div>
                  </div>
                  <Badge variant={
                    project.status === "active" ? "default" :
                    project.status === "paused" ? "secondary" : "outline"
                  } className="text-[10px]">
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-[10px]">
                  {project.environment}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Project Detail */}
        {selectedProject && activeProject && (
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{activeProject.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="keys">
                <TabsList>
                  <TabsTrigger value="keys" className="gap-1.5">
                    <Key className="h-3.5 w-3.5" />
                    API Keys
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />
                    Integrações
                  </TabsTrigger>
                </TabsList>

                {/* API Keys Tab */}
                <TabsContent value="keys" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Chaves de API para integração com o SDK</p>
                    <Dialog open={keyDialogOpen} onOpenChange={(open) => { setKeyDialogOpen(open); if (!open) setGeneratedKey(null); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1.5">
                          <Plus className="h-3.5 w-3.5" />
                          Gerar Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Gerar Nova API Key</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          {!generatedKey ? (
                            <>
                              <div className="space-y-2">
                                <Label>Nome da Key</Label>
                                <Input
                                  placeholder="Ex: SDK Produção"
                                  value={newKeyName}
                                  onChange={(e) => setNewKeyName(e.target.value)}
                                />
                              </div>
                              <Button
                                className="w-full"
                                onClick={() => generateKey.mutate({ projectId: selectedProject, name: newKeyName })}
                                disabled={!newKeyName || generateKey.isPending}
                              >
                                {generateKey.isPending ? "A gerar..." : "Gerar API Key"}
                              </Button>
                            </>
                          ) : (
                            <div className="space-y-3">
                              <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">Copie esta key agora. Não será mostrada novamente.</p>
                                <code className="text-xs text-primary break-all">{generatedKey}</code>
                              </div>
                              <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => { navigator.clipboard.writeText(generatedKey); toast.success("Key copiada!"); }}
                              >
                                <Copy className="h-4 w-4" />
                                Copiar Key
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    {keysList?.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30">
                        <div className="flex items-center gap-3">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{key.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{key.keyPrefix}...****</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={key.isActive ? "default" : "secondary"} className="text-[10px]">
                            {key.isActive ? "Ativa" : "Revogada"}
                          </Badge>
                          {key.isActive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => revokeKey.mutate({ id: key.id })}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!keysList || keysList.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-6">Nenhuma API key gerada para este projeto</p>
                    )}
                  </div>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Conexões com serviços externos</p>
                    <Dialog open={intDialogOpen} onOpenChange={setIntDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1.5">
                          <Plus className="h-3.5 w-3.5" />
                          Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Integração</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={newIntType} onValueChange={setNewIntType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="github">GitHub</SelectItem>
                                <SelectItem value="datadog">Datadog</SelectItem>
                                <SelectItem value="kafka">Kafka</SelectItem>
                                <SelectItem value="aws">AWS</SelectItem>
                                <SelectItem value="slack">Slack</SelectItem>
                                <SelectItem value="langfuse">LangFuse</SelectItem>
                                <SelectItem value="langsmith">LangSmith</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                              placeholder="Ex: Repo principal"
                              value={newIntName}
                              onChange={(e) => setNewIntName(e.target.value)}
                            />
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => createIntegration.mutate({
                              projectId: selectedProject,
                              type: newIntType as "github" | "datadog" | "kafka" | "aws" | "slack" | "langfuse" | "langsmith",
                              name: newIntName,
                            })}
                            disabled={!newIntName || createIntegration.isPending}
                          >
                            {createIntegration.isPending ? "A adicionar..." : "Adicionar Integração"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    {integrationsList?.map((integration) => {
                      const Icon = integrationIcons[integration.type] || Link2;
                      return (
                        <div key={integration.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30">
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{integration.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{integration.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={integration.isActive ? "default" : "secondary"} className="text-[10px]">
                              {integration.isActive ? "Ativa" : "Inativa"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => toggleIntegration.mutate({ id: integration.id, isActive: !integration.isActive })}
                            >
                              {integration.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {(!integrationsList || integrationsList.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-6">Nenhuma integração configurada</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
