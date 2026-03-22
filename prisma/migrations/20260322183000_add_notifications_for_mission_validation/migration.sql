CREATE TYPE "NotificacaoTipo" AS ENUM ('missao_validada');

CREATE TABLE "notificacoes" (
    "notificacaoId" TEXT NOT NULL,
    "adolescenteId" TEXT NOT NULL,
    "tipo" "NotificacaoTipo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT,
    "mensagem" TEXT,
    "dados" JSONB,
    "lida_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("notificacaoId")
);

CREATE INDEX "notificacoes_adolescenteId_criado_em_idx" ON "notificacoes"("adolescenteId", "criado_em");
CREATE INDEX "notificacoes_adolescenteId_lida_em_idx" ON "notificacoes"("adolescenteId", "lida_em");

ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_adolescenteId_fkey" FOREIGN KEY ("adolescenteId") REFERENCES "adolescentes"("adolescenteId") ON DELETE CASCADE ON UPDATE CASCADE;
