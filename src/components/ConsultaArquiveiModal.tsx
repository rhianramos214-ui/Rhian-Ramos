import React from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Printer, ExternalLink } from 'lucide-react';
import { NotaFiscalProcesso } from '../types';
import { formatCurrency, formatCNPJ, formatChaveAcesso } from '../utils/formatters';

interface ConsultaArquiveiModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaFiscalProcesso | null;
}

export const ConsultaArquiveiModal: React.FC<ConsultaArquiveiModalProps> = ({
  isOpen,
  onClose,
  nota,
}) => {
  if (!isOpen || !nota) return null;

  return (
    <div id="arquivei-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div id="arquivei-modal-container" className="w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header styling like Arquivei portal */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-slate-950 font-bold text-sm">
              AQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Consulta Integrada Arquivei / SEFAZ</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" /> NF-e Autorizada (Status 100)
                </span>
              </div>
              <h3 className="text-sm font-medium text-slate-200">
                NF-e Nº {nota.numeroNF} • Série {nota.serie}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-danfe"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Printer className="h-3.5 w-3.5" /> Imprimir DANFE
            </button>
            <button
              id="btn-close-arquivei-modal"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content - DANFE Structure */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-slate-800">
          {/* Key barcode box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chave de Acesso da NF-e</span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Consulta SEFAZ Nacional autêntica
              </span>
            </div>
            <div className="font-mono text-sm tracking-wider font-semibold text-slate-900 bg-white p-2.5 rounded-md border border-slate-300 select-all break-all">
              {formatChaveAcesso(nota.chaveAcesso)}
            </div>
          </div>

          {/* Emitente & Destinatário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-2">Emitente (Fornecedor)</div>
              <h4 className="font-semibold text-sm text-slate-900">{nota.fornecedor.nome}</h4>
              <p className="text-xs text-slate-600 mt-1">CNPJ: {formatCNPJ(nota.fornecedor.cnpj)}</p>
              <p className="text-xs text-slate-600">{nota.fornecedor.cidadeUf}</p>
              {nota.fornecedor.email && (
                <p className="text-xs text-slate-500 mt-1">Contato: {nota.fornecedor.email}</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">Destinatário (Nossa Unidade)</div>
              <h4 className="font-semibold text-sm text-slate-900">Unidade Industrial & Logística Central S/A</h4>
              <p className="text-xs text-slate-600 mt-1">CNPJ: 54.120.980/0001-33</p>
              <p className="text-xs text-slate-600">Rodovia dos Bandeirantes, km 72 - Indaiatuba / SP</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Local de Entrega: {nota.docaDesignada}</p>
            </div>
          </div>

          {/* Transport Info */}
          <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">Dados do Transporte / Veículo</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Transportadora:</span>
                <span className="font-semibold text-slate-800">{nota.transportadora.nome}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Motorista:</span>
                <span className="font-semibold text-slate-800">{nota.transportadora.motorista}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Placa:</span>
                <span className="font-semibold text-slate-800">{nota.transportadora.placaVeiculo}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Data de Entrada:</span>
                <span className="font-semibold text-slate-800">{nota.dataEntradaFiscal}</span>
              </div>
            </div>
          </div>

          {/* Itens da NF */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Itens Faturados na NF-e ({nota.itens.length} {nota.itens.length === 1 ? 'item' : 'itens'})
              </h4>
              <span className="text-xs font-semibold text-slate-900">
                Total da Nota: {formatCurrency(nota.valorTotalNF)}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="px-3 py-2.5">Cód. Produto</th>
                    <th className="px-3 py-2.5">Descrição</th>
                    <th className="px-3 py-2.5">NCM</th>
                    <th className="px-3 py-2.5">CFOP</th>
                    <th className="px-3 py-2.5">Unid.</th>
                    <th className="px-3 py-2.5 text-right">Qtd. Faturada</th>
                    <th className="px-3 py-2.5 text-right">Vlr. Unitário</th>
                    <th className="px-3 py-2.5 text-right">Vlr. Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {nota.itens.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2.5 font-mono text-slate-700">{it.codigo}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-900">{it.descricao}</td>
                      <td className="px-3 py-2.5 text-slate-500">{it.ncm}</td>
                      <td className="px-3 py-2.5 text-slate-500">{it.cfop}</td>
                      <td className="px-3 py-2.5 text-slate-700 font-medium">{it.unidade}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-800">{it.quantidadeFaturada}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600">{formatCurrency(it.valorUnitario)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatCurrency(it.valorTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <p className="text-xs text-slate-500">
            Documento fiscal sincronizado via API Arquivei. Ficha física dispensada.
          </p>
          <button
            id="btn-close-arquivei"
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Fechar Consulta
          </button>
        </div>
      </div>
    </div>
  );
};
