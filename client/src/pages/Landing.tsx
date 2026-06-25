import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Shield, Eye, Bot, Zap, GitBranch, Lock, CheckCircle2, ArrowRight, Globe, Building2, Code } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-400" />
            <span className="text-xl font-bold">Argus Test AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-zinc-300 hover:text-white" onClick={() => window.location.href = getLoginUrl()}>
              Login
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium" onClick={() => window.location.href = getLoginUrl()}>
              Começar Grátis
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            Plataforma #1 de Testes Autônomos de IA
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Teste, proteja e monitore sua IA
            <span className="text-emerald-400"> antes que ela falhe em produção</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-10">
            Observabilidade completa, testes autônomos com IA, guardrails em tempo real, 
            compliance LGPD/EU AI Act e segurança MCP — tudo em uma única plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium text-lg px-8" onClick={() => window.location.href = getLoginUrl()}>
              Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-lg px-8" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
              Ver Features
            </Button>
          </div>
          <p className="text-sm text-zinc-500 mt-4">Sem cartão de crédito. Setup em 5 minutos.</p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-zinc-800 px-6 py-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-zinc-500 mb-6">CONFIADO POR EQUIPES DE IA EM</p>
          <div className="flex flex-wrap justify-center gap-8 text-zinc-600">
            <div className="flex items-center gap-2"><Building2 className="h-5 w-5" /><span className="font-medium">Fintechs</span></div>
            <div className="flex items-center gap-2"><Globe className="h-5 w-5" /><span className="font-medium">SaaS</span></div>
            <div className="flex items-center gap-2"><Shield className="h-5 w-5" /><span className="font-medium">Bancos</span></div>
            <div className="flex items-center gap-2"><Code className="h-5 w-5" /><span className="font-medium">Startups</span></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa para IA segura</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Uma plataforma unificada que substitui 5+ ferramentas separadas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bot, title: "Testes Autônomos", desc: "IA testa IA — red-teaming, fuzzing e regression automáticos sem intervenção humana", color: "text-emerald-400" },
              { icon: Eye, title: "Observabilidade Total", desc: "Traces, latência, tokens, custo — visibilidade completa de cada chamada LLM", color: "text-blue-400" },
              { icon: Shield, title: "Guardrails Real-time", desc: "Bloqueie PII, conteúdo tóxico e respostas incorretas antes de chegarem ao usuário", color: "text-purple-400" },
              { icon: Lock, title: "Segurança MCP", desc: "Scanner pioneiro de vulnerabilidades em servidores MCP — tool poisoning, data exfiltration", color: "text-red-400" },
              { icon: GitBranch, title: "CI/CD Quality Gates", desc: "Bloqueie deploys automaticamente se a IA não atender aos padrões de qualidade", color: "text-orange-400" },
              { icon: Zap, title: "Compliance Automático", desc: "LGPD + EU AI Act — relatórios gerados por IA, masking de PII, retenção de dados", color: "text-yellow-400" },
            ].map((feature, i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardContent className="pt-6">
                  <feature.icon className={`h-8 w-8 ${feature.color} mb-4`} />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing simples e transparente</h2>
            <p className="text-zinc-400">Comece grátis, escale conforme cresce</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { plan: "Free", price: "R$ 0", period: "/mês", features: ["1.000 traces/mês", "5 testes autônomos", "Guardrails básicos", "1 projeto", "Community support"], cta: "Começar Grátis", highlight: false },
              { plan: "Pro", price: "R$ 297", period: "/mês", features: ["50.000 traces/mês", "Testes ilimitados", "Guardrails avançados", "10 projetos", "LGPD + EU AI Act", "Webhooks", "Suporte prioritário"], cta: "Começar Trial", highlight: true },
              { plan: "Enterprise", price: "Custom", period: "", features: ["Traces ilimitados", "Multi-tenancy", "SSO/SAML", "SLA 99.9%", "On-premise disponível", "Dedicated support", "Custom integrations"], cta: "Falar com Vendas", highlight: false },
            ].map((tier, i) => (
              <Card key={i} className={`${tier.highlight ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20" : "bg-zinc-900 border-zinc-800"}`}>
                <CardContent className="pt-6">
                  {tier.highlight && <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-0">Mais Popular</Badge>}
                  <h3 className="text-xl font-bold text-white">{tier.plan}</h3>
                  <div className="mt-2 mb-6">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-zinc-400">{tier.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${tier.highlight ? "bg-emerald-500 hover:bg-emerald-600 text-black" : "bg-zinc-800 hover:bg-zinc-700 text-white"}`}>
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <div className="space-y-6">
            {[
              { q: "O que diferencia o Argus de ferramentas como Langfuse ou Arize?", a: "O Argus é a única plataforma que combina observabilidade, testes autônomos com IA, guardrails em tempo real, scanner MCP, compliance LGPD/EU AI Act e audit trail com hash-chain em uma única ferramenta. Concorrentes cobrem apenas 1-2 dessas áreas." },
              { q: "Preciso mudar meu código existente?", a: "Não! Com o decorator @trace ou o wrapper OpenAI, você adiciona observabilidade com 2 linhas de código. Zero mudanças na sua lógica de negócio." },
              { q: "Funciona com qualquer LLM?", a: "Sim. OpenAI, Anthropic, Google, Mistral, LLMs locais — qualquer modelo que aceite chamadas HTTP. O SDK é model-agnostic." },
              { q: "Os dados ficam seguros?", a: "Sim. Masking automático de PII, audit trail imutável com hash-chain, políticas de retenção configuráveis, e opção de deploy on-premise para Enterprise." },
              { q: "Posso usar self-hosted?", a: "Sim! O Argus pode ser deployado via Docker em qualquer cloud (AWS, GCP, Azure) ou on-premise. Fornecemos Docker Compose e Helm charts." },
            ].map((faq, i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-6">
                <h3 className="font-medium text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para proteger sua IA?</h2>
          <p className="text-zinc-400 mb-8">Junte-se a equipes que confiam no Argus para garantir qualidade, segurança e compliance.</p>
          <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-medium text-lg px-8" onClick={() => window.location.href = getLoginUrl()}>
            Começar Grátis Agora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Argus Test AI</span>
          </div>
          <p>2024-2026. Plataforma de Qualidade e Segurança de IA.</p>
        </div>
      </footer>
    </div>
  );
}
