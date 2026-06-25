import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Plus, Users, Crown, Shield, Eye } from "lucide-react";

export default function Organizations() {
  const [showCreate, setShowCreate] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "" });

  const orgsQuery = trpc.autonomous.orgs.list.useQuery();
  const createMutation = trpc.autonomous.orgs.create.useMutation({
    onSuccess: () => {
      toast.success("Organização criada com sucesso!");
      setShowCreate(false);
      orgsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const roleIcons: Record<string, React.ReactNode> = {
    owner: <Crown className="h-3 w-3 text-yellow-500" />,
    admin: <Shield className="h-3 w-3 text-blue-500" />,
    editor: <Users className="h-3 w-3 text-green-500" />,
    viewer: <Eye className="h-3 w-3 text-gray-500" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizações</h1>
          <p className="text-muted-foreground">Gerencie times, convites e permissões de acesso</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nova Organização</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Organização</DialogTitle>
              <DialogDescription>Crie um espaço de trabalho para seu time</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Organização</label>
                <Input
                  placeholder="Ex: Minha Empresa"
                  value={newOrg.name}
                  onChange={(e) => {
                    setNewOrg({
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                    });
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug (URL)</label>
                <Input
                  placeholder="minha-empresa"
                  value={newOrg.slug}
                  onChange={(e) => setNewOrg({ ...newOrg, slug: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Usado na URL: app.argustestai.com/{newOrg.slug || "slug"}</p>
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate(newOrg)}
                disabled={!newOrg.name || !newOrg.slug || createMutation.isPending}
              >
                Criar Organização
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Organizations List */}
      {orgsQuery.data && orgsQuery.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orgsQuery.data.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">/{org.slug}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={org.plan === "enterprise" ? "default" : org.plan === "pro" ? "secondary" : "outline"} className="capitalize">
                    {org.plan}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Máx. membros: {org.maxMembers}</span>
                  <span className="text-muted-foreground">Criado: {new Date(org.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">Nenhuma organização</h3>
            <p className="text-muted-foreground mt-1">Crie uma organização para colaborar com seu time</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Organização
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Roles Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Níveis de Acesso</CardTitle>
          <CardDescription>Permissões por role na organização</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { role: "owner", label: "Owner", perms: "Acesso total, billing, deletar org" },
              { role: "admin", label: "Admin", perms: "Gerenciar membros, projetos, configurações" },
              { role: "editor", label: "Editor", perms: "Criar/editar testes, ver resultados" },
              { role: "viewer", label: "Viewer", perms: "Apenas visualizar dashboards e relatórios" },
            ].map((item) => (
              <div key={item.role} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {roleIcons[item.role]}
                  <span className="font-medium">{item.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.perms}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
