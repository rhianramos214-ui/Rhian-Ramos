import React, { useState } from 'react';
import {
  X,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  PenTool,
  Check,
  ShieldCheck,
  PackageCheck,
  Minus,
  Plus,
} from 'lucide-react';
import { NotaFiscalProcesso, ItemNF, TipoDivergencia, AssinaturaEletronica } from '../types';
import { SignaturePadModal } from './SignaturePadModal';
import { formatCurrency, formatCNPJ } from '../utils/formatters';

interface ConferenciaAlmoxarifadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaFiscalProcesso | null;
  onSalvarConferencia: (
    notaAtualizada: NotaFiscalProcesso,
    houveDivergencia: boolean
  ) => void;
  onAbrirArquivei: (nota: NotaFiscalProcesso) => void;
}

export const ConferenciaAlmoxarifadoModal: React.FC<ConferenciaAlmoxarifadoModalProps> = ({
  isOpen,
  onClose,
  nota,
  onSalvarConferencia,
  onAbrirArquivei,
}) => {
  const [itens, setItens] = useState<ItemNF[]>([]);
  const [observacoesAlmoxarifado, setObservacoesAlmoxarifado] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // Initialize or reset when modal opens
  React.useEffect(() => {
    if (isOpen && nota) {
      setItens(
        nota.itens.map((it) => ({
          ...it,
          quantidadeRecebida: it.quantidadeRecebida > 0 ? it.quantidadeRecebida : it.quantidadeFaturada,
          divergenciaTipo: it.divergenciaTipo || 'NENHUMA',
          divergenciaQtd: it.divergenciaQtd || 0,
        }))
      );
      setObservacoesAlmoxarifado(nota.divergencia?.observacoesGerais || '');
    }
  }, [isOpen, nota]);

  if (!isOpen || !nota) return null;

  const handleSetAllConforme = () => {
    setItens(
      itens.map((it) => ({
        ...it,
        quantidadeRecebida: it.quantidadeFaturada,
        divergenciaTipo: 'NENHUMA',
        divergenciaQtd: 0,
        observacaoItem: '',
      }))
    );
  };

  const handleUpdateQtdRecebida = (id: string, novaQtd: number) => {
    setItens((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const qtd = Math.max(0, novaQtd);
        const dif = qtd - it.quantidadeFaturada;
        let tipo: TipoDivergencia = 'NENHUMA';
        if (dif < 0) tipo = 'FALTA';
        else if (dif > 0) tipo = 'EXCESSO';

        return {
          ...it,
          quantidadeRecebida: qtd,
          divergenciaTipo: it.divergenciaTipo === 'AVARIA' ? 'AVARIA' : tipo,
          divergenciaQtd: dif,
        };
      })
    );
  };

  const handleToggleAvaria = (id: string) => {
    setItens((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const novoTipo: TipoDivergencia = it.divergenciaTipo === 'AVARIA' ? 'NENHUMA' : 'AVARIA';
        return {
          ...it,
          divergenciaTipo: novoTipo,
          observacaoItem:
            novoTipo === 'AVARIA'
              ? 'Material avariado/rompido na descarga. Segregado fisicamente.'
              : '',
        };
      })
    );
  };

  const handleUpdateItemObs = (id: string, obs: string) => {
    setItens((prev) =>
      prev.map((it) => (it.id === id ? { ...it, observacaoItem: obs } : it))
    );
  };

  const handleUpdateLote = (id: string, lote: string) => {
    setItens((prev) =>
      prev.map((it) => (it.id === id ? { ...it, lote } : it))
    );
  };

  // Check if any item has difference or avaria
  const itensDivergentes = itens.filter(
    (it) => it.quantidadeRecebida !== it.quantidadeFaturada || it.divergenciaTipo === 'AVARIA'
  );
  const temDivergencia = itensDivergentes.length > 0;

  const valorTotalDivergencia = itensDivergentes.reduce((acc, it) => {
    const diff = Math.abs(it.quantidadeFaturada - it.quantidadeRecebida);
    // If it's pure avaria with same count, we consider the damaged items
    const qtdImpactada = diff > 0 ? diff : 1;
    return acc + qtdImpactada * it.valorUnitario;
  }, 0);

  const handleOpenSignature = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureConfirmed = (assinaturaAlmoxarifado: AssinaturaEletronica) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let novaNota: NotaFiscalProcesso = {
      ...nota,
      itens,
      assinaturaAlmoxarifado,
    };

    if (temDivergencia) {
      // Build divergence info and automatic notifications
      const tipoGeral: TipoDivergencia | 'MISTA' =
        itensDivergentes.every((i) => i.divergenciaTipo === 'FALTA')
          ? 'FALTA'
          : itensDivergentes.every((i) => i.divergenciaTipo === 'EXCESSO')
          ? 'EXCESSO'
          : itensDivergentes.every((i) => i.divergenciaTipo === 'AVARIA')
          ? 'AVARIA'
          : 'MISTA';

      novaNota = {
        ...novaNota,
        status: 'COM_DIVERGENCIA',
        divergencia: {
          id: `div-${Date.now()}`,
          dataRegistro: formattedDate,
          registradoPor: assinaturaAlmoxarifado.responsavel,
          matricula: assinaturaAlmoxarifado.matricula,
          tipoGeral,
          valorTotalDivergente: valorTotalDivergencia,
          observacoesGerais: observacoesAlmoxarifado || 'Conferência física com divergência de doca.',
          itensAfetados: itensDivergentes.map((it) => ({
            codigo: it.codigo,
            descricao: it.descricao,
            unidade: it.unidade,
            faturado: it.quantidadeFaturada,
            recebido: it.quantidadeRecebida,
            diferenca: it.quantidadeRecebida - it.quantidadeFaturada,
            valorUnitario: it.valorUnitario,
            valorDivergente:
              Math.abs(it.quantidadeRecebida - it.quantidadeFaturada || 1) * it.valorUnitario,
            tipo: it.divergenciaTipo || 'FALTA',
            observacao: it.observacaoItem || '',
          })),
          notificacoes: [
            {
              setor: 'Faturamento',
              emailDestino: 'faturamento@empresa.com.br',
              assunto: `[DIVERGÊNCIA DE RECEBIMENTO] NF-e ${nota.numeroNF} - Solicitação de NF de Devolução`,
              enviadoEm: formattedDate,
              providenciasSolicitadas: `Emitir NF de Devolução no valor de ${formatCurrency(valorTotalDivergencia)} referente a divergência no recebimento de ${itensDivergentes.length} item(ns).`,
              statusTratativa: 'NF Devolução Solicitada',
            },
            {
              setor: 'Compras',
              emailDestino: 'compras.suprimentos@empresa.com.br',
              assunto: `[ALERTA SUPRIMENTOS] Divergência na Entrega - Fornecedor ${nota.fornecedor.nome} - NF ${nota.numeroNF}`,
              enviadoEm: formattedDate,
              providenciasSolicitadas: `Acionar o fornecedor ${nota.fornecedor.nome} para reposição urgente ou ajuste comercial do pedido.`,
              statusTratativa: 'Notificado',
            },
            {
              setor: 'Financeiro',
              emailDestino: 'contasapagar@empresa.com.br',
              assunto: `[BLOQUEIO / GLOSA] NF-e ${nota.numeroNF} - Glosa de ${formatCurrency(valorTotalDivergencia)}`,
              enviadoEm: formattedDate,
              providenciasSolicitadas: `Glosar ${formatCurrency(valorTotalDivergencia)} do pagamento ou suspender boleto até emissão da NF de devolução.`,
              statusTratativa: 'Boleto Bloqueado',
            }
          ]
        },
        historico: [
          ...nota.historico,
          {
            id: `h-${Date.now()}-1`,
            dataHora: formattedDate,
            etapa: '3. Descarga e Conferência - Almoxarifado',
            acao: 'Conferência física finalizada com apontamento de divergência.',
            responsavel: assinaturaAlmoxarifado.responsavel,
            setor: 'Almoxarifado',
            detalhes: `Assinatura eletrônica registrada. ${itensDivergentes.length} item(ns) com divergência somando ${formatCurrency(valorTotalDivergencia)}.`,
          },
          {
            id: `h-${Date.now()}-2`,
            dataHora: formattedDate,
            etapa: 'Disparo Automático de E-mails',
            acao: 'Notificações geradas e enviadas para Faturamento, Compras e Financeiro.',
            responsavel: 'Sistema de Automação',
            setor: 'TI / Integração',
            detalhes: 'E-mails automáticos contendo dados da NF, itens, quantidades faturadas vs recebidas e solicitação de providências.',
          }
        ]
      };
    } else {
      // 100% OK
      novaNota = {
        ...novaNota,
        status: 'AGUARDANDO_FISCAL',
        historico: [
          ...nota.historico,
          {
            id: `h-${Date.now()}-1`,
            dataHora: formattedDate,
            etapa: '3. Descarga e Conferência - Almoxarifado',
            acao: 'Conferência física 100% em conformidade com a NF-e.',
            responsavel: assinaturaAlmoxarifado.responsavel,
            setor: 'Almoxarifado',
            detalhes: `Todos os ${itens.length} itens conferidos e aceitos na ${nota.docaDesignada}. Assinatura eletrônica registrada. Encaminhado ao Recebimento Fiscal para liberação do canhoto.`,
          }
        ]
      };
    }

    onSalvarConferencia(novaNota, temDivergencia);
    onClose();
  };

  return (
    <>
      <div id="conferencia-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
        <div id="conferencia-modal-container" className="w-full max-w-5xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Etapa 3 • Almoxarifado
                  </span>
                  <span className="rounded bg-blue-950 text-blue-300 text-[10px] px-2 py-0.5 border border-blue-800">
                    Descarga & Conferência Física Digital
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100">
                  NF-e Nº {nota.numeroNF} • {nota.docaDesignada}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-open-arquivei-from-conf"
                type="button"
                onClick={() => onAbrirArquivei(nota)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
              >
                <FileSearch className="h-3.5 w-3.5" /> Consultar Arquivei / SEFAZ
              </button>
              <button
                id="btn-close-conferencia"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800">
            {/* Delivery Info Strip */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Fornecedor:</span>
                <span className="font-semibold text-slate-900">{nota.fornecedor.nome}</span>
                <span className="text-[11px] text-slate-500 block">CNPJ: {formatCNPJ(nota.fornecedor.cnpj)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Transportador & Placa:</span>
                <span className="font-semibold text-slate-900">{nota.transportadora.nome}</span>
                <span className="text-[11px] text-slate-600 block">Placa: {nota.transportadora.placaVeiculo}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Motorista Portador:</span>
                <span className="font-semibold text-slate-900">{nota.transportadora.motorista}</span>
                <span className="text-[11px] text-slate-500 block">Doca: {nota.docaDesignada}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Valor Faturado:</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(nota.valorTotalNF)}</span>
                <span className="text-[11px] text-emerald-700 font-medium block">Liberado p/ descarga às {nota.dataEntradaFiscal.split(' ')[1]}</span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="text-xs text-blue-950">
                <span className="font-bold">Conferência Item a Item:</span>
                <span className="text-blue-800 ml-1">
                  Confira as quantidades descarregadas em relação aos dados da NF já integrados via Arquivei.
                </span>
              </div>
              <button
                id="btn-set-all-conforme"
                type="button"
                onClick={handleSetAllConforme}
                className="flex items-center gap-1.5 rounded-md bg-white border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100 transition shadow-2xs cursor-pointer shrink-0"
              >
                <PackageCheck className="h-4 w-4 text-emerald-600" /> Preencher Todos 100% Conformes
              </button>
            </div>

            {/* Items Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Lista de Materiais para Conferência ({itens.length})
              </h4>

              <div className="space-y-3">
                {itens.map((it) => {
                  const diferenca = it.quantidadeRecebida - it.quantidadeFaturada;
                  const hasDiff = diferenca !== 0;
                  const isAvaria = it.divergenciaTipo === 'AVARIA';

                  return (
                    <div
                      key={it.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        isAvaria
                          ? 'border-red-300 bg-red-50/50'
                          : hasDiff
                          ? 'border-amber-300 bg-amber-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {it.codigo}
                            </span>
                            <span className="text-xs text-slate-500">NCM: {it.ncm}</span>
                            {isAvaria && (
                              <span className="rounded bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                                Avaria Constatada
                              </span>
                            )}
                            {hasDiff && !isAvaria && (
                              <span
                                className={`rounded text-[10px] font-bold px-2 py-0.5 uppercase ${
                                  diferenca < 0
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                {diferenca < 0 ? `Falta de ${Math.abs(diferenca)}` : `Excesso de ${diferenca}`}
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-semibold text-slate-900">{it.descricao}</h5>
                          <div className="text-xs text-slate-600 flex items-center gap-3">
                            <span>Qtd. Faturada: <strong>{it.quantidadeFaturada} {it.unidade}</strong></span>
                            <span>•</span>
                            <span>Valor Unitário: <strong>{formatCurrency(it.valorUnitario)}</strong></span>
                          </div>
                        </div>

                        {/* Quantity Counter & Controls */}
                        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`btn-minus-${it.id}`}
                              type="button"
                              onClick={() => handleUpdateQtdRecebida(it.id, it.quantidadeRecebida - 1)}
                              className="h-7 w-7 rounded border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <div className="text-center px-1">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">Recebido</span>
                              <input
                                id={`input-recebido-${it.id}`}
                                type="number"
                                min="0"
                                value={it.quantidadeRecebida}
                                onChange={(e) => handleUpdateQtdRecebida(it.id, Number(e.target.value))}
                                className="w-16 rounded border border-slate-300 py-0.5 text-center text-xs font-bold text-slate-900 bg-white"
                              />
                            </div>
                            <button
                              id={`btn-plus-${it.id}`}
                              type="button"
                              onClick={() => handleUpdateQtdRecebida(it.id, it.quantidadeRecebida + 1)}
                              className="h-7 w-7 rounded border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-xs font-semibold text-slate-600 ml-1">{it.unidade}</span>
                          </div>

                          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                            <button
                              id={`btn-equal-${it.id}`}
                              type="button"
                              onClick={() => handleUpdateQtdRecebida(it.id, it.quantidadeFaturada)}
                              className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                            >
                              = Faturado
                            </button>
                            <button
                              id={`btn-avaria-${it.id}`}
                              type="button"
                              onClick={() => handleToggleAvaria(it.id)}
                              className={`rounded border px-2 py-1 text-[11px] font-semibold cursor-pointer transition ${
                                isAvaria
                                  ? 'border-red-400 bg-red-600 text-white'
                                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {isAvaria ? 'Avariado' : 'Marcar Avaria'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Optional Lote & Observation Inputs */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                        <div>
                          <input
                            type="text"
                            placeholder="Lote do Fabricante"
                            value={it.lote || ''}
                            onChange={(e) => handleUpdateLote(it.id, e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-[11px] bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Observação da conferência (motivo da divergência, caixa avariada, etc.)"
                            value={it.observacaoItem || ''}
                            onChange={(e) => handleUpdateItemObs(it.id, e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-[11px] bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Warehouse Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Observações Gerais do Almoxarifado
              </label>
              <textarea
                id="input-obs-almoxarifado"
                rows={2}
                placeholder="Insira detalhes sobre as condições de descarga, estado das embalagens, paletes ou horários..."
                value={observacoesAlmoxarifado}
                onChange={(e) => setObservacoesAlmoxarifado(e.target.value)}
                className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:outline-hidden focus:border-blue-600"
              />
            </div>

            {/* Divergence Notification Alert if divergent */}
            {temDivergencia ? (
              <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 space-y-2 text-amber-950">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase">Divergência Identificada na Conferência</h4>
                </div>
                <p className="text-xs leading-relaxed">
                  Foram identificados <strong>{itensDivergentes.length} item(ns) divergente(s)</strong> totalizando impacto de <strong>{formatCurrency(valorTotalDivergencia)}</strong>.
                </p>
                <div className="rounded-md bg-white/80 p-2.5 text-[11px] text-amber-900 border border-amber-200">
                  <strong className="block mb-0.5">Automação de E-mails acionada após a assinatura:</strong>
                  O sistema gerará automaticamente as notificações com todos os dados da NF, itens divergentes e solicitações formais para:
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li><strong>Faturamento:</strong> Solicitação imediata de NF de devolução simbólica/parcial.</li>
                    <li><strong>Compras:</strong> Notificação de fornecedor e cobrança de reposição.</li>
                    <li><strong>Financeiro:</strong> Glosa de valor e bloqueio preventivo de boleto.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-900 text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Conferência 100% Conforme</p>
                  <p className="text-emerald-800 text-[11px]">
                    Todos os itens conferem rigorosamente com a NF-e. Após a assinatura eletrônica, o processo será encaminhado para conclusão fiscal e liberação imediata do canhoto.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <p className="text-xs text-slate-500">
              Eliminação definitiva da ficha de papel com assinatura digital do Almoxarife.
            </p>
            <div className="flex items-center gap-2">
              <button
                id="btn-cancel-conferencia"
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Voltar
              </button>
              <button
                id="btn-open-signature-almox"
                type="button"
                onClick={handleOpenSignature}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
              >
                <PenTool className="h-4 w-4" />
                Finalizar Conferência e Assinar Eletronicamente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Signature Pad for Almoxarifado */}
      <SignaturePadModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={handleSignatureConfirmed}
        titulo="Assinatura Eletrônica do Almoxarifado"
        descricaoAcao={`Formalizar conferência física da NF-e nº ${nota.numeroNF}`}
        departamentoPadrao="Almoxarifado"
        responsavelPadrao="Marcos Vinícius Prado"
        cargoPadrao="Conferente Líder de Almoxarifado"
        matriculaPadrao="ALM-0492"
      />
    </>
  );
};
