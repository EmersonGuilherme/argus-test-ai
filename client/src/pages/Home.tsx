import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation, Redirect } from "wouter";
import { Shield, Activity, Zap, Eye, BarChart3, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">AI Test Platform</span>
          </div>
          <a href={getLoginUrl()}>
            <Button variant="default" size="sm" className="gap-2">
              Entrar <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.65_0.18_250_/_0.08),transparent_60%)]" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma de Observabilidade para IA
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Monitorize, depure e melhore os seus{" "}
              <span className="text-primary">sistemas de IA</span>{" "}
              em tempo real
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Saiba em segundos onde está a falha, qual campo causou o erro, e como corrigir.
              Testes de qualidade, segurança e performance — tudo num só lugar.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="gap-2 h-12 px-8">
                  Começar Agora <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tudo o que precisa, num só lugar</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Da observabilidade à segurança, da avaliação de qualidade aos alertas preditivos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: "Traces Distribuídos", desc: "Captura input/output de cada step. Identifica exatamente qual campo falhou e porquê." },
              { icon: Eye, title: "Replay Visual", desc: "Visualize o fluxo completo passo a passo. Veja onde o erro nasceu como um vídeo." },
              { icon: BarChart3, title: "LLM-as-Judge", desc: "Métricas de alucinação, relevância, fidelidade e toxicidade por modelo e prompt." },
              { icon: Lock, title: "Red-Teaming", desc: "Testes de prompt injection, data leakage, jailbreak com severidade e correção." },
              { icon: Zap, title: "Alertas Preditivos", desc: "Deteção de model drift e alertas antes que o problema impacte produção." },
              { icon: Sparkles, title: "Fix Automático", desc: "Sugestão de prompts corrigidos com impacto estimado e aplicação com 1 clique." },
            ].map((f, i) => (
              <div key={i} className="group relative rounded-xl border border-border/50 bg-card/50 p-6 hover:border-primary/30 hover:bg-card transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container text-center text-sm text-muted-foreground">
          AI Test Platform — Observabilidade e Qualidade para Sistemas de IA
        </div>
      </footer>
    </div>
  );
}
