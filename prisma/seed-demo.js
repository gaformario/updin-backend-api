const fs = require('fs');
const path = require('path');
const { randomBytes, scryptSync } = require('crypto');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient, Prisma } = require('@prisma/client');
const { Pool } = require('pg');

const MISSAO_XP_BASE = 50;
let prisma;

function loadSeedData() {
  const customFile = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
  const filePath = customFile
    ? path.resolve(process.cwd(), customFile)
    : path.join(__dirname, 'demo-seed.json');

  return {
    filePath,
    data: JSON.parse(fs.readFileSync(filePath, 'utf8')),
  };
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function toDate(value) {
  return value ? new Date(value) : undefined;
}

function toDecimal(value) {
  return new Prisma.Decimal(value ?? 0);
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFromFile() {
  const envPath = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, 'utf8');

  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripWrappingQuotes(trimmed.slice(separatorIndex + 1).trim());

    process.env[key] = value;
  });
}

function createPrismaClient() {
  loadEnvFromFile();
  invariant(Boolean(process.env.DATABASE_URL), 'DATABASE_URL nao definida');

  const pool = new Pool(buildPoolConfig(process.env.DATABASE_URL));

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function buildPoolConfig(connectionString) {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get('sslmode');
  const sslCa = process.env.DATABASE_SSL_CA?.replace(/\\n/g, '\n');
  const shouldUseSsl = Boolean(sslMode && sslMode !== 'disable');

  if (!shouldUseSsl) {
    return {
      connectionString,
    };
  }

  url.searchParams.delete('sslmode');
  url.searchParams.delete('sslcert');
  url.searchParams.delete('sslkey');
  url.searchParams.delete('sslrootcert');

  const rejectUnauthorized =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true'
      ? true
      : process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'false'
        ? false
        : Boolean(sslCa);

  return {
    connectionString: url.toString(),
    ssl: sslCa
      ? {
          ca: sslCa,
          rejectUnauthorized,
        }
      : {
          rejectUnauthorized,
        },
  };
}

function getDatabaseTarget() {
  try {
    const url = new URL(process.env.DATABASE_URL);

    return {
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.replace(/^\//, ''),
    };
  } catch {
    return null;
  }
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertUnique(values, label) {
  const set = new Set(values);
  invariant(set.size === values.length, `${label} contem valores duplicados`);
}

function validateSeed(data) {
  assertUnique(
    data.adolescentes.map((item) => item.slug),
    'adolescentes.slug',
  );
  assertUnique(
    data.adolescentes.map((item) => item.usuario),
    'adolescentes.usuario',
  );
  assertUnique(
    data.missoes.map((item) => item.slug),
    'missoes.slug',
  );
  assertUnique(
    data.quizzes.map((item) => item.slug),
    'quizzes.slug',
  );

  for (const quiz of data.quizzes) {
    invariant(
      quiz.perguntas.length >= 5 && quiz.perguntas.length <= 10,
      `Quiz ${quiz.slug} precisa ter entre 5 e 10 perguntas`,
    );

    assertUnique(
      quiz.perguntas.map((pergunta) => pergunta.ordem),
      `quizzes.${quiz.slug}.perguntas.ordem`,
    );

    for (const pergunta of quiz.perguntas) {
      const corretas = pergunta.alternativas.filter(
        (alternativa) => alternativa.correta,
      ).length;

      invariant(
        corretas === 1,
        `Pergunta ${quiz.slug}/${pergunta.ordem} precisa ter exatamente uma alternativa correta`,
      );
    }
  }

  const quizzesBySlug = new Map(data.quizzes.map((quiz) => [quiz.slug, quiz]));
  const adolescentesBySlug = new Map(
    data.adolescentes.map((item) => [item.slug, item]),
  );
  const missoesBySlug = new Map(data.missoes.map((item) => [item.slug, item]));

  for (const atribuicao of data.atribuicoesMissoes) {
    invariant(
      adolescentesBySlug.has(atribuicao.adolescenteSlug),
      `Atribuicao referencia adolescente inexistente: ${atribuicao.adolescenteSlug}`,
    );
    invariant(
      missoesBySlug.has(atribuicao.missaoSlug),
      `Atribuicao referencia missao inexistente: ${atribuicao.missaoSlug}`,
    );

    if (atribuicao.status === 'validada') {
      invariant(
        Boolean(atribuicao.validadaEm),
        `Atribuicao validada precisa informar validadaEm: ${atribuicao.adolescenteSlug}/${atribuicao.missaoSlug}`,
      );
      invariant(
        Boolean(atribuicao.concluidaEm),
        `Atribuicao validada precisa informar concluidaEm: ${atribuicao.adolescenteSlug}/${atribuicao.missaoSlug}`,
      );
    }

    if (atribuicao.status === 'concluida') {
      invariant(
        Boolean(atribuicao.concluidaEm),
        `Atribuicao concluida precisa informar concluidaEm: ${atribuicao.adolescenteSlug}/${atribuicao.missaoSlug}`,
      );
    }
  }

  for (const tentativa of data.tentativasQuiz) {
    const quiz = quizzesBySlug.get(tentativa.quizSlug);

    invariant(
      Boolean(quiz),
      `Tentativa referencia quiz inexistente: ${tentativa.quizSlug}`,
    );
    invariant(
      adolescentesBySlug.has(tentativa.adolescenteSlug),
      `Tentativa referencia adolescente inexistente: ${tentativa.adolescenteSlug}`,
    );
    invariant(
      tentativa.respostasIndices.length === quiz.perguntas.length,
      `Tentativa ${tentativa.adolescenteSlug}/${tentativa.quizSlug} precisa responder todas as perguntas`,
    );

    tentativa.respostasIndices.forEach((resposta, index) => {
      const alternativas = quiz.perguntas[index].alternativas.length;
      invariant(
        Number.isInteger(resposta) && resposta >= 1 && resposta <= alternativas,
        `Tentativa ${tentativa.adolescenteSlug}/${tentativa.quizSlug} possui resposta invalida na ordem ${index + 1}`,
      );
    });
  }
}

async function cleanupPreviousDemoData(data) {
  const adolescentUsernames = data.adolescentes.map((item) => item.usuario);
  const quizTitles = data.quizzes.map((item) => item.titulo);

  await prisma.quiz.deleteMany({
    where: {
      titulo: {
        in: quizTitles,
      },
    },
  });

  await prisma.usuario.deleteMany({
    where: {
      usuario: {
        in: adolescentUsernames,
      },
    },
  });

  await prisma.usuario.deleteMany({
    where: {
      usuario: data.responsavel.usuario,
    },
  });
}

async function createResponsavel(seed) {
  const usuario = await prisma.usuario.create({
    data: {
      nome: seed.nome,
      usuario: seed.usuario,
      email: seed.email,
      senhaHash: hashPassword(seed.senha),
      tipo: 'responsavel',
      ativo: true,
      criadoEm: toDate(seed.criadoEm),
    },
  });

  const responsavel = await prisma.responsavel.create({
    data: {
      usuarioId: usuario.id,
      cpf: seed.cpf,
      telefone: seed.telefone,
      criadoEm: toDate(seed.criadoEm),
    },
  });

  return { usuario, responsavel };
}

async function createAdolescentes(data, responsavelId) {
  const adolescenteMap = new Map();

  for (const seed of data.adolescentes) {
    const usuario = await prisma.usuario.create({
      data: {
        nome: seed.nome,
        usuario: seed.usuario,
        email: seed.email,
        senhaHash: hashPassword(seed.senha),
        tipo: 'adolescente',
        ativo: true,
        criadoEm: toDate(seed.criadoEm),
      },
    });

    const adolescente = await prisma.adolescente.create({
      data: {
        usuarioId: usuario.id,
        responsavelId,
        cpf: seed.cpf,
        telefone: seed.telefone,
        dataNascimento: new Date(seed.dataNascimento),
        criadoEm: toDate(seed.criadoEm),
      },
    });

    const conta = await prisma.conta.create({
      data: {
        adolescenteId: adolescente.id,
        saldoTotal: toDecimal(0),
        criadoEm: toDate(seed.criadoEm),
      },
    });

    const mesada = await prisma.mesada.create({
      data: {
        adolescenteId: adolescente.id,
        responsavelId,
        valor: toDecimal(seed.mesada.valorAtual),
        periodicidade: seed.mesada.periodicidade,
        descricao: seed.mesada.descricao,
        dataInicio: new Date(seed.mesada.dataInicio),
        ativa: true,
        criadoEm: new Date(seed.mesada.dataInicio),
      },
    });

    for (const historico of seed.mesada.historico) {
      await prisma.mesadaHistorico.create({
        data: {
          mesadaId: mesada.id,
          adolescenteId: adolescente.id,
          valorAnterior:
            historico.valorAnterior === null
              ? null
              : toDecimal(historico.valorAnterior),
          valorNovo: toDecimal(historico.valorNovo),
          criadoEm: new Date(historico.criadoEm),
        },
      });
    }

    adolescenteMap.set(seed.slug, {
      seed,
      usuario,
      adolescente,
      conta,
      saldoAtual: toDecimal(0),
    });
  }

  return adolescenteMap;
}

async function createMissoes(data, responsavelId) {
  const missoesMap = new Map();

  for (const seed of data.missoes) {
    const missao = await prisma.missao.create({
      data: {
        responsavelId,
        titulo: seed.titulo,
        descricao: seed.descricao,
        pontos: seed.pontos,
        recompensaFinanceira:
          seed.recompensaFinanceira === null
            ? null
            : toDecimal(seed.recompensaFinanceira),
        ativa: seed.ativa ?? true,
        criadoEm: toDate(seed.criadoEm),
      },
    });

    missoesMap.set(seed.slug, missao);
  }

  return missoesMap;
}

async function createAtribuicoes(
  data,
  responsavelId,
  adolescenteMap,
  missoesMap,
) {
  const atribuicoesValidadas = [];

  for (const seed of data.atribuicoesMissoes) {
    const adolescente = adolescenteMap.get(seed.adolescenteSlug);
    const missao = missoesMap.get(seed.missaoSlug);

    const atribuicao = await prisma.missaoAtribuicao.create({
      data: {
        missaoId: missao.id,
        adolescenteId: adolescente.adolescente.id,
        status: seed.status,
        dataLimite: toDate(seed.dataLimite),
        concluidaEm: toDate(seed.concluidaEm),
        validadaEm: toDate(seed.validadaEm),
        observacao: seed.observacao,
        validadaPorResponsavelId:
          seed.status === 'validada' ? responsavelId : undefined,
        criadoEm: toDate(seed.criadoEm),
      },
    });

    if (seed.status === 'validada') {
      atribuicoesValidadas.push({
        seed,
        atribuicao,
        adolescente,
        missao,
      });
    }
  }

  return atribuicoesValidadas;
}

async function createQuizzes(data) {
  const quizMap = new Map();

  for (const seed of data.quizzes) {
    const quiz = await prisma.quiz.create({
      data: {
        titulo: seed.titulo,
        categoria: seed.categoria,
        descricao: seed.descricao,
        ativo: seed.ativo ?? true,
        criadoEm: toDate(seed.criadoEm),
        perguntas: {
          create: seed.perguntas.map((pergunta) => ({
            enunciado: pergunta.enunciado,
            ordem: pergunta.ordem,
            alternativas: {
              create: pergunta.alternativas.map((alternativa) => ({
                texto: alternativa.texto,
                correta: alternativa.correta,
              })),
            },
          })),
        },
      },
      include: {
        perguntas: {
          include: {
            alternativas: true,
          },
          orderBy: {
            ordem: 'asc',
          },
        },
      },
    });

    quizMap.set(seed.slug, quiz);
  }

  return quizMap;
}

async function applyContaEvents(data, adolescenteMap, atribuicoesValidadas) {
  const eventosPorAdolescente = new Map();

  for (const adolescente of data.adolescentes) {
    eventosPorAdolescente.set(adolescente.slug, []);

    for (const movimentacao of adolescente.conta.movimentacoesBase) {
      eventosPorAdolescente.get(adolescente.slug).push({
        tipoEvento: 'movimentacao_base',
        dataEvento: new Date(movimentacao.criadoEm),
        movimentacao,
      });
    }
  }

  for (const atribuicao of atribuicoesValidadas) {
    eventosPorAdolescente.get(atribuicao.seed.adolescenteSlug).push({
      tipoEvento: 'validacao_missao',
      dataEvento: new Date(atribuicao.seed.validadaEm),
      atribuicao,
    });
  }

  for (const [slug, eventos] of eventosPorAdolescente.entries()) {
    const contexto = adolescenteMap.get(slug);

    eventos.sort((a, b) => {
      const byDate = a.dataEvento.getTime() - b.dataEvento.getTime();

      if (byDate !== 0) {
        return byDate;
      }

      return a.tipoEvento.localeCompare(b.tipoEvento);
    });

    for (const evento of eventos) {
      if (evento.tipoEvento === 'movimentacao_base') {
        const saldoAnterior = contexto.saldoAtual;
        const valor = toDecimal(evento.movimentacao.valor);
        const novoSaldo =
          evento.movimentacao.tipo === 'credito'
            ? saldoAnterior.plus(valor)
            : saldoAnterior.minus(valor);

        await prisma.movimentacao.create({
          data: {
            contaId: contexto.conta.id,
            tipo: evento.movimentacao.tipo,
            origem: evento.movimentacao.origem,
            valor,
            descricao: evento.movimentacao.descricao,
            saldoApos: novoSaldo,
            criadoEm: evento.dataEvento,
          },
        });

        contexto.saldoAtual = novoSaldo;
        continue;
      }

      const { atribuicao } = evento;
      const xpGanho = Math.max(atribuicao.missao.pontos, MISSAO_XP_BASE);
      const saldoAnterior = contexto.saldoAtual;
      let valorCreditado = toDecimal(0);
      let novoSaldo = saldoAnterior;

      await prisma.pontuacaoEvento.create({
        data: {
          adolescenteId: contexto.adolescente.id,
          origemTipo: 'missao',
          origemId: atribuicao.atribuicao.id,
          pontos: xpGanho,
          descricao: `Missao validada: ${atribuicao.missao.titulo}`,
          criadoEm: evento.dataEvento,
        },
      });

      if (atribuicao.missao.recompensaFinanceira) {
        valorCreditado = toDecimal(atribuicao.missao.recompensaFinanceira);
        novoSaldo = saldoAnterior.plus(valorCreditado);

        await prisma.movimentacao.create({
          data: {
            contaId: contexto.conta.id,
            tipo: 'credito',
            origem: 'recompensa',
            valor: valorCreditado,
            descricao: atribuicao.missao.titulo,
            saldoApos: novoSaldo,
            criadoEm: evento.dataEvento,
          },
        });
      }

      await prisma.notificacao.create({
        data: {
          adolescenteId: contexto.adolescente.id,
          tipo: 'missao_validada',
          titulo: 'Parabéns!',
          subtitulo: 'Missão aprovada!',
          mensagem:
            atribuicao.seed.mensagemNotificacao ?? atribuicao.seed.observacao,
          dados: {
            atribuicaoId: atribuicao.atribuicao.id,
            missaoId: atribuicao.missao.id,
            missaoTitulo: atribuicao.missao.titulo,
            xpGanho,
            valorCreditado: valorCreditado.toFixed(2),
            saldoAnterior: saldoAnterior.toFixed(2),
            novoSaldo: novoSaldo.toFixed(2),
            mensagemResponsavel:
              atribuicao.seed.mensagemNotificacao ?? atribuicao.seed.observacao,
            validadaEm: evento.dataEvento.toISOString(),
            conquistasRelacionadas:
              atribuicao.seed.conquistasRelacionadas ?? [],
          },
          criadoEm: evento.dataEvento,
        },
      });

      contexto.saldoAtual = novoSaldo;
    }

    await prisma.conta.update({
      where: {
        id: contexto.conta.id,
      },
      data: {
        saldoTotal: contexto.saldoAtual,
      },
    });
  }
}

async function createQuizTentativas(data, adolescenteMap, quizMap) {
  for (const seed of data.tentativasQuiz) {
    const adolescente = adolescenteMap.get(seed.adolescenteSlug);
    const quiz = quizMap.get(seed.quizSlug);

    let acertos = 0;
    const respostas = quiz.perguntas.map((pergunta, index) => {
      const alternativa =
        pergunta.alternativas[seed.respostasIndices[index] - 1];
      const correta = Boolean(alternativa.correta);

      if (correta) {
        acertos += 1;
      }

      return {
        perguntaId: pergunta.id,
        alternativaId: alternativa.id,
        correta,
      };
    });

    const tentativa = await prisma.quizTentativa.create({
      data: {
        quizId: quiz.id,
        adolescenteId: adolescente.adolescente.id,
        pontuacao: acertos * 10,
        acertos,
        totalPerguntas: quiz.perguntas.length,
        finalizadoEm: new Date(seed.finalizadoEm),
        respostas: {
          create: respostas,
        },
      },
    });

    await prisma.pontuacaoEvento.create({
      data: {
        adolescenteId: adolescente.adolescente.id,
        origemTipo: 'quiz',
        origemId: tentativa.id,
        pontos: tentativa.pontuacao,
        descricao: `Quiz respondido: ${quiz.titulo}`,
        criadoEm: new Date(seed.finalizadoEm),
      },
    });
  }
}

function buildSummary(data) {
  return {
    responsavel: {
      usuario: data.responsavel.usuario,
      email: data.responsavel.email,
      senha: data.responsavel.senha,
    },
    adolescentes: data.adolescentes.map((item) => ({
      nome: item.nome,
      usuario: item.usuario,
      email: item.email,
      senha: item.senha,
    })),
    totais: {
      adolescentes: data.adolescentes.length,
      missoesCatalogadas: data.missoes.length,
      atribuicoes: data.atribuicoesMissoes.length,
      quizzes: data.quizzes.length,
      tentativasQuiz: data.tentativasQuiz.length,
      notificacoesEsperadas: data.atribuicoesMissoes.filter(
        (item) => item.status === 'validada',
      ).length,
    },
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { filePath, data } = loadSeedData();

  validateSeed(data);

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          arquivo: filePath,
          resumo: buildSummary(data),
        },
        null,
        2,
      ),
    );
    return;
  }

  prisma = createPrismaClient();
  await cleanupPreviousDemoData(data);

  const { responsavel } = await createResponsavel(data.responsavel);
  const adolescenteMap = await createAdolescentes(data, responsavel.id);
  const missoesMap = await createMissoes(data, responsavel.id);
  const atribuicoesValidadas = await createAtribuicoes(
    data,
    responsavel.id,
    adolescenteMap,
    missoesMap,
  );
  const quizMap = await createQuizzes(data);

  await applyContaEvents(data, adolescenteMap, atribuicoesValidadas);
  await createQuizTentativas(data, adolescenteMap, quizMap);

  console.log(
    JSON.stringify(
      {
        mensagem: 'Seed demo criada com sucesso',
        arquivo: filePath,
        resumo: buildSummary(data),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    if (error?.code === 'P1001') {
      const target = getDatabaseTarget();

      if (target) {
        console.error(
          `Falha ao conectar no banco ${target.database} em ${target.host}:${target.port}. Verifique se o Postgres esta ativo e se a DATABASE_URL do .env esta correta.`,
        );
      }
    }

    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
