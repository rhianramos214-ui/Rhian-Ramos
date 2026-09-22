import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  PenTool,
  ArrowRight,
  Package,
  Printer,
  QrCode,
} from 'lucide-react';
import { NotaFiscalProcesso, AssinaturaEletronica, CanhotoDigital } from '../types';
import { SignaturePadModal } from './SignaturePadModal';
import { formatCurrency, formatCNPJ, formatChaveAcesso, generateCanhotoCode, generateHash } from '../utils/formatters';

interface ConclusaoFiscalModalProps {
  isOpen: boolean;
  onClose: () => void;
  nota: NotaFiscalProcesso | null;
  onConcluirProcesso: (notaConcluida: NotaFiscalProcesso) => void;
}

export const ConclusaoFiscalModal: React.FC<ConclusaoFiscalModalProps> = ({
  isOpen,
  onClose,
  nota,
  onConcluirProcesso,
}) => {
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  if (!isOpen || !nota) return null;

  const { assinaturaAlmoxarifado } = nota;

  const handleOpenSignature = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureConfirmed = (assinaturaFiscal: AssinaturaEletronica) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const codigoCanhoto = generateCanhotoCode();
    const autenticidadeHash = generateHash('CNH-AUT');

    const canhotoDigital: CanhotoDigital = {
      codigoCanhoto,
      dataHoraLiberacao: formattedDate,
      liberadoPorFiscal: `${assinaturaFiscal.responsavel} (Matr. ${assinaturaFiscal.matricula})`,
      matriculaFiscal: assinaturaFiscal.matricula,
      conferidoPorAlmoxarife: assinaturaAlmoxarifado
        ? `${assinaturaAlmoxarifado.responsavel} (Matr. ${assinaturaAlmoxarifado.matricula})`
        : 'Conferente Almoxarifado',
      matriculaAlmoxarife: assinaturaAlmoxarifado?.matricula || 'ALM-0000',
      motoristaRecebedor: nota.transportadora.motorista,
      placaVeiculo: nota.transportadora.placaVeiculo,
      autenticidadeHash,
      situacaoCanhoto: nota.status === 'COM_DIVERGENCIA'
        ? 'Liberado com Ressalva/Devolução Parcial'
        : 'Liberado com Sucesso',
    };

    const notaConcluida: NotaFiscalProcesso = {
      ...nota,
      status: 'CONCLUIDO',
      assinaturaFiscal,
      canhotoDigital,
      historico: [
        ...nota.historico,
        {
          id: `h-${Date.now()}-conclusao`,
          dataHora: formattedDate,
          etapa: '4. Conclusão do Processo - Recebimento Fiscal',
          acao: 'Recebimento formalizado, validado e Canhoto Digital liberado.',
          responsavel: assinaturaFiscal.responsavel,
          setor: 'Recebimento Fiscal',
          detalhes: `Assinatura eletrônica concluída. Canhoto ${codigoCanhoto} gerado e disponibilizado para impressão/embarque do motorista.`,
        }
      ]
    };

    onConcluirProcesso(notaConcluida);
    onClose();
  };

  return (
    <>
      <div id="conclusao-fiscal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
        <div id="conclusao-fiscal-container" className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Etapa 4 • Recebimento Fiscal
                  </span>
                  <span className="rounded bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 border border-emerald-800">
                    Conclusão & Liberação de Canhoto
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100">
                  Validar Conferência e Liberar Canhoto da NF-e {nota.numeroNF}
                </h3>
              </div>
            </div>
            <button
              id="btn-close-conclusao"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-slate-800">
            {/* Status Summary Banner */}
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">
                    Conferência do Almoxarifado Aprovada
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Todos os itens foram descarregados e atestados com assinatura eletrônica pelo Almoxarifado. O processo está apto para validação fiscal e emissão do canhoto digital.
                  </p>
                </div>
              </div>
            </div>

            {/* NF Details */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Fornecedor:</span>
                <span className="font-semibold text-slate-900">{nota.fornecedor.nome}</span>
                <span className="text-[11px] text-slate-500 block">CNPJ: {formatCNPJ(nota.fornecedor.cnpj)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Transportador & Motorista:</span>
                <span className="font-semibold text-slate-900">{nota.transportadora.nome}</span>
                <span className="text-[11px] text-slate-600 block">{nota.transportadora.motorista} (Placa {nota.transportadora.placaVeiculo})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total da NF:</span>
                <span className="font-bold text-slate-900 text-sm">{formatCurrency(nota.valorTotalNF)}</span>
                <span className="text-[11px] text-slate-500 block">Chave: ...{nota.chaveAcesso.slice(-12)}</span>
              </div>
            </div>

            {/* Warehouse Signature Verification Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Assinatura Eletrônica Registrada pelo Almoxarifado
                </h4>
                <span className="text-[10px] rounded bg-blue-200 text-blue-900 px-2 py-0.5 font-bold">
                  Autenticada
                </span>
              </div>

              {assinaturaAlmoxarifado ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-md border border-blue-100 items-center">
                  <div className="sm:col-span-2 space-y-1 text-xs">
                    <p className="font-semibold text-slate-900">{assinaturaAlmoxarifado.responsavel}</p>
                    <p className="text-slate-600">{assinaturaAlmoxarifado.cargo} • Matrícula: {assinaturaAlmoxarifado.matricula}</p>
                    <p className="text-slate-500 text-[11px] font-mono">Data/Hora: {assinaturaAlmoxarifado.dataHora}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">Hash: {assinaturaAlmoxarifado.hashAutenticacao}</p>
                  </div>
                  <div className="h-14 flex items-center justify-center bg-slate-50 rounded border border-slate-200 p-1">
                    <img
                      src={assinaturaAlmoxarifado.rubricaBase64}
                      alt="Rubrica Almoxarifado"
                      className="max-h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Pendente</p>
              )}
            </div>

            {/* Items Verified Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-slate-500" />
                Resumo dos Itens Conferidos ({nota.itens.length})
              </h4>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100 text-xs">
                {nota.itens.map((it) => (
                  <div key={it.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                    <div>
                      <span className="font-mono text-slate-600 mr-2">{it.codigo}</span>
                      <span className="font-medium text-slate-900">{it.descricao}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">
                        {it.quantidadeRecebida || it.quantidadeFaturada} {it.unidade}
                      </span>
                      <span className="text-[11px] text-emerald-600 block">100% Conforme</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formal Fiscal Statement */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 leading-relaxed">
              <strong>Formalização Fiscal:</strong> Ao assinar eletronicamente esta etapa, o Recebimento Fiscal valida a conformidade da entrada física com a escrituração contábil/fiscal da NF-e, emitindo o Canhoto Digital com QR Code que substitui o canhoto de papel para liberação do motorista na portaria.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <p className="text-xs text-slate-500">
              Processo 100% rastreável e auditável.
            </p>
            <div className="flex items-center gap-2">
              <button
                id="btn-cancel-conclusao"
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Voltar
              </button>
              <button
                id="btn-open-signature-fiscal"
                type="button"
                onClick={handleOpenSignature}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
              >
                <PenTool className="h-4 w-4" />
                Assinar Eletronicamente & Liberar Canhoto Digital
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Signature Pad for Fiscal */}
      <SignaturePadModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={handleSignatureConfirmed}
        titulo="Assinatura Eletrônica do Recebimento Fiscal"
        descricaoAcao={`Validação final e liberação de canhoto da NF-e nº ${nota.numeroNF}`}
        departamentoPadrao="Recebimento Fiscal"
        responsavelPadrao="Fernanda Rocha Silva"
        cargoPadrao="Analista de Recebimento Fiscal Sênior"
        matriculaPadrao="FIS-0188"
      />
    </>
  );
};
