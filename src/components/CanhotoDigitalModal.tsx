import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, QrCode, Download, Share2, Copy } from 'lucide-react';
import { NotaFiscalProcesso } from '../types';
import { formatCurrency, formatCNPJ, formatChaveAcesso } from '../utils/formatters';

interface CanhotoDigitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaFiscalProcesso | null;
}

export const CanhotoDigitalModal: React.FC<CanhotoDigitalModalProps> = ({
  isOpen,
  onClose,
  nota,
}) => {
  if (!isOpen || !nota || !nota.canhotoDigital) return null;

  const { canhotoDigital, assinaturaAlmoxarifado, assinaturaFiscal } = nota;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(canhotoDigital.autenticidadeHash);
    alert('Código de autenticidade copiado para a área de transferência!');
  };

  return (
    <div id="canhoto-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div id="canhoto-modal-container" className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Topbar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-slate-950 font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Canhoto Digital de Recebimento Liberado</h3>
              <p className="text-xs text-slate-400">Processo formalizado eletronicamente com dupla chancela (Almoxarifado + Fiscal)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-print-canhoto"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Imprimir Canhoto
            </button>
            <button
              id="btn-close-canhoto-modal"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Canhoto Body */}
        <div id="canhoto-printable-area" className="p-6 md:p-8 bg-white space-y-6">
          {/* Top simulated perforated line */}
          <div className="border-b-2 border-dashed border-slate-300 pb-3 text-center">
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-mono">
              - - - - - - - - - CANHOTO ELETRÔNICO DA NOTA FISCAL (COMPROVANTE DE ENTREGA) - - - - - - - - -
            </span>
          </div>

          {/* Official Canhoto Box */}
          <div className="rounded-lg border-2 border-slate-800 p-5 bg-white space-y-4">
            {/* Header section with receipt legal statement */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-slate-300 pb-4">
              <div className="md:col-span-3 space-y-2">
                <p className="text-xs leading-relaxed font-serif uppercase font-semibold text-slate-800">
                  RECEBEMOS DA EMPRESA <span className="underline font-bold text-slate-950">{nota.fornecedor.nome}</span> OS MATERIAIS / PRODUTOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO, EM PERFEITAS CONDIÇÕES CONFERIDAS E ACEITAS.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span><strong>CNPJ Emitente:</strong> {formatCNPJ(nota.fornecedor.cnpj)}</span>
                  <span><strong>Valor Total:</strong> {formatCurrency(nota.valorTotalNF)}</span>
                  <span><strong>Data Emissão:</strong> {nota.dataEmissao}</span>
                </div>
              </div>

              {/* NF & Serie Badge */}
              <div className="flex flex-col justify-center items-center rounded-md border-2 border-slate-800 bg-slate-50 p-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">NF-e Nº</span>
                <span className="text-lg font-black text-slate-900">{nota.numeroNF}</span>
                <span className="text-xs font-semibold text-slate-700">SÉRIE {nota.serie}</span>
              </div>
            </div>

            {/* Access key */}
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
              <span className="font-sans font-semibold text-slate-700 mr-2">Chave de Acesso:</span>
              {formatChaveAcesso(nota.chaveAcesso)}
            </div>

            {/* Electronic Signatures Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-300 pt-4">
              {/* Almoxarifado Sign */}
              <div className="rounded-md border border-slate-300 p-3.5 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                    1. Conferência & Descarga (Almoxarifado)
                  </span>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                {assinaturaAlmoxarifado ? (
                  <div className="space-y-1">
                    <div className="h-14 flex items-center justify-center bg-white rounded border border-slate-200 p-1">
                      <img
                        src={assinaturaAlmoxarifado.rubricaBase64}
                        alt="Rubrica Almoxarifado"
                        className="max-h-full object-contain"
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{assinaturaAlmoxarifado.responsavel}</p>
                    <p className="text-[11px] text-slate-600">{assinaturaAlmoxarifado.cargo} • Matrícula: {assinaturaAlmoxarifado.matricula}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Assinado em: {assinaturaAlmoxarifado.dataHora}</p>
                    <p className="text-[9px] text-slate-400 font-mono truncate">Hash: {assinaturaAlmoxarifado.hashAutenticacao}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Pendente</p>
                )}
              </div>

              {/* Recebimento Fiscal Sign */}
              <div className="rounded-md border border-slate-300 p-3.5 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                    2. Conclusão & Liberação (Recebimento Fiscal)
                  </span>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                {assinaturaFiscal ? (
                  <div className="space-y-1">
                    <div className="h-14 flex items-center justify-center bg-white rounded border border-slate-200 p-1">
                      <img
                        src={assinaturaFiscal.rubricaBase64}
                        alt="Rubrica Recebimento Fiscal"
                        className="max-h-full object-contain"
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{assinaturaFiscal.responsavel}</p>
                    <p className="text-[11px] text-slate-600">{assinaturaFiscal.cargo} • Matrícula: {assinaturaFiscal.matricula}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Liberado em: {assinaturaFiscal.dataHora}</p>
                    <p className="text-[9px] text-slate-400 font-mono truncate">Hash: {assinaturaFiscal.hashAutenticacao}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Pendente</p>
                )}
              </div>
            </div>

            {/* Transport & Driver Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-300 pt-3 text-xs">
              <div>
                <span className="text-slate-500 block">Transportadora / Empresa:</span>
                <span className="font-semibold text-slate-800">{nota.transportadora.nome}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Motorista Portador:</span>
                <span className="font-semibold text-slate-800">{nota.transportadora.motorista}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Placa do Veículo / Doca:</span>
                <span className="font-semibold text-slate-800">{nota.transportadora.placaVeiculo} • {nota.docaDesignada}</span>
              </div>
            </div>

            {/* Authentication Bar with QR Code */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-md p-3">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-white p-1 rounded-md border border-emerald-300 flex items-center justify-center shadow-xs">
                  <QrCode className="h-12 w-12 text-slate-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase">Autenticação Digital Válida</span>
                    <span className="rounded bg-emerald-200 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-900">
                      {canhotoDigital.situacaoCanhoto}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                    {canhotoDigital.codigoCanhoto}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono truncate max-w-sm">
                    Token: {canhotoDigital.autenticidadeHash}
                  </p>
                </div>
              </div>
              <button
                id="btn-copy-token"
                type="button"
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar Código
              </button>
            </div>
          </div>

          {/* Items Summary on Canhoto */}
          <div className="text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-700">Resumo dos itens recebidos e armazenados:</span>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-md">
              {nota.itens.map((it) => (
                <div key={it.id} className="flex items-center justify-between px-3 py-1.5 text-[11px]">
                  <span>
                    <strong className="text-slate-800">{it.codigo}</strong> - {it.descricao}
                  </span>
                  <span className="font-bold text-slate-900">
                    {it.quantidadeRecebida || it.quantidadeFaturada} {it.unidade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5 print:hidden">
          <p className="text-xs text-slate-500">
            Liberação do canhoto autorizada. O motorista pode ser liberado da portaria.
          </p>
          <button
            id="btn-close-canhoto-footer"
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Concluir Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
