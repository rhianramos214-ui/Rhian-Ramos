import React from 'react';
import {
  FileText,
  Truck,
  Building,
  Boxes,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Mail,
  FileSearch,
  PenTool,
} from 'lucide-react';
import { NotaFiscalProcesso } from '../types';
import { formatCurrency, formatCNPJ } from '../utils/formatters';

interface NotaProcessoCardProps {
  nota: NotaFiscalProcesso;
  onIniciarConferencia: (nota: NotaFiscalProcesso) => void;
  onConcluirFiscal: (nota: NotaFiscalProcesso) => void;
  onAbrirDivergencias: (nota: NotaFiscalProcesso) => void;
  onVerCanhoto: (nota: NotaFiscalProcesso) => void;
  onVerTimeline: (nota: NotaFiscalProcesso) => void;
  onAbrirArquivei: (nota: NotaFiscalProcesso) => void;
}

export const NotaProcessoCard: React.FC<NotaProcessoCardProps> = ({
  nota,
  onIniciarConferencia,
  onConcluirFiscal,
  onAbrirDivergencias,
  onVerCanhoto,
  onVerTimeline,
  onAbrirArquivei,
}) => {
  const getStatusBadge = () => {
    switch (nota.status) {
      case 'LIBERADO_DESCARGA':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <Truck className="h-3.5 w-3.5" /> 1 & 2. Liberado para Descarga
          </span>
        );
      case 'EM_CONFERENCIA':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
            <Boxes className="h-3.5 w-3.5" /> 3. Em Conferência (Almoxarifado)
          </span>
        );
      case 'AGUARDANDO_FISCAL':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Aguardando Conclusão Fiscal
          </span>
        );
      case 'COM_DIVERGENCIA':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Divergência Notificada
          </span>
        );
      case 'CONCLUIDO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 4. Concluído • Canhoto Liberado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`card-nf-${nota.id}`}
      className="rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      {/* Top Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded shadow-2xs">
              NF-e {nota.numeroNF}
            </span>
            <span className="text-xs text-slate-500 font-medium">Série {nota.serie}</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Fornecedor */}
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{nota.fornecedor.nome}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          CNPJ: {formatCNPJ(nota.fornecedor.cnpj)} • {nota.fornecedor.cidadeUf}
        </p>
      </div>

      {/* Card Info Details */}
      <div className="p-5 space-y-3.5 text-xs text-slate-600 grow">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Local de Descarga</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block">{nota.docaDesignada}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">Valor Total NF</span>
            <span className="font-bold text-blue-700 text-xs mt-0.5 block">{formatCurrency(nota.valorTotalNF)}</span>
          </div>
        </div>

        {/* Transport & Driver Info */}
        <div className="space-y-1 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Motorista:</span>
            <span className="font-semibold text-slate-800">{nota.transportadora.motorista}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Placa / Transportadora:</span>
            <span className="font-semibold text-slate-800">
              {nota.transportadora.placaVeiculo} • {nota.transportadora.nome.split(' ')[0]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Entrada no Fiscal:</span>
            <span className="font-medium text-slate-700">{nota.dataEntradaFiscal}</span>
          </div>
        </div>

        {/* Divergence highlight if present */}
        {nota.divergencia && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Divergência: {nota.divergencia.tipoGeral}
              </span>
              <span className="text-red-700">
                {formatCurrency(nota.divergencia.valorTotalDivergente)}
              </span>
            </div>
            <p className="text-[10px] text-amber-800 line-clamp-2">
              {nota.divergencia.itensAfetados.length} item(ns) com diferença apurada. E-mails enviados a Faturamento, Compras e Financeiro.
            </p>
          </div>
        )}

        {/* Dual Signature confirmation if concluded */}
        {nota.status === 'CONCLUIDO' && nota.canhotoDigital && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] space-y-1">
            <div className="flex items-center justify-between font-bold text-emerald-900">
              <span className="flex items-center gap-1">
                <QrCode className="h-3.5 w-3.5 text-emerald-600" /> Canhoto {nota.canhotoDigital.codigoCanhoto}
              </span>
              <span className="text-[10px] text-emerald-700 font-mono">Autenticado</span>
            </div>
            <p className="text-[10px] text-emerald-800">
              Assinado por: Almoxarifado ({nota.assinaturaAlmoxarifado?.matricula}) & Recebimento Fiscal ({nota.assinaturaFiscal?.matricula})
            </p>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2">
        {/* Primary Stage Action Button */}
        {nota.status === 'LIBERADO_DESCARGA' && (
          <button
            id={`btn-iniciar-descarga-${nota.id}`}
            type="button"
            onClick={() => onIniciarConferencia(nota)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
          >
            <Boxes className="h-4 w-4" />
            Iniciar Descarga & Conferência (Almoxarifado)
          </button>
        )}

        {nota.status === 'EM_CONFERENCIA' && (
          <button
            id={`btn-continuar-descarga-${nota.id}`}
            type="button"
            onClick={() => onIniciarConferencia(nota)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs cursor-pointer"
          >
            <Boxes className="h-4 w-4" />
            Continuar Conferência Física (Almoxarifado)
          </button>
        )}

        {nota.status === 'AGUARDANDO_FISCAL' && (
          <button
            id={`btn-concluir-fiscal-${nota.id}`}
            type="button"
            onClick={() => onConcluirFiscal(nota)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
          >
            <PenTool className="h-4 w-4" />
            Concluir Recebimento & Liberar Canhoto (Fiscal)
          </button>
        )}

        {nota.status === 'COM_DIVERGENCIA' && (
          <button
            id={`btn-abrir-divergencia-${nota.id}`}
            type="button"
            onClick={() => onAbrirDivergencias(nota)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-600 transition shadow-xs cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            Tratamento de Divergências & E-mails
          </button>
        )}

        {nota.status === 'CONCLUIDO' && (
          <button
            id={`btn-ver-canhoto-${nota.id}`}
            type="button"
            onClick={() => onVerCanhoto(nota)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            <QrCode className="h-4 w-4 text-emerald-400" />
            Visualizar / Imprimir Canhoto Digital
          </button>
        )}

        {/* Secondary Auxiliary Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            id={`btn-consultar-arquivei-${nota.id}`}
            type="button"
            onClick={() => onAbrirArquivei(nota)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <FileSearch className="h-3.5 w-3.5" /> Consulta Arquivei
          </button>

          <button
            id={`btn-ver-timeline-${nota.id}`}
            type="button"
            onClick={() => onVerTimeline(nota)}
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <Clock className="h-3.5 w-3.5" /> Histórico / Auditoria
          </button>
        </div>
      </div>
    </div>
  );
};
