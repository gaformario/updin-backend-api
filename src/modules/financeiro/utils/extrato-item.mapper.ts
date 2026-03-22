type ExtratoTipoRegistro = 'movimentacao' | 'missao';

type MovimentacaoExtratoBase = {
  origem: string;
  descricao?: string | null;
};

export function mapMovimentacaoToExtratoItem<T extends MovimentacaoExtratoBase>(
  movimentacao: T,
) {
  const isMissao = movimentacao.origem === 'recompensa';

  return {
    ...movimentacao,
    tipoRegistro: (isMissao ? 'missao' : 'movimentacao') as ExtratoTipoRegistro,
    origemExibicao: isMissao ? 'missao' : movimentacao.origem,
    missao: isMissao
      ? {
          titulo: movimentacao.descricao ?? 'Missao validada',
        }
      : null,
  };
}
