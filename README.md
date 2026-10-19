# Credor Pay

MVP web responsivo para gestão de crédito e recebíveis, com landing page, acesso de demonstração, painel administrativo e dados locais.

## O que está incluído

- Página de vendas com apresentação do produto e chamadas para ação.
- Cadastro e login de demonstração em português.
- Dashboard com indicadores, gráfico de recebimentos e atividade recente.
- Sidebar desktop recolhível e gaveta lateral no mobile.
- Clientes: cadastro, pesquisa e listagem.
- Contratos: cadastro, pesquisa, status e progresso de parcelas.
- Recebíveis: registro local de pagamentos e histórico.
- Fluxo de caixa, indicadores e exportação CSV.
- Configurações e opção de limpar dados de demonstração.
- Layout responsivo, foco visível e suporte a `prefers-reduced-motion`.

## Stack

- React + TypeScript
- Vite
- CSS responsivo
- Lucide React

## Rodar localmente

Requer Node.js 22 ou compatível com Vite 6.

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Dados e autenticação: limite do MVP

**Este projeto ainda não usa banco de dados remoto nem autenticação real.** Clientes, contratos, recebimentos e a sessão de demonstração ficam no `localStorage` do navegador. O formulário de login simula o acesso e não valida credenciais num servidor. Não utilizar dados pessoais, documentos, senhas reais ou informações financeiras reais.

Antes de produção, implementar autenticação no servidor, PostgreSQL/Supabase, autorização por organização (multi-tenant), políticas RLS, validação server-side, trilha de auditoria, backups, processamento idempotente de pagamentos e testes de segurança.

A integração com pagamentos e qualquer intermediação de crédito permanecem fora deste MVP e exigem seleção de provedor, homologação e avaliação jurídica/regulatória apropriada.

## Qualidade

O workflow do GitHub Actions executa a instalação das dependências e `npm run build` em pushes e pull requests. A build precisa passar no CI antes de considerar o MVP verificado.
