import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { FolderOpen, Plus, Settings, Key, Link2 } from "lucide-react";

export default function Projects() {
  const { data: projectsList } = trpc.projects.list.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
            <p className="text-muted-foreground">Gestão de projetos por cliente e ambiente</p>
          </div>
          <Button className="gap-2" onClick={() => { /* TODO: create project modal */ }}>
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectsList?.map((project) => (
            <Card key={project.id} className="bg-card border-border/50 hover:border-primary/30 transition-all">
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
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <Settings className="h-3 w-3" />
                    {project.environment}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                  <Button size="sm" variant="outline" className="text-xs gap-1 flex-1">
                    <Key className="h-3 w-3" />
                    API Key
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs gap-1 flex-1">
                    <Link2 className="h-3 w-3" />
                    Integrações
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
