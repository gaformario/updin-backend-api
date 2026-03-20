# Updin API

API desenvolvida em NestJS com Prisma, organizada por domínio. A aplicação contempla autenticação, gestão familiar, controle financeiro e gamificação com missões, quizzes e ranking baseado em pontuação.

## Estrutura

- `src/modules/auth`: autenticação e geração de token
- `src/modules/familia`: gestão de responsáveis e adolescentes
- `src/modules/financeiro`: contas, mesadas e movimentações
- `src/modules/gamificacao`: missões, quizzes e ranking
- `src/common`: guardas, controle de acesso e utilitários compartilhados
- `prisma/schema.prisma`: modelagem do banco de dados

## Funcionamento da API

1. O responsável realiza cadastro em `POST /api/auth/register/responsavel`.
2. O login em `POST /api/auth/login` retorna um token Bearer.
3. Com o token, o responsável pode criar adolescentes, mesadas, missões e quizzes.
4. O adolescente acessa seus dados, registra gastos, conclui missões e responde quizzes.
5. Eventos de pontuação são registrados em `PontuacaoEvento`.
6. O ranking é calculado dinamicamente a partir desses eventos.

## Endpoints principais

### Rotas públicas

- `GET /api`
- `POST /api/auth/register/responsavel`
- `POST /api/auth/login`

### Autenticação

- `GET /api/auth/me`

### Família

- `GET /api/responsaveis/me`
- `GET /api/responsaveis/me/adolescentes`
- `GET /api/responsaveis/:responsavelId`
- `GET /api/responsaveis/:responsavelId/adolescentes`
- `POST /api/responsaveis/:responsavelId/adolescentes`
- `GET /api/adolescentes/:adolescenteId`
- `GET /api/adolescentes/:adolescenteId/conta`
- `GET /api/adolescentes/:adolescenteId/dashboard`

### Financeiro

- `POST /api/adolescentes/:adolescenteId/mesadas`
- `GET /api/adolescentes/:adolescenteId/mesadas`
- `GET /api/mesadas/:mesadaId`
- `PATCH /api/mesadas/:mesadaId`
- `GET /api/contas/:contaId`
- `GET /api/contas/:contaId/movimentacoes`
- `POST /api/contas/:contaId/movimentacoes`
- `GET /api/movimentacoes/:movimentacaoId`

### Gamificação

- `POST /api/responsaveis/:responsavelId/missoes`
- `GET /api/responsaveis/:responsavelId/missoes`
- `POST /api/missoes/:missaoId/atribuicoes`
- `GET /api/adolescentes/:adolescenteId/missoes`
- `GET /api/missoes/atribuicoes/:atribuicaoId`
- `PATCH /api/missoes/atribuicoes/:atribuicaoId/concluir`
- `PATCH /api/missoes/atribuicoes/:atribuicaoId/validar`
- `POST /api/responsaveis/:responsavelId/quizzes`
- `GET /api/responsaveis/:responsavelId/quizzes`
- `GET /api/adolescentes/:adolescenteId/quizzes`
- `GET /api/quizzes/:quizId`
- `POST /api/quizzes/:quizId/tentativas/adolescentes/:adolescenteId`
- `GET /api/quizzes/tentativas/:tentativaId`
- `GET /api/ranking/global`
- `GET /api/ranking/responsaveis/:responsavelId`

## Documentação

A documentação Swagger está disponível em:

- `http://localhost:3000/docs`

### Como acessar

1. Execute `npm run start:dev`
2. Acesse `http://localhost:3000/docs`
3. Faça login em `POST /api/auth/login`
4. Clique em **Authorize** e informe: `Bearer <token>`
5. Utilize a interface para testar as rotas protegidas

## Ambiente

Variáveis necessárias no `.env`:

- `DATABASE_URL`
- `AUTH_TOKEN_SECRET`

## Observações

- O ranking é calculado dinamicamente a partir de `PontuacaoEvento`
- Não há tabela fixa de posições no ranking
- Missões validadas podem gerar pontos e crédito financeiro
- Tentativas de quiz geram pontuação automaticamente com base nos acertos
