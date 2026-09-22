export type StatusProcesso =
  | 'LIBERADO_DESCARGA'      // Etapa 1 e 2: NF deu entrada no fiscal, liberado para o almoxarifado descarregar
  | 'EM_CONFERENCIA'         // Etapa 3: Almoxarifado iniciou a descarga/conferência
  | 'AGUARDANDO_FISCAL'      // Etapa 3 concluída com sucesso: assinado pelo almoxarifado, aguardando validação fiscal
  | 'COM_DIVERGENCIA'        // Etapa 3 com divergência: notificação automática Faturamento/Compras/Financeiro
  | 'CONCLUIDO';             // Etapa 4: Fiscal assinou, canhoto digital liberado

export type TipoDivergencia = 'FALTA' | 'EXCESSO' | 'AVARIA' | 'NENHUMA';

export interface ItemNF {
  id: string;
  codigo: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidadeFaturada: number;
  quantidadeRecebida: number;
  valorUnitario: number;
  valorTotal: number;
  divergenciaTipo?: TipoDivergencia;
  divergenciaQtd?: number;
  observacaoItem?: string;
  lote?: string;
  validade?: string;
}

export interface AssinaturaEletronica {
  responsavel: string;
  cargo: string;
  matricula: string;
  departamento: 'Recebimento Fiscal' | 'Almoxarifado';
  dataHora: string;
  hashAutenticacao: string;
  rubricaBase64: string;
  ipOrigem: string;
}

export interface ItemDivergente {
  codigo: string;
  descricao: string;
  unidade: string;
  faturado: number;
  recebido: number;
  diferenca: number;
  valorUnitario: number;
  valorDivergente: number;
  tipo: TipoDivergencia;
  observacao?: string;
}

export interface NotificacaoSetor {
  setor: 'Faturamento' | 'Compras' | 'Financeiro';
  emailDestino: string;
  assunto: string;
  enviadoEm: string;
  providenciasSolicitadas: string;
  statusTratativa: 'Notificado' | 'Em Análise' | 'NF Devolução Solicitada' | 'Boleto Bloqueado' | 'Tratado';
}

export interface DivergenciaInfo {
  id: string;
  dataRegistro: string;
  registradoPor: string;
  matricula: string;
  tipoGeral: TipoDivergencia | 'MISTA';
  itensAfetados: ItemDivergente[];
  valorTotalDivergente: number;
  notificacoes: NotificacaoSetor[];
  observacoesGerais: string;
}

export interface CanhotoDigital {
  codigoCanhoto: string;
  dataHoraLiberacao: string;
  liberadoPorFiscal: string;
  matriculaFiscal: string;
  conferidoPorAlmoxarife: string;
  matriculaAlmoxarife: string;
  motoristaRecebedor: string;
  placaVeiculo: string;
  autenticidadeHash: string;
  situacaoCanhoto: 'Liberado com Sucesso' | 'Liberado com Ressalva/Devolução Parcial';
}

export interface EventoHistorico {
  id: string;
  dataHora: string;
  etapa: string;
  acao: string;
  responsavel: string;
  setor: string;
  icone?: string;
  detalhes?: string;
}

export interface Fornecedor {
  nome: string;
  cnpj: string;
  cidadeUf: string;
  email?: string;
  telefone?: string;
}

export interface Transportadora {
  nome: string;
  cnpj: string;
  motorista: string;
  cpfMotorista: string;
  placaVeiculo: string;
  telefoneMotorista?: string;
}

export interface NotaFiscalProcesso {
  id: string;
  numeroNF: string;
  serie: string;
  chaveAcesso: string;
  dataEmissao: string;
  dataEntradaFiscal: string;
  docaDesignada: string;
  fornecedor: Fornecedor;
  transportadora: Transportadora;
  valorTotalNF: number;
  itens: ItemNF[];
  status: StatusProcesso;
  historico: EventoHistorico[];
  assinaturaAlmoxarifado?: AssinaturaEletronica;
  assinaturaFiscal?: AssinaturaEletronica;
  divergencia?: DivergenciaInfo;
  canhotoDigital?: CanhotoDigital;
}

export type PerfilUsuario = 'TODOS' | 'RECEBIMENTO_FISCAL' | 'ALMOXARIFADO' | 'DIVERGENCIAS_AUDITORIA';
