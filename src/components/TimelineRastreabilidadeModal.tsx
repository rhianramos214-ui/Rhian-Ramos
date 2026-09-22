import React from 'react';
import { X, Clock, CheckCircle2, AlertTriangle, FileText, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';
import { NotaFiscalProcesso } from '../types';
import { formatCNPJ, formatChaveAcesso } from '../utils/formatters';

interface TimelineRastreabilidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaFiscalProcesso | null;
}

export const TimelineRastreabilidadeModal: React.FC<TimelineRastreabilidadeModalProps> = ({
  isOpen,
  onClose,
  nota,
}) => {
  if (!isOpen || !nota) return null;

  return (
    <div id="timeline-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div id="timeline-modal-container" className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Rastreabilidade & Auditoria Digital
                </span>
                <span className="rounded bg-blue-950 text-blue-300 text-[10px] px-2 py-0.5 border border-blue-800">
                  Substituição da Ficha Física
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-100">
                Histórico Completo da NF-e {nota.numeroNF}
              </h3>
            </div>
          </div>
          <button
            id="btn-close-timeline"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800">
          {/* Quick summary strip */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Fornecedor:</span>
              <span className="font-semibold text-slate-900">{nota.fornecedor.nome}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Doca & Motorista:</span>
              <span className="font-semibold text-slate-900">{nota.docaDesignada} • {nota.transportadora.motorista}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status Atual:</span>
              <span className="font-bold text-blue-700">
                {nota.status === 'LIBERADO_DESCARGA' && '1. Liberado para Descarga'}
                {nota.status === 'EM_CONFERENCIA' && '2. Em Conferência no Almoxarifado'}
                {nota.status === 'AGUARDANDO_FISCAL' && '3. Aguardando Validação Fiscal'}
                {nota.status === 'COM_DIVERGENCIA' && 'Atenção: Com Divergência Notificada'}
                {nota.status === 'CONCLUIDO' && '4. Concluído com Canhoto Liberado'}
              </span>
            </div>
          </div>

          {/* Timeline Nodes */}
          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
            {nota.historico.map((ev, idx) => {
              const isLast = idx === nota.historico.length - 1;
              const isDivergencia = ev.etapa.includes('Divergência') || ev.acao.includes('Divergência');

              return (
                <div key={ev.id || idx} className="relative group">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      isDivergencia
                        ? 'border-amber-500 text-amber-500'
                        : isLast
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-emerald-600 text-emerald-600'
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        isDivergencia ? 'bg-amber-500' : isLast ? 'bg-white' : 'bg-emerald-600'
                      }`}
                    />
                  </div>

                  {/* Card */}
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                        {ev.etapa}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {ev.dataHora}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900">{ev.acao}</h4>

                    {ev.detalhes && (
                      <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                        {ev.detalhes}
                      </p>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                        Responsável: <strong className="text-slate-700">{ev.responsavel}</strong>
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {ev.setor}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Double Signatures status badge if concluded */}
          {nota.status === 'CONCLUIDO' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Dupla Chancela Eletrônica Verificada
              </div>
              <p className="text-[11px] text-emerald-800">
                Este recebimento possui comprovação criptográfica completa assinada pelo conferente do Almoxarifado ({nota.assinaturaAlmoxarifado?.responsavel}) e pelo analista do Recebimento Fiscal ({nota.assinaturaFiscal?.responsavel}), com canhoto digital liberado nº {nota.canhotoDigital?.codigoCanhoto}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            id="btn-close-timeline-footer"
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
};
