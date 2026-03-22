ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_responsavelId_fkey";

DROP INDEX "quizzes_responsavelId_ativo_idx";

ALTER TABLE "quizzes" DROP COLUMN "responsavelId";
