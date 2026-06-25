import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Book, Code, Terminal, Copy, Zap, Shield, GitBranch, Eye } from "lucide-react";

function CodeBlock({ code, language = "python" }: { code: string; language?: string }) {
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-7 w-7 p-0"
        onClick={() => { navigator.clipboard.writeText(code); toast.success("Copiado!"); }}
      >
        <Copy className="h-3 w-3" />
      </Button>
      <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Docs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documentação</h1>
        <p className="text-muted-foreground">Guias de integração, referência da API e exemplos de uso</p>
      </div>

      <Tabs defaultValue="quickstart" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="python-sdk">SDK Python</TabsTrigger>
          <TabsTrigger value="ts-sdk">SDK TypeScript</TabsTrigger>
          <TabsTrigger value="api-ref">API REST</TabsTrigger>
          <TabsTrigger value="otel">OpenTelemetry</TabsTrigger>
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD</TabsTrigger>
        </TabsList>

        {/* Quick Start */}
        <TabsContent value="quickstart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Quick Start — 5 minutos</CardTitle>
              <CardDescription>Integre o Argus Test AI ao seu projeto em 5 minutos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">1. Instale o SDK</h3>
                <CodeBlock language="bash" code={`# Python
pip install argus-test-ai

# TypeScript/Node.js
npm install @argus-test-ai/sdk`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">2. Configure a API Key</h3>
                <CodeBlock language="python" code={`from argus_test_ai import ArgusClient

client = ArgusClient(
    base_url="https://sua-instancia.argustestai.com",
    api_key="sua-api-key"  # Gere em Settings > API Keys
)`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">3. Envie seu primeiro trace</h3>
                <CodeBlock language="python" code={`# Decore sua função de IA
@client.trace(name="chat-completion")
def chat(user_message: str):
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": user_message}]
    )
    return response.choices[0].message.content

# Cada chamada é automaticamente rastreada
result = chat("Qual o saldo da conta?")`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">4. Adicione guardrails</h3>
                <CodeBlock language="python" code={`# Valide respostas antes de enviar ao usuário
result = client.guardrails.evaluate(
    output="O saldo é R$ 1.234,56",
    rules=["no_pii", "max_length:500", "format:currency_brl"]
)

if result["allowed"]:
    send_to_user(output)
else:
    send_to_user("Desculpe, não posso fornecer essa informação.")`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Python SDK */}
        <TabsContent value="python-sdk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" />SDK Python</CardTitle>
              <CardDescription>Referência completa do SDK Python para Argus Test AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Instalação</h3>
                <CodeBlock language="bash" code={`pip install argus-test-ai

# Com suporte a OpenTelemetry
pip install argus-test-ai[otel]`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">Wrapper OpenAI (Zero Config)</h3>
                <CodeBlock language="python" code={`from argus_test_ai import ArgusClient

client = ArgusClient(base_url="...", api_key="...")

# Wrap automático — todas as chamadas são rastreadas
traced_openai = client.wrap_openai(openai_client)
response = traced_openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello"}]
)
# Trace enviado automaticamente ao Argus`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">Decorator @trace</h3>
                <CodeBlock language="python" code={`@client.trace(name="process-document", metadata={"type": "pdf"})
def process_document(doc_path: str):
    # Sua lógica aqui
    text = extract_text(doc_path)
    summary = llm.summarize(text)
    return summary

# Métricas capturadas: latência, tokens, input/output`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">Red Team Automático</h3>
                <CodeBlock language="python" code={`# Execute testes de red-team contra seu sistema
results = client.red_team(
    target_prompt="Você é um assistente bancário...",
    attack_types=["prompt_injection", "jailbreak", "data_extraction"],
    num_attacks=50,
    language="pt-BR"
)

print(f"Score: {results.score}%")
print(f"Vulnerabilidades: {results.vulnerabilities}")
for vuln in results.vulnerabilities:
    print(f"  - {vuln.type}: {vuln.description}")`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">CI/CD Gate</h3>
                <CodeBlock language="python" code={`# Use no pipeline para bloquear deploys inseguros
gate_result = client.ci_gate(
    project_id=1,
    min_score=80,
    required_checks=["security", "quality", "compliance"]
)

if not gate_result["passed"]:
    print(f"Deploy bloqueado: {gate_result['reason']}")
    sys.exit(1)`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TypeScript SDK */}
        <TabsContent value="ts-sdk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" />SDK TypeScript</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Instalação</h3>
                <CodeBlock language="bash" code={`npm install @argus-test-ai/sdk`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">TraceBuilder</h3>
                <CodeBlock language="typescript" code={`import { ArgusClient } from '@argus-test-ai/sdk';

const argus = new ArgusClient({
  baseUrl: 'https://sua-instancia.argustestai.com',
  apiKey: 'sua-api-key'
});

// Crie um trace com spans
const trace = argus.trace('chat-completion')
  .metadata({ userId: 'user-123', model: 'gpt-4' });

const span = trace.span('llm-call');
span.input({ messages: [...] });
// ... sua lógica
span.output({ response: '...' });
span.end();

await trace.end();`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">Guardrails Middleware (Express)</h3>
                <CodeBlock language="typescript" code={`import { argusGuardrail } from '@argus-test-ai/sdk/middleware';

app.post('/api/chat', argusGuardrail({
  rules: ['no_pii', 'max_length:1000'],
  onBlock: (res, violations) => {
    res.status(403).json({ error: 'Blocked', violations });
  }
}), chatHandler);`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Reference */}
        <TabsContent value="api-ref" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Book className="h-5 w-5" />API REST — Referência</CardTitle>
              <CardDescription>Todos os endpoints disponíveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { method: "POST", path: "/api/traces/ingest", desc: "Ingerir um trace completo", auth: true },
                { method: "POST", path: "/api/traces/spans", desc: "Ingerir spans individuais", auth: true },
                { method: "POST", path: "/api/v1/traces", desc: "Ingestão OTLP (OpenTelemetry)", auth: true },
                { method: "POST", path: "/api/guardrails/evaluate", desc: "Avaliar output contra guardrails", auth: true },
                { method: "POST", path: "/api/ci/evaluate", desc: "Quality gate para CI/CD", auth: true },
                { method: "GET", path: "/api/compliance/report", desc: "Gerar relatório de compliance", auth: true },
                { method: "GET", path: "/api/health", desc: "Health check", auth: false },
              ].map((endpoint, i) => (
                <div key={i} className="flex items-center gap-3 border rounded p-3">
                  <Badge variant={endpoint.method === "GET" ? "secondary" : "default"} className="font-mono text-xs w-14 justify-center">
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono flex-1">{endpoint.path}</code>
                  <span className="text-sm text-muted-foreground">{endpoint.desc}</span>
                  {endpoint.auth && <Badge variant="outline" className="text-xs">Auth</Badge>}
                </div>
              ))}

              <div className="mt-6">
                <h3 className="font-medium mb-2">Autenticação</h3>
                <CodeBlock language="bash" code={`# Todas as requisições autenticadas usam header:
curl -X POST https://sua-instancia/api/traces/ingest \\
  -H "Authorization: Bearer SUA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "meu-trace", "input": "...", "output": "..."}'`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OpenTelemetry */}
        <TabsContent value="otel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />OpenTelemetry Integration</CardTitle>
              <CardDescription>Use o Argus como backend de traces OpenTelemetry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Python — Setup Rápido</h3>
                <CodeBlock language="python" code={`from argus_test_ai import setup_argus_tracing

# Configura OpenTelemetry com Argus como exporter
setup_argus_tracing(
    service_name="meu-servico",
    argus_url="https://sua-instancia.argustestai.com",
    api_key="sua-api-key"
)

# Agora qualquer span OpenTelemetry é enviado ao Argus
from opentelemetry import trace
tracer = trace.get_tracer("meu-servico")

with tracer.start_as_current_span("operacao") as span:
    span.set_attribute("model", "gpt-4")
    # sua lógica aqui`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">Endpoint OTLP</h3>
                <CodeBlock language="bash" code={`# Configure qualquer SDK OpenTelemetry para enviar ao Argus:
OTEL_EXPORTER_OTLP_ENDPOINT=https://sua-instancia.argustestai.com/api/v1
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer SUA_API_KEY"

# Compatível com:
# - opentelemetry-python
# - opentelemetry-js
# - opentelemetry-go
# - Qualquer SDK OTLP-compatible`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guardrails */}
        <TabsContent value="guardrails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Guardrails em Tempo Real</CardTitle>
              <CardDescription>Bloqueie respostas inseguras antes de chegarem ao usuário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Tipos de Guardrails</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { type: "no_pii", desc: "Bloqueia CPF, CNPJ, email, cartão, telefone" },
                    { type: "max_length:N", desc: "Limita tamanho da resposta" },
                    { type: "format:json", desc: "Valida que output é JSON válido" },
                    { type: "format:currency_brl", desc: "Valida formato monetário BR" },
                    { type: "regex:PATTERN", desc: "Valida contra regex customizado" },
                    { type: "blocked_topics", desc: "Bloqueia tópicos proibidos" },
                  ].map((g) => (
                    <div key={g.type} className="border rounded p-3">
                      <code className="text-sm font-mono text-primary">{g.type}</code>
                      <p className="text-xs text-muted-foreground mt-1">{g.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Exemplo de Uso</h3>
                <CodeBlock language="python" code={`import requests

response = requests.post(
    "https://sua-instancia/api/guardrails/evaluate",
    headers={"Authorization": "Bearer SUA_API_KEY"},
    json={
        "output": "O CPF do cliente é 123.456.789-00",
        "rules": ["no_pii", "max_length:500"]
    }
)

result = response.json()
# {
#   "allowed": false,
#   "violations": [
#     {"rule": "no_pii", "detail": "CPF detectado: 123.456.789-00"}
#   ]
# }`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CI/CD */}
        <TabsContent value="cicd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" />Integração CI/CD</CardTitle>
              <CardDescription>Bloqueie deploys que não atendem aos padrões de qualidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">GitHub Actions</h3>
                <CodeBlock language="yaml" code={`# .github/workflows/ai-quality-gate.yml
name: AI Quality Gate
on: [push, pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Argus AI Quality Gate
        run: |
          RESULT=$(curl -s -X POST \\
            "$ARGUS_URL/api/ci/evaluate" \\
            -H "Authorization: Bearer $ARGUS_API_KEY" \\
            -H "Content-Type: application/json" \\
            -d '{
              "project_id": 1,
              "min_score": 80,
              "checks": ["security", "quality", "compliance"]
            }')
          
          PASSED=$(echo $RESULT | jq -r '.passed')
          if [ "$PASSED" != "true" ]; then
            echo "❌ Quality gate failed!"
            echo $RESULT | jq .
            exit 1
          fi
          echo "✅ Quality gate passed!"
        env:
          ARGUS_URL: \${{ secrets.ARGUS_URL }}
          ARGUS_API_KEY: \${{ secrets.ARGUS_API_KEY }}`} />
              </div>
              <div>
                <h3 className="font-medium mb-2">GitLab CI</h3>
                <CodeBlock language="yaml" code={`# .gitlab-ci.yml
ai-quality-gate:
  stage: test
  script:
    - |
      RESULT=$(curl -s -X POST "$ARGUS_URL/api/ci/evaluate" \\
        -H "Authorization: Bearer $ARGUS_API_KEY" \\
        -H "Content-Type: application/json" \\
        -d '{"project_id": 1, "min_score": 80}')
      echo $RESULT | python3 -c "
      import json, sys
      r = json.load(sys.stdin)
      if not r['passed']:
          print(f'BLOCKED: {r[\"reason\"]}')
          sys.exit(1)
      print('PASSED')
      "`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
