import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Boxes,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Truck,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building,
  DollarSign,
  ShoppingCart,
  QrCode,
} from 'lucide-react';
import {
  NotaFiscalProcesso,
  PerfilUsuario,
  StatusProcesso,
  NotificacaoSetor,
} from './types';
import { INITIAL_NOTAS_FISCAIS } from './mockData';
import { Navbar } from './components/Navbar';
import { ProcessFlowBanner } from './components/ProcessFlowBanner';
import { NotaProcessoCard } from './components/NotaProcessoCard';
import { NovaEntradaModal } from './components/NovaEntradaModal';
import { ConferenciaAlmoxarifadoModal } from './components/ConferenciaAlmoxarifadoModal';
import { ConclusaoFiscalModal } from './components/ConclusaoFiscalModal';
import { CentralDivergenciasModal } from './components/CentralDivergenciasModal';
import { CanhotoDigitalModal } from './components/CanhotoDigitalModal';
import { TimelineRastreabilidadeModal } from './components/TimelineRastreabilidadeModal';
import { ConsultaArquiveiModal } from './components/ConsultaArquiveiModal';
import { formatCurrency } from './utils/formatters';

const STORAGE_KEY = 'automacao_recebimento_notas_v1';

export default function App() {
  // Load saved state or default to INITIAL_NOTAS_FISCAIS
  const [notas, setNotas] = useState<NotaFiscalProcesso[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Falha ao carregar localStorage:', e);
    }
    return INITIAL_NOTAS_FISCAIS;
  });

  // Filter and view states
  const [perfilAtivo, setPerfilAtivo] = useState<PerfilUsuario>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  // Modal controls
  const [isNovaEntradaOpen, setIsNovaEntradaOpen] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscalProcesso | null>(null);

  const [modalConferenciaOpen, setModalConferenciaOpen] = useState(false);
  const [modalConclusaoFiscalOpen, setModalConclusaoFiscalOpen] = useState(false);
  const [modalDivergenciasOpen, setModalDivergenciasOpen] = useState(false);
  const [modalCanhotoOpen, setModalCanhotoOpen] = useState(false);
  const [modalTimelineOpen, setModalTimelineOpen] = useState(false);
  const [modalArquiveiOpen, setModalArquiveiOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  const showToast = (text: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notas));
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }
  }, [notas]);

  // Reset to initial mock data
  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os processos de exemplo originais?')) {
      setNotas(INITIAL_NOTAS_FISCAIS);
      showToast('Dados restaurados com sucesso para os exemplos do fluxo!');
    }
  };

  // Handlers for steps
  const handleSalvarNovaEntrada = (novaNF: NotaFiscalProcesso) => {
    setNotas([novaNF, ...notas]);
    showToast(
      `NF-e ${novaNF.numeroNF} recebida pelo Fiscal e LIBERADA para descarga na ${novaNF.docaDesignada}!`,
      'success'
    );
  };

  const handleSalvarConferencia = (
    notaAtualizada: NotaFiscalProcesso,
    houveDivergencia: boolean
  ) => {
    setNotas((prev) =>
      prev.map((n) => (n.id === notaAtualizada.id ? notaAtualizada : n))
    );

    if (houveDivergencia) {
      showToast(
        `Divergência registrada com sucesso! Notificações automáticas enviadas por e-mail para Faturamento, Compras e Financeiro.`,
        'alert'
      );
      // Auto open divergence modal to show the dispatched e-mails immediately
      setNotaSelecionada(notaAtualizada);
      setModalDivergenciasOpen(true);
    } else {
      showToast(
        `Conferência 100% aprovada e assinada pelo Almoxarifado! Processo encaminhado ao Recebimento Fiscal para liberação do canhoto.`,
        'success'
      );
    }
  };

  const handleConcluirFiscal = (notaConcluida: NotaFiscalProcesso) => {
    setNotas((prev) =>
      prev.map((n) => (n.id === notaConcluida.id ? notaConcluida : n))
    );
    showToast(
      `Processo concluído com sucesso! Canhoto Digital ${notaConcluida.canhotoDigital?.codigoCanhoto} liberado com QR Code.`,
      'success'
    );
    // Auto open the released digital receipt
    setNotaSelecionada(notaConcluida);
    setModalCanhotoOpen(true);
  };

  const handleUpdateStatusTratativa = (
    notaId: string,
    setor: string,
    novoStatus: NotificacaoSetor['statusTratativa']
  ) => {
    setNotas((prev) =>
      prev.map((n) => {
        if (n.id !== notaId || !n.divergencia) return n;
        const notificacoesAtualizadas = n.divergencia.notificacoes.map((notif) =>
          notif.setor === setor ? { ...notif, statusTratativa: novoStatus } : notif
        );
        return {
          ...n,
          divergencia: {
            ...n.divergencia,
            notificacoes: notificacoesAtualizadas,
          },
        };
      })
    );
    showToast(`Status da tratativa com ${setor} atualizado para "${novoStatus}".`);
  };

  const handleLiberarComRessalva = (notaAlvo: NotaFiscalProcesso) => {
    setNotaSelecionada(notaAlvo);
    setModalConclusaoFiscalOpen(true);
  };

  // Open modals helper
  const handleOpenConferencia = (nota: NotaFiscalProcesso) => {
    setNotaSelecionada(nota);
    setModalConferenciaOpen(true);
  };

  const handleOpenConclusaoFiscal = (nota: NotaFiscalProcesso) => {
    setNotaSelecionada(nota);
    setModalConclusaoFiscalOpen(true);
  };

  const handleOpenDivergencias = (nota: NotaFiscalProcesso) => {
    setNotaSelecionada(nota);
    setModalDivergenciasOpen(true);
  };

  const handleOpenCanhoto = (nota: NotaFiscalProcesso) => {
    setNotaSelecionada(nota);
    setModalCanhotoOpen(true);
  };

  const handleOpenTimeline = (nota: NotaFiscalProcesso) => {
    setNotaSelecionada(nota);
    setModalTimelineOpen(true);
  };

  const handleOpenArquivei = (nota: NotaFiscalProcesso) => {
    setNotaSelecionada(nota);
    setModalArquiveiOpen(true);
  };

  // Counts for KPIs
  const counts = {
    total: notas.length,
    liberadoDescarga: notas.filter((n) => n.status === 'LIBERADO_DESCARGA').length,
    emConferencia: notas.filter((n) => n.status === 'EM_CONFERENCIA').length,
    aguardandoFiscal: notas.filter((n) => n.status === 'AGUARDANDO_FISCAL').length,
    comDivergencia: notas.filter((n) => n.status === 'COM_DIVERGENCIA').length,
    concluido: notas.filter((n) => n.status === 'CONCLUIDO').length,
  };

  // Filter logic
  const filteredNotas = notas.filter((n) => {
    // Role filter
    if (perfilAtivo === 'RECEBIMENTO_FISCAL') {
      // Fiscal cares about new entries, pending approvals, and concluded receipts
      if (statusFilter === 'TODOS' && n.status === 'EM_CONFERENCIA') return true;
    } else if (perfilAtivo === 'ALMOXARIFADO') {
      // Warehouse cares about incoming trucks, queues, and ongoing conferences
      if (statusFilter === 'TODOS' && n.status === 'CONCLUIDO') return true;
    } else if (perfilAtivo === 'DIVERGENCIAS_AUDITORIA') {
      // Divergence view filters directly to divergent notes
      if (n.status !== 'COM_DIVERGENCIA') return false;
    }

    // Status filter
    if (statusFilter !== 'TODOS' && n.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = n.numeroNF.toLowerCase().includes(q);
      const matchFornec = n.fornecedor.nome.toLowerCase().includes(q);
      const matchPlaca = n.transportadora.placaVeiculo.toLowerCase().includes(q);
      const matchMotorista = n.transportadora.motorista.toLowerCase().includes(q);
      const matchDoca = n.docaDesignada.toLowerCase().includes(q);
      const matchChave = n.chaveAcesso.toLowerCase().includes(q);
      return matchNum || matchFornec || matchPlaca || matchMotorista || matchDoca || matchChave;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce shadow-2xl">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-white shadow-lg ${
              toastMessage.type === 'alert' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          >
            {toastMessage.type === 'alert' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        perfilAtivo={perfilAtivo}
        onSelectPerfil={setPerfilAtivo}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onOpenNovaEntrada={() => setIsNovaEntradaOpen(true)}
        counts={counts}
      />

      {/* Process Step Workflow Banner */}
      <ProcessFlowBanner />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 grow">
        {/* Metric KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div
            onClick={() => setStatusFilter('LIBERADO_DESCARGA')}
            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-blue-300 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase">
              <span>1 & 2. Fila p/ Descarga</span>
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xl font-black text-blue-700 mt-1">{counts.liberadoDescarga}</p>
            <p className="text-[10px] text-slate-400">Liberado pelo Fiscal</p>
          </div>

          <div
            onClick={() => setStatusFilter('EM_CONFERENCIA')}
            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-indigo-300 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase">
              <span>3. Em Conferência</span>
              <Boxes className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-xl font-black text-indigo-700 mt-1">{counts.emConferencia}</p>
            <p className="text-[10px] text-slate-400">Na doca do Almoxarifado</p>
          </div>

          <div
            onClick={() => setStatusFilter('AGUARDANDO_FISCAL')}
            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-emerald-300 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase">
              <span>Validação Fiscal</span>
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-emerald-700 mt-1">{counts.aguardandoFiscal}</p>
            <p className="text-[10px] text-slate-400">Aguardando liberar canhoto</p>
          </div>

          <div
            onClick={() => {
              setPerfilAtivo('DIVERGENCIAS_AUDITORIA');
              setStatusFilter('COM_DIVERGENCIA');
            }}
            className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 shadow-2xs hover:border-amber-400 transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold uppercase">
              <span>Com Divergência</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-700 mt-1">{counts.comDivergencia}</p>
            <p className="text-[10px] text-amber-800 font-medium">E-mails acionados</p>
          </div>

          <div
            onClick={() => setStatusFilter('CONCLUIDO')}
            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase">
              <span>4. Concluídos</span>
              <QrCode className="h-4 w-4 text-slate-800" />
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">{counts.concluido}</p>
            <p className="text-[10px] text-slate-400">Canhoto digital emitido</p>
          </div>
        </div>

        {/* Section Title & View Sub-Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Processos de Recebimento de Materiais</span>
              <span className="rounded-full bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 font-semibold">
                {filteredNotas.length} de {notas.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {perfilAtivo === 'TODOS' && 'Acompanhamento integrado de todas as etapas operacionais em tempo real.'}
              {perfilAtivo === 'RECEBIMENTO_FISCAL' && 'Visão Recebimento Fiscal: Entrada de notas, validação de conferências físicas e emissão de canhoto.'}
              {perfilAtivo === 'ALMOXARIFADO' && 'Visão Almoxarifado: Fila de caminhões liberados para descarga, conferência item a item e assinatura eletrônica.'}
              {perfilAtivo === 'DIVERGENCIAS_AUDITORIA' && 'Visão Central de Divergências: Gestão de notificações para Faturamento, Compras e Financeiro.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              id="btn-reset-mock-data"
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Restaurar Exemplos
            </button>
            <button
              id="btn-nova-entrada-cta"
              type="button"
              onClick={() => setIsNovaEntradaOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Nova Entrada NF
            </button>
          </div>
        </div>

        {/* Process Cards Grid */}
        {filteredNotas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotas.map((nota) => (
              <NotaProcessoCard
                key={nota.id}
                nota={nota}
                onIniciarConferencia={handleOpenConferencia}
                onConcluirFiscal={handleOpenConclusaoFiscal}
                onAbrirDivergencias={handleOpenDivergencias}
                onVerCanhoto={handleOpenCanhoto}
                onVerTimeline={handleOpenTimeline}
                onAbrirArquivei={handleOpenArquivei}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Boxes className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhum processo encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Nenhuma Nota Fiscal corresponde aos filtros ou termo de busca informado. Tente limpar os filtros ou registrar uma nova entrada.
            </p>
            <div className="pt-2">
              <button
                id="btn-clear-filters"
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('TODOS');
                  setPerfilAtivo('TODOS');
                }}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Limpar Filtros de Busca
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Automação do Processo de Recebimento de Materiais • <strong>Recebimento Fiscal ✕ Almoxarifado</strong>
          </span>
          <span className="text-[11px] text-slate-400">
            Integração SEFAZ/Arquivei • Eliminação de Fichas Físicas • Notificação Automática a Faturamento, Compras e Financeiro
          </span>
        </div>
      </footer>

      {/* MODAL 1: Nova Entrada da NF (Recebimento Fiscal) */}
      <NovaEntradaModal
        isOpen={isNovaEntradaOpen}
        onClose={() => setIsNovaEntradaOpen(false)}
        onSalvarEntrada={handleSalvarNovaEntrada}
      />

      {/* MODAL 2: Conferência Física no Almoxarifado */}
      <ConferenciaAlmoxarifadoModal
        isOpen={modalConferenciaOpen}
        onClose={() => setModalConferenciaOpen(false)}
        nota={notaSelecionada}
        onSalvarConferencia={handleSalvarConferencia}
        onAbrirArquivei={handleOpenArquivei}
      />

      {/* MODAL 3: Conclusão do Processo e Liberação de Canhoto (Recebimento Fiscal) */}
      <ConclusaoFiscalModal
        isOpen={modalConclusaoFiscalOpen}
        onClose={() => setModalConclusaoFiscalOpen(false)}
        nota={notaSelecionada}
        onConcluirProcesso={handleConcluirFiscal}
      />

      {/* MODAL 4: Central de Divergências & E-mails Automáticos */}
      <CentralDivergenciasModal
        isOpen={modalDivergenciasOpen}
        onClose={() => setModalDivergenciasOpen(false)}
        nota={notaSelecionada}
        onUpdateStatusTratativa={handleUpdateStatusTratativa}
        onLiberarComRessalva={handleLiberarComRessalva}
      />

      {/* MODAL 5: Canhoto Digital Oficial com QR Code */}
      <CanhotoDigitalModal
        isOpen={modalCanhotoOpen}
        onClose={() => setModalCanhotoOpen(false)}
        nota={notaSelecionada}
      />

      {/* MODAL 6: Histórico & Rastreabilidade / Auditoria */}
      <TimelineRastreabilidadeModal
        isOpen={modalTimelineOpen}
        onClose={() => setModalTimelineOpen(false)}
        nota={notaSelecionada}
      />

      {/* MODAL 7: Consulta Arquivei / XML DANFE */}
      <ConsultaArquiveiModal
        isOpen={modalArquiveiOpen}
        onClose={() => setModalArquiveiOpen(false)}
        nota={notaSelecionada}
      />
    </div>
  );
}
