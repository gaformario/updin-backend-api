export type UserType = 'responsavel' | 'adolescente';
export type Periodicidade = 'semanal' | 'quinzenal' | 'mensal';
export type TipoMovimentacao = 'credito' | 'debito';
export type OrigemMovimentacao = 'mesada' | 'ajuste_manual' | 'gasto';

export interface BaseEntity {
  criadoEm: string;
  atualizadoEm?: string;
}

export interface Usuario extends BaseEntity {
  id: string;
  nome: string;
  usuario: string;
  email?: string;
  senhaHash: string;
  tipo: UserType;
  ativo: boolean;
  atualizadoEm: string;
}

export interface Responsavel extends BaseEntity {
  id: string;
  usuarioId: string;
  cpf?: string;
  telefone?: string;
}

export interface Adolescente extends BaseEntity {
  id: string;
  usuarioId: string;
  responsavelId: string;
  cpf?: string;
  dataNascimento: string;
  telefone?: string;
}

export interface Conta extends BaseEntity {
  id: string;
  adolescenteId: string;
  saldoTotal: number;
  atualizadoEm: string;
}

export interface Mesada extends BaseEntity {
  id: string;
  adolescenteId: string;
  responsavelId: string;
  valor: number;
  periodicidade: Periodicidade;
  ativa: boolean;
  atualizadoEm: string;
}

export interface Movimentacao {
  id: string;
  contaId: string;
  tipo: TipoMovimentacao;
  origem: OrigemMovimentacao;
  valor: number;
  descricao?: string;
  criadoEm: string;
}
