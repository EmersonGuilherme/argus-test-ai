import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Sparkles, Check, X, ArrowRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function PromptSuggestions() {
  const { data: suggestions, refetch } = trpc.prompts.list.useQuery();
  const apply = trpc.prompts.applyPrompt.useMutation({
    onSuccess: () => {
      toast.success("Prompt aplicado com sucesso");
      refetch();
    },
  });
  const reject = trpc.prompts.rejectPrompt.useMutation({
    onSuccess: () => {
      toast.info("Sugestão rejeitada");
      refetch();
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sugestões de Prompts</h1>
          <p className="text-muted-foreground">Correções automáticas com impacto estimado e aplicação direta</p>
        </div>

        <div className="space-y-4">
          {suggestions?.map((s) => (
            <Card key={s.id} className={`bg-card border-border/50 ${s.status === "pending" ? "border-l-2 border-l-primary" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <Badge variant={
                        s.status === "pending" ? "default" :
                        s.status === "applied" ? "outline" : "secondary"
                      } className="text-xs">
                        {s.status === "pending" ? "Pendente" : s.status === "applied" ? "Aplicado" : "Rejeitado"}
                      </Badge>
                      {s.estimatedImpact && (
                        <Badge variant="outline" className="text-xs gap-1 text-green-500 border-green-500/30">
                          <TrendingUp className="h-3 w-3" />
                          +{s.estimatedImpact}% melhoria estimada
                        </Badge>
                      )}
                    </div>

                    {/* Current vs Suggested */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                        <p className="text-[10px] text-destructive uppercase tracking-wider font-medium mb-2">Prompt Atual</p>
                        <p className="text-xs font-mono whitespace-pre-wrap">{s.currentPrompt}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                        <p className="text-[10px] text-green-500 uppercase tracking-wider font-medium mb-2">Prompt Sugerido</p>
                        <p className="text-xs font-mono whitespace-pre-wrap">{s.suggestedPrompt}</p>
                      </div>
                    </div>

                    {s.improvementReason && (
                      <p className="text-xs text-muted-foreground mt-3 italic">
                        Razão: {s.improvementReason}
                      </p>
                    )}
                  </div>

                  {s.status === "pending" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => apply.mutate({ id: s.id })}
                        disabled={apply.isPending}
                      >
                        <Check className="h-3 w-3" />
                        Aplicar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => reject.mutate({ id: s.id })}
                        disabled={reject.isPending}
                      >
                        <X className="h-3 w-3" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
