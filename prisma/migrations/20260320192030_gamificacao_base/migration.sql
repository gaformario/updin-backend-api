-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('responsavel', 'adolescente');

-- CreateEnum
CREATE TYPE "Periodicidade" AS ENUM ('semanal', 'quinzenal', 'mensal');

-- CreateEnum
CREATE TYPE "Tipo" AS ENUM ('credito', 'debito');

-- CreateEnum
CREATE TYPE "Origem" AS ENUM ('mesada', 'ajuste_manual', 'gasto', 'recompensa');

-- CreateEnum
CREATE TYPE "MissaoStatus" AS ENUM ('pendente', 'concluida', 'validada');

-- CreateEnum
CREATE TYPE "OrigemPontuacao" AS ENUM ('missao', 'quiz', 'bonus', 'ajuste');

-- CreateTable
CREATE TABLE "usuarios" (
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "email" TEXT,
    "senha_hash" TEXT NOT NULL,
    "tipo" "UserType" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "responsaveis" (
    "responsavelId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("responsavelId")
);

-- CreateTable
CREATE TABLE "adolescentes" (
    "adolescenteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "cpf" TEXT,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "telefone" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adolescentes_pkey" PRIMARY KEY ("adolescenteId")
);

-- CreateTable
CREATE TABLE "contas" (
    "contaId" TEXT NOT NULL,
    "adolescenteId" TEXT NOT NULL,
    "saldo_total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_pkey" PRIMARY KEY ("contaId")
);

-- CreateTable
CREATE TABLE "mesadas" (
    "mesadaId" TEXT NOT NULL,
    "adolescenteId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "periodicidade" "Periodicidade" NOT NULL,
    "descricao" TEXT,
    "data_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mesadas_pkey" PRIMARY KEY ("mesadaId")
);

-- CreateTable
CREATE TABLE "movimentacoes" (
    "movimentacaoId" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "tipo" "Tipo" NOT NULL,
    "origem" "Origem" NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "descricao" TEXT,
    "saldo_apos" DECIMAL(12,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("movimentacaoId")
);

-- CreateTable
CREATE TABLE "missoes" (
    "missaoId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "pontos" INTEGER NOT NULL,
    "recompensa_financeira" DECIMAL(12,2),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missoes_pkey" PRIMARY KEY ("missaoId")
);

-- CreateTable
CREATE TABLE "missoes_atribuicoes" (
    "missaoAtribuicaoId" TEXT NOT NULL,
    "missaoId" TEXT NOT NULL,
    "adolescenteId" TEXT NOT NULL,
    "status" "MissaoStatus" NOT NULL DEFAULT 'pendente',
    "data_limite" TIMESTAMP(3),
    "concluida_em" TIMESTAMP(3),
    "validada_em" TIMESTAMP(3),
    "observacao" TEXT,
    "validada_por_responsavel_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "missoes_atribuicoes_pkey" PRIMARY KEY ("missaoAtribuicaoId")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "quizId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("quizId")
);

-- CreateTable
CREATE TABLE "quizzes_perguntas" (
    "quizPerguntaId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "quizzes_perguntas_pkey" PRIMARY KEY ("quizPerguntaId")
);

-- CreateTable
CREATE TABLE "quizzes_alternativas" (
    "quizAlternativaId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quizzes_alternativas_pkey" PRIMARY KEY ("quizAlternativaId")
);

-- CreateTable
CREATE TABLE "quizzes_tentativas" (
    "quizTentativaId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "adolescenteId" TEXT NOT NULL,
    "pontuacao" INTEGER NOT NULL DEFAULT 0,
    "acertos" INTEGER NOT NULL DEFAULT 0,
    "total_perguntas" INTEGER NOT NULL DEFAULT 0,
    "finalizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_tentativas_pkey" PRIMARY KEY ("quizTentativaId")
);

-- CreateTable
CREATE TABLE "quizzes_respostas" (
    "quizRespostaId" TEXT NOT NULL,
    "tentativaId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "alternativaId" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quizzes_respostas_pkey" PRIMARY KEY ("quizRespostaId")
);

-- CreateTable
CREATE TABLE "pontuacao_eventos" (
    "pontuacaoEventoId" TEXT NOT NULL,
    "adolescenteId" TEXT NOT NULL,
    "origemTipo" "OrigemPontuacao" NOT NULL,
    "origem_id" TEXT NOT NULL,
    "pontos" INTEGER NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pontuacao_eventos_pkey" PRIMARY KEY ("pontuacaoEventoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_usuarioId_key" ON "responsaveis"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_cpf_key" ON "responsaveis"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "adolescentes_usuarioId_key" ON "adolescentes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "adolescentes_cpf_key" ON "adolescentes"("cpf");

-- CreateIndex
CREATE INDEX "adolescentes_responsavelId_idx" ON "adolescentes"("responsavelId");

-- CreateIndex
CREATE UNIQUE INDEX "contas_adolescenteId_key" ON "contas"("adolescenteId");

-- CreateIndex
CREATE INDEX "mesadas_adolescenteId_ativa_idx" ON "mesadas"("adolescenteId", "ativa");

-- CreateIndex
CREATE INDEX "mesadas_responsavelId_idx" ON "mesadas"("responsavelId");

-- CreateIndex
CREATE INDEX "movimentacoes_contaId_criado_em_idx" ON "movimentacoes"("contaId", "criado_em");

-- CreateIndex
CREATE INDEX "missoes_responsavelId_ativa_idx" ON "missoes"("responsavelId", "ativa");

-- CreateIndex
CREATE INDEX "missoes_atribuicoes_adolescenteId_status_idx" ON "missoes_atribuicoes"("adolescenteId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "missoes_atribuicoes_missaoId_adolescenteId_key" ON "missoes_atribuicoes"("missaoId", "adolescenteId");

-- CreateIndex
CREATE INDEX "quizzes_responsavelId_ativo_idx" ON "quizzes"("responsavelId", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_perguntas_quizId_ordem_key" ON "quizzes_perguntas"("quizId", "ordem");

-- CreateIndex
CREATE INDEX "quizzes_tentativas_adolescenteId_finalizado_em_idx" ON "quizzes_tentativas"("adolescenteId", "finalizado_em");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_respostas_tentativaId_perguntaId_key" ON "quizzes_respostas"("tentativaId", "perguntaId");

-- CreateIndex
CREATE INDEX "pontuacao_eventos_adolescenteId_criado_em_idx" ON "pontuacao_eventos"("adolescenteId", "criado_em");

-- CreateIndex
CREATE INDEX "pontuacao_eventos_origemTipo_origem_id_idx" ON "pontuacao_eventos"("origemTipo", "origem_id");

-- AddForeignKey
ALTER TABLE "responsaveis" ADD CONSTRAINT "responsaveis_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("usuarioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adolescentes" ADD CONSTRAINT "adolescentes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("usuarioId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adolescentes" ADD CONSTRAINT "adolescentes_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "responsaveis"("responsavelId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas" ADD CONSTRAINT "contas_adolescenteId_fkey" FOREIGN KEY ("adolescenteId") REFERENCES "adolescentes"("adolescenteId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesadas" ADD CONSTRAINT "mesadas_adolescenteId_fkey" FOREIGN KEY ("adolescenteId") REFERENCES "adolescentes"("adolescenteId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesadas" ADD CONSTRAINT "mesadas_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "responsaveis"("responsavelId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "contas"("contaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missoes" ADD CONSTRAINT "missoes_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "responsaveis"("responsavelId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missoes_atribuicoes" ADD CONSTRAINT "missoes_atribuicoes_missaoId_fkey" FOREIGN KEY ("missaoId") REFERENCES "missoes"("missaoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missoes_atribuicoes" ADD CONSTRAINT "missoes_atribuicoes_adolescenteId_fkey" FOREIGN KEY ("adolescenteId") REFERENCES "adolescentes"("adolescenteId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missoes_atribuicoes" ADD CONSTRAINT "missoes_atribuicoes_validada_por_responsavel_id_fkey" FOREIGN KEY ("validada_por_responsavel_id") REFERENCES "responsaveis"("responsavelId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "responsaveis"("responsavelId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_perguntas" ADD CONSTRAINT "quizzes_perguntas_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("quizId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_alternativas" ADD CONSTRAINT "quizzes_alternativas_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "quizzes_perguntas"("quizPerguntaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_tentativas" ADD CONSTRAINT "quizzes_tentativas_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("quizId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_tentativas" ADD CONSTRAINT "quizzes_tentativas_adolescenteId_fkey" FOREIGN KEY ("adolescenteId") REFERENCES "adolescentes"("adolescenteId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_respostas" ADD CONSTRAINT "quizzes_respostas_tentativaId_fkey" FOREIGN KEY ("tentativaId") REFERENCES "quizzes_tentativas"("quizTentativaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_respostas" ADD CONSTRAINT "quizzes_respostas_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "quizzes_perguntas"("quizPerguntaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes_respostas" ADD CONSTRAINT "quizzes_respostas_alternativaId_fkey" FOREIGN KEY ("alternativaId") REFERENCES "quizzes_alternativas"("quizAlternativaId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontuacao_eventos" ADD CONSTRAINT "pontuacao_eventos_adolescenteId_fkey" FOREIGN KEY ("adolescenteId") REFERENCES "adolescentes"("adolescenteId") ON DELETE CASCADE ON UPDATE CASCADE;
