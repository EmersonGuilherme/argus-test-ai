# AI Test Platform — TODO

## Core Setup
- [x] Database schema (projects, traces, steps, evaluations, security_tests, alerts, api_keys)
- [x] Global styling (dark theme, elegant palette, typography)
- [x] DashboardLayout with sidebar navigation
- [x] Seed demo data with realistic banking scenarios

## Feature 1: Dashboard Principal com Métricas em Tempo Real
- [x] Total de testes executados (card)
- [x] Taxa de falhas (card com percentagem)
- [x] Falhas por causa raiz: IA vs Código vs Infraestrutura (donut chart)
- [x] Custo estimado de tokens (card)
- [x] Impacto financeiro (card em R$/USD)
- [x] Gráfico de tendência de latência ao longo do tempo

## Feature 2: Motor de Análise de Traces Distribuídos
- [x] Lista de traces com status, serviço, duração
- [x] Detalhe de trace com todos os steps
- [x] Identificação do campo que falhou
- [x] Identificação do serviço envolvido (Lambda, Agent IA, Kafka, DB)
- [x] Identificação da causa raiz automática

## Feature 3: Replay Visual de Falhas
- [x] Visualização passo a passo do fluxo completo
- [x] Valores de cada campo em cada step (input/output JSON)
- [x] Indicação visual de onde o erro nasceu
- [x] Prompt e resposta do LLM em cada step de IA

## Feature 4: Avaliação de Qualidade com LLM-as-Judge
- [x] Métricas: alucinação, relevância, fidelidade, toxicidade
- [x] Score geral por modelo (cards comparativos)
- [x] Score geral por prompt
- [x] Histórico de avaliações recentes

## Feature 5: Comparação de Prompts e Modelos
- [x] Benchmark side-by-side (gráfico de barras)
- [x] Comparação de qualidade, latência, custo por token
- [x] Taxa de alucinação por provider
- [x] Cards comparativos detalhados

## Feature 6: Segurança e Red-Teaming
- [x] Painel de resultados de testes de segurança
- [x] Prompt injection detection
- [x] Data leakage detection
- [x] Jailbreak detection
- [x] Bypass de validação
- [x] Nível de severidade por ocorrência
- [x] Sugestão de correção

## Feature 7: Sugestão Automática de Correção de Prompts
- [x] Prompt atual vs prompt corrigido (side-by-side)
- [x] Impacto estimado da correção
- [x] Botão de aplicação direta
- [x] Botão de rejeição

## Feature 8: Alertas Preditivos e Notificações
- [x] Alertas automáticos por threshold
- [x] Deteção de model drift
- [x] Histórico de alertas (resolvidos vs ativos)
- [x] Botão de resolver alertas

## Feature 9: Visão Multi-Perfil
- [x] Impacto financeiro em R$ nos traces
- [x] Toggle entre visão técnica/negócio/executiva (Developer/Negócio/Executivo)

## Feature 10: Gestão de Projetos e Integrações
- [x] Lista de projetos por cliente/ambiente
- [x] Criação de projetos (backend)
- [x] Modal de criação de projeto (frontend)
- [x] Configuração de integrações (GitHub, Datadog, Kafka, AWS, Slack, LangFuse, LangSmith)
- [x] Geração de API key para SDK com cópia e revogação

## Landing Page
- [x] Hero section com CTA
- [x] Feature grid com 6 funcionalidades
- [x] Redirect automático se autenticado
