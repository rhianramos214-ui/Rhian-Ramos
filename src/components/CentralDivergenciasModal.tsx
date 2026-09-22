import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Mail,
  Send,
  CheckCircle,
  Copy,
  Building,
  DollarSign,
  ShoppingCart,
  FileSpreadsheet,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { NotaFiscalProcesso, NotificacaoSetor } from '../types';
import { formatCurrency, formatCNPJ, formatChaveAcesso } from '../utils/formatters';

interface CentralDivergenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaFiscalProcesso | null;
  onUpdateStatusTratativa?: (notaId: string, setor: string, novoStatus: NotificacaoSetor['statusTratativa']) => void;
  onLiberarComRessalva?: (nota: NotaFiscalProcesso) => void;
}

export const CentralDivergenciasModal: React.FC<CentralDivergenciasModalProps> = ({
  isOpen,
  onClose,
  nota,
  onUpdateStatusTratativa,
  onLiberarComRessalva,
}) => {
  const [tabAtiva, setTabAtiva] = useState<'FATURAMENTO' | 'COMPRAS' | 'FINANCEIRO' | 'ITENS'>('ITENS');
  const [reenviadoFeedback, setReenviadoFeedback] = useState<string | null>(null);

  if (!isOpen || !nota || !nota.divergencia) return null;

  const { divergencia } = nota;

  const handleCopyEmail = (texto: string) => {
    navigator.clipboard.writeText(texto);
    alert('Texto do e-mail copiado com sucesso para a área de transferência!');
  };

  const handleSimularReenvio = (setor: string) => {
    setReenviadoFeedback(`Notificação reenviada com sucesso para o setor de ${setor}!`);
    setTimeout(() => {
      setReenviadoFeedback(null);
    }, 4000);
  };

  // Generate customized formal body for each department
  const getEmailBodyFaturamento = () => {
    const itensTexto = divergencia.itensAfetados
      .map(
        (it) =>
          `• [${it.codigo}] ${it.descricao}\n  Faturado: ${it.faturado} ${it.unidade} | Recebido: ${it.recebido} ${it.unidade} | Divergência: ${it.diferenca} ${it.unidade} (${it.tipo})\n  Valor Unit.: ${formatCurrency(it.valorUnitario)} | Subtotal Divergência: ${formatCurrency(it.valorDivergente)}\n  Motivo/Obs: ${it.observacao || 'Conferência física'}`
      )
      .join('\n\n');

    return `Prezada equipe de Faturamento,

Informamos que na conferência de recebimento físico realizada no Almoxarifado para a NF-e nº ${nota.numeroNF} (Série ${nota.serie}), emitida pelo fornecedor ${nota.fornecedor.nome} (CNPJ: ${formatCNPJ(nota.fornecedor.cnpj)}), foi constatada DIVERGÊNCIA FÍSICA no descarregamento.

DADOS DA NOTA FISCAL:
- Número da NF-e: ${nota.numeroNF}
- Série: ${nota.serie}
- Chave de Acesso: ${nota.chaveAcesso}
- Valor Total da NF: ${formatCurrency(nota.valorTotalNF)}
- Doca de Recebimento: ${nota.docaDesignada}
- Conferente Responsável: ${divergencia.registradoPor} (${divergencia.matricula})

MATERIAIS COM DIVERGÊNCIA IDENTIFICADA:
${itensTexto}

VALOR TOTAL DA DIVERGÊNCIA: ${formatCurrency(divergencia.valorTotalDivergente)}

PROVIDÊNCIAS SOLICITADAS AO FATURAMENTO:
1. Proceder com a emissão imediata da NF de Devolução (parcial ou simbólica conforme legislação vigente).
2. Vincular a chave de acesso da NF-e original referenciada.
3. Disponibilizar a DANFE de devolução para anexo junto ao canhoto assinado com ressalva para o motorista transportador (${nota.transportadora.motorista} - Placa ${nota.transportadora.placaVeiculo}).

Atenciosamente,
Sistema Automatizado de Recebimento de Materiais (Recebimento Fiscal & Almoxarifado)`;
  };

  const getEmailBodyCompras = () => {
    return `Prezada equipe de Compras & Suprimentos,

Notificamos ocorrência de não conformidade no recebimento da NF-e nº ${nota.numeroNF}, Fornecedor: ${nota.fornecedor.nome}.

RESUMO DA DIVERGÊNCIA:
- Tipo: ${divergencia.tipoGeral}
- Itens afetados: ${divergencia.itensAfetados.length} item(ns)
- Impacto financeiro divergente: ${formatCurrency(divergencia.valorTotalDivergente)}
- Quantidades faturadas vs. recebidas apuradas no descarregamento:
${divergencia.itensAfetados.map((it) => `  * ${it.descricao}: Faturado ${it.faturado} ${it.unidade} vs Recebido ${it.recebido} ${it.unidade} (Diferença: ${it.diferenca} - Motivo: ${it.tipo})`).join('\n')}

PROVIDÊNCIAS SOLICITADAS A COMPRAS:
1. Contatar o fornecedor ${nota.fornecedor.nome} para acionar tratativa comercial/RNC.
2. Definir se haverá nova remessa/reposição física do saldo não entregue ou se o pedido de compra será encerrado pelo valor recebido.

Atenciosamente,
Almoxarifado & Recebimento Fiscal`;
  };

  const getEmailBodyFinanceiro = () => {
    const valorLiquidoAceito = nota.valorTotalNF - divergencia.valorTotalDivergente;
    return `Prezada equipe do Financeiro / Contas a Pagar,

Solicitamos ação imediata de bloqueio / glosa de título referente à NF-e nº ${nota.numeroNF}, Fornecedor: ${nota.fornecedor.nome}.

DETALHAMENTO FINANCEIRO:
- Valor Original Faturado na NF: ${formatCurrency(nota.valorTotalNF)}
- Valor Total Glosado por Divergência: ${formatCurrency(divergencia.valorTotalDivergente)}
- Novo Valor Líquido Aceito para Pagamento: ${formatCurrency(valorLiquidoAceito)}
- Motivo: ${divergencia.itensAfetados.map((it) => `${it.tipo} de ${Math.abs(it.diferenca)} ${it.unidade} de ${it.descricao}`).join('; ')}

PROVIDÊNCIAS SOLICITADAS AO FINANCEIRO:
1. Suspender temporariamente a baixa/agendamento do boleto original.
2. Solicitar ao fornecedor o envio de novo boleto com valor líquido corrigido de ${formatCurrency(valorLiquidoAceito)} ou emissão de nota de crédito / compensação com a NF de devolução gerada pelo Faturamento.

Atenciosamente,
Controle de Recebimento de Materiais`;
  };

  const notificacaoFaturamento = divergencia.notificacoes.find((n) => n.setor === 'Faturamento');
  const notificacaoCompras = divergencia.notificacoes.find((n) => n.setor === 'Compras');
  const notificacaoFinanceiro = divergencia.notificacoes.find((n) => n.setor === 'Financeiro');

  return (
    <div id="divergencias-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div id="divergencias-modal-container" className="w-full max-w-5xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-amber-200 px-6 py-4 bg-amber-500 text-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-950 text-amber-300 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-950">Tratamento de Divergências</span>
                <span className="rounded bg-amber-900 text-amber-100 text-[10px] px-2 py-0.5 font-bold uppercase">
                  Divergência: {divergencia.tipoGeral}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-950">
                NF-e Nº {nota.numeroNF} • {nota.fornecedor.nome}
              </h3>
            </div>
          </div>
          <button
            id="btn-close-divergencias-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-amber-950 hover:bg-amber-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {reenviadoFeedback && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-semibold flex items-center gap-2 transition-all">
            <CheckCircle className="h-4 w-4" />
            {reenviadoFeedback}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            id="tab-btn-itens"
            onClick={() => setTabAtiva('ITENS')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition ${
              tabAtiva === 'ITENS'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Quadro Comparativo de Itens ({divergencia.itensAfetados.length})
          </button>

          <button
            id="tab-btn-faturamento"
            onClick={() => setTabAtiva('FATURAMENTO')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition ${
              tabAtiva === 'FATURAMENTO'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="h-4 w-4" />
            E-mail Faturamento
            <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.2">
              NF Devolução
            </span>
          </button>

          <button
            id="tab-btn-compras"
            onClick={() => setTabAtiva('COMPRAS')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition ${
              tabAtiva === 'COMPRAS'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            E-mail Compras
            <span className="rounded-full bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2">
              Reposição / RNC
            </span>
          </button>

          <button
            id="tab-btn-financeiro"
            onClick={() => setTabAtiva('FINANCEIRO')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition ${
              tabAtiva === 'FINANCEIRO'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            E-mail Financeiro
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2">
              Glosa / Boleto
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-slate-800">
          {/* TAB 1: ITENS COMPARATIVE */}
          {tabAtiva === 'ITENS' && (
            <div className="space-y-4">
              {/* Summary stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">Valor Faturado na NF</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{formatCurrency(nota.valorTotalNF)}</p>
                  <p className="text-[11px] text-slate-500">Conforme DANFE original</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3.5">
                  <span className="text-[11px] font-semibold text-red-600 uppercase">Valor Total Divergente</span>
                  <p className="text-base font-bold text-red-700 mt-0.5">{formatCurrency(divergencia.valorTotalDivergente)}</p>
                  <p className="text-[11px] text-red-600 font-medium">Impacto a ser estornado/glosado</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase">Valor Líquido Efetivo</span>
                  <p className="text-base font-bold text-emerald-800 mt-0.5">
                    {formatCurrency(nota.valorTotalNF - divergencia.valorTotalDivergente)}
                  </p>
                  <p className="text-[11px] text-emerald-700">Material aceito no Almoxarifado</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-700">
                    Itens com Falta, Excesso ou Avaria Apurados
                  </h4>
                  <span className="text-xs text-slate-500">
                    Registrado por: <strong>{divergencia.registradoPor}</strong> ({divergencia.matricula}) em {divergencia.dataRegistro}
                  </span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="px-3 py-2.5">Código / Descrição</th>
                      <th className="px-3 py-2.5 text-center">Tipo</th>
                      <th className="px-3 py-2.5 text-right">Qtd. Faturada</th>
                      <th className="px-3 py-2.5 text-right">Qtd. Recebida</th>
                      <th className="px-3 py-2.5 text-right">Diferença</th>
                      <th className="px-3 py-2.5 text-right">Vlr. Unitário</th>
                      <th className="px-3 py-2.5 text-right">Vlr. Divergência</th>
                      <th className="px-3 py-2.5">Observação de Doca</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {divergencia.itensAfetados.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-slate-600 block">{it.codigo}</span>
                          <span className="font-medium text-slate-900">{it.descricao}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              it.tipo === 'FALTA'
                                ? 'bg-amber-100 text-amber-800'
                                : it.tipo === 'AVARIA'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {it.tipo}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                          {it.faturado} {it.unidade}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                          {it.recebido} {it.unidade}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-red-600">
                          {it.diferenca > 0 ? `+${it.diferenca}` : it.diferenca} {it.unidade}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-600">{formatCurrency(it.valorUnitario)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-red-600">
                          {formatCurrency(it.valorDivergente)}
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-slate-500 max-w-xs">{it.observacao || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Status of automatic notifications dispatched */}
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Status dos Disparos Automáticos de E-mail
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Notificações instantâneas disparadas com sucesso
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {divergencia.notificacoes.map((notif, idx) => (
                    <div key={idx} className="rounded-md border border-slate-300 p-3 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{notif.setor}</span>
                        <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5">
                          {notif.statusTratativa}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{notif.emailDestino}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{notif.providenciasSolicitadas}</p>
                      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-mono">{notif.enviadoEm}</span>
                        <button
                          id={`btn-view-email-${notif.setor.toLowerCase()}`}
                          onClick={() => setTabAtiva(notif.setor.toUpperCase() as any)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          Ver E-mail <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FATURAMENTO */}
          {tabAtiva === 'FATURAMENTO' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">Notificação Automática enviada ao Faturamento</span>
                  <span className="text-blue-700">Destinatário: faturamento@empresa.com.br • Enviado em {notificacaoFaturamento?.enviadoEm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-email-fat"
                    onClick={() => handleCopyEmail(getEmailBodyFaturamento())}
                    className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar Mensagem
                  </button>
                  <button
                    id="btn-resend-email-fat"
                    onClick={() => handleSimularReenvio('Faturamento')}
                    className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Reenviar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Assunto do E-mail
                </label>
                <input
                  type="text"
                  readOnly
                  value={notificacaoFaturamento?.assunto || ''}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-2.5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Corpo do E-mail Gerado Automaticamente (Informando NF, Materiais, Diferença e Solicitação de NF de Devolução)
                </label>
                <textarea
                  readOnly
                  rows={12}
                  value={getEmailBodyFaturamento()}
                  className="w-full font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-3.5 leading-relaxed"
                />
              </div>

              {/* Status Update */}
              <div className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50 text-xs">
                <span className="text-slate-600 font-medium">Status da Tratativa com Faturamento:</span>
                <div className="flex gap-2">
                  {(['Notificado', 'Em Análise', 'NF Devolução Solicitada', 'Tratado'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatusTratativa?.(nota.id, 'Faturamento', st)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        notificacaoFaturamento?.statusTratativa === st
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPRAS */}
          {tabAtiva === 'COMPRAS' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-purple-900 block">Notificação Automática enviada a Compras / Suprimentos</span>
                  <span className="text-purple-700">Destinatário: compras.suprimentos@empresa.com.br • Enviado em {notificacaoCompras?.enviadoEm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-email-compras"
                    onClick={() => handleCopyEmail(getEmailBodyCompras())}
                    className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar Mensagem
                  </button>
                  <button
                    id="btn-resend-email-compras"
                    onClick={() => handleSimularReenvio('Compras')}
                    className="flex items-center gap-1 rounded bg-purple-600 px-3 py-1 text-xs font-semibold text-white hover:bg-purple-700 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Reenviar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Assunto do E-mail
                </label>
                <input
                  type="text"
                  readOnly
                  value={notificacaoCompras?.assunto || ''}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-2.5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Corpo do E-mail Automático
                </label>
                <textarea
                  readOnly
                  rows={10}
                  value={getEmailBodyCompras()}
                  className="w-full font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-3.5 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50 text-xs">
                <span className="text-slate-600 font-medium">Status da Tratativa com Compras:</span>
                <div className="flex gap-2">
                  {(['Notificado', 'Em Análise', 'Tratado'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatusTratativa?.(nota.id, 'Compras', st)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        notificacaoCompras?.statusTratativa === st
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCEIRO */}
          {tabAtiva === 'FINANCEIRO' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-emerald-900 block">Notificação Automática enviada ao Financeiro / Contas a Pagar</span>
                  <span className="text-emerald-700">Destinatário: contasapagar@empresa.com.br • Enviado em {notificacaoFinanceiro?.enviadoEm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-email-fin"
                    onClick={() => handleCopyEmail(getEmailBodyFinanceiro())}
                    className="flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar Mensagem
                  </button>
                  <button
                    id="btn-resend-email-fin"
                    onClick={() => handleSimularReenvio('Financeiro')}
                    className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Reenviar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Assunto do E-mail
                </label>
                <input
                  type="text"
                  readOnly
                  value={notificacaoFinanceiro?.assunto || ''}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-2.5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Corpo do E-mail Automático de Bloqueio / Glosa
                </label>
                <textarea
                  readOnly
                  rows={10}
                  value={getEmailBodyFinanceiro()}
                  className="w-full font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-md p-3.5 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50 text-xs">
                <span className="text-slate-600 font-medium">Status da Ação Financeira:</span>
                <div className="flex gap-2">
                  {(['Notificado', 'Boleto Bloqueado', 'Tratado'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatusTratativa?.(nota.id, 'Financeiro', st)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                        notificacaoFinanceiro?.statusTratativa === st
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-xs text-slate-500">
            Rastreabilidade total: Todos os e-mails e tratativas ficam arquivados no histórico imutável do processo.
          </p>
          <div className="flex items-center gap-2">
            {onLiberarComRessalva && nota.status === 'COM_DIVERGENCIA' && (
              <button
                id="btn-liberar-ressalva"
                type="button"
                onClick={() => {
                  onLiberarComRessalva(nota);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer shadow-xs"
              >
                <CheckCircle className="h-4 w-4" /> Liberar Canhoto com Ressalva
              </button>
            )}
            <button
              id="btn-close-divergencias-footer"
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
            >
              Fechar Painel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
