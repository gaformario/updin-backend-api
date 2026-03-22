CREATE TABLE "mesadas_historico" (
    "mesadaHistoricoId" TEXT NOT NULL,
    "mesadaId" TEXT NOT NULL,
    "adolescenteId" TEXT NOT NULL,
    "valor_anterior" DECIMAL(12,2),
    "valor_novo" DECIMAL(12,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mesadas_historico_pkey" PRIMARY KEY ("mesadaHistoricoId")
);

INSERT INTO "mesadas_historico" (
    "mesadaHistoricoId",
    "mesadaId",
    "adolescenteId",
    "valor_anterior",
    "valor_novo",
    "criado_em"
)
SELECT
    CONCAT("mesadaId", '-initial'),
    "mesadaId",
    "adolescenteId",
    NULL,
    "valor",
    "criado_em"
FROM "mesadas";

CREATE INDEX "mesadas_historico_adolescenteId_criado_em_idx" ON "mesadas_historico"("adolescenteId", "criado_em");

CREATE INDEX "mesadas_historico_mesadaId_criado_em_idx" ON "mesadas_historico"("mesadaId", "criado_em");

ALTER TABLE "mesadas_historico" ADD CONSTRAINT "mesadas_historico_mesadaId_fkey" FOREIGN KEY ("mesadaId") REFERENCES "mesadas"("mesadaId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mesadas_historico" ADD CONSTRAINT "mesadas_historico_adolescenteId_fkey" FOREIGN KEY ("adolescenteId") REFERENCES "adolescentes"("adolescenteId") ON DELETE CASCADE ON UPDATE CASCADE;
