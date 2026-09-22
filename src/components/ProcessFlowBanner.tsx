import React, { useState } from 'react';
import {
  FileText,
  Truck,
  Boxes,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const ProcessFlowBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              <Info className="h-3.5 w-3.5" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-900">
                Fluxo Automatizado de Recebimento de Materiais
              </span>
              <span className="text-xs text-slate-500 ml-2 hidden md:inline">
                Substituição definitiva da ficha de conferência física pelo fluxo digital integrado em 4 etapas
              </span>
            </div>
          </div>

          <button
            id="btn-toggle-flow-details"
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer self-start sm:self-auto"
          >
            {expanded ? 'Ocultar Detalhes do Fluxo' : 'Entender as 4 Etapas & Divergências'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* 4 Interactive Flow Steps Visualizer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100 text-xs">
          {/* Step 1 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">1</span>
              <span>Entrada da NF</span>
            </div>
            <p className="text-[11px] text-slate-600">Recebimento Fiscal dá entrada na NF; sistema registra e libera para descarga.</p>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">2</span>
              <span>Liberação p/ Descarga</span>
            </div>
            <p className="text-[11px] text-slate-600">Almoxarifado acompanha fila liberada na doca em tempo real no sistema.</p>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">3</span>
              <span>Descarga & Conferência</span>
            </div>
            <p className="text-[11px] text-slate-600">Almoxarife confere com dados Arquivei e finaliza com assinatura eletrônica.</p>
          </div>

          {/* Step 4 */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">4</span>
              <span>Conclusão & Canhoto</span>
            </div>
            <p className="text-[11px] text-slate-600">Fiscal valida, realiza sua assinatura eletrônica e libera o canhoto digital.</p>
          </div>
        </div>

        {/* Expanded Description Accordion */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Por que a ficha de papel foi eliminada?
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Como o pessoal do Almoxarifado já possui acesso ao <strong>Arquivei</strong>, as informações da NF já ficam disponíveis para consulta durante a conferência. A ficha física não funcionava como uma &quot;ficha cega&quot;, gerando morosidade no trânsito de papéis físicos entre a portaria, o fiscal e a doca. A automação digital garante agilidade, sustentabilidade e rastreabilidade com carimbos criptográficos.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Tratamento Automático de Divergências
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Ao constatar falta, excesso ou avaria, o sistema registra a diferença e dispara automaticamente notificações por e-mail para:
                  <br />• <strong>Faturamento:</strong> Solicitação para emissão de NF de devolução.
                  <br />• <strong>Compras:</strong> Notificação de reposição e contato com o fornecedor.
                  <br />• <strong>Financeiro:</strong> Bloqueio preventivo de boleto e glosa de pagamento.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
