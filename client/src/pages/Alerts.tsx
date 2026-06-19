import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bell, AlertTriangle, TrendingUp, DollarSign, Shield, Gauge, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  threshold_breach: AlertTriangle,
  model_drift: TrendingUp,
  cost_spike: DollarSign,
  security_threat: Shield,
  performance_degradation: Gauge,
};

export default function Alerts() {
  const { data: alertsList, refetch } = trpc.alerts.list.useQuery();
  const resolve = trpc.alerts.resolve.useMutation({
    onSuccess: () => {
      toast.success("Alerta resolvido");
      refetch();
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas & Notificações</h1>
          <p className="text-muted-foreground">Alertas preditivos de model drift, thresholds e anomalias</p>
        </div>

        <div className="space-y-3">
          {alertsList?.map((alert) => {
            const Icon = typeIcons[alert.type] || Bell;
            return (
              <Card key={alert.id} className={`bg-card border-border/50 ${!alert.isResolved ? "border-l-2 border-l-primary" : "opacity-60"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        alert.severity === "critical" ? "bg-red-500/10" :
                        alert.severity === "high" ? "bg-orange-500/10" :
                        "bg-yellow-500/10"
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          alert.severity === "critical" ? "text-red-500" :
                          alert.severity === "high" ? "text-orange-500" :
                          "text-yellow-500"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{alert.title}</p>
                          <Badge className={`text-[10px] ${
                            alert.severity === "critical" ? "bg-red-500/10 text-red-500" :
                            alert.severity === "high" ? "bg-orange-500/10 text-orange-500" :
                            "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {alert.type.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        {alert.metric && (
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Métrica: <code className="bg-secondary px-1 rounded">{alert.metric}</code></span>
                            {alert.currentValue !== null && (
                              <span>Valor atual: <strong className="text-foreground">{alert.currentValue}</strong></span>
                            )}
                            {alert.thresholdValue !== null && (
                              <span>Threshold: <strong className="text-foreground">{alert.thresholdValue}</strong></span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {alert.isResolved ? (
                        <Badge variant="outline" className="text-xs text-green-500 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Resolvido
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolve.mutate({ id: alert.id })}
                          disabled={resolve.isPending}
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
