import React from 'react';
import {
  FileText,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Search,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PerfilUsuario, StatusProcesso } from '../types';

interface NavbarProps {
  perfilAtivo: PerfilUsuario;
  onSelectPerfil: (perfil: PerfilUsuario) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onOpenNovaEntrada: () => void;
  counts: {
    total: number;
    liberadoDescarga: number;
    emConferencia: number;
    aguardandoFiscal: number;
    comDivergencia: number;
    concluido: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  perfilAtivo,
  onSelectPerfil,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenNovaEntrada,
  counts,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Brand & Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow-sm">
              AR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Automação de Recebimento de Materiais
                </span>
                <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-800">
                  Sem Fichas Físicas • 100% Digital
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Recebimento Fiscal <span className="text-blue-400">✕</span> Almoxarifado
              </h1>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              id="btn-nova-entrada-top"
              type="button"
              onClick={onOpenNovaEntrada}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              1. Nova Entrada de NF (Fiscal)
            </button>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-2 pb-3 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold mr-1 shrink-0">
            Filtrar Visão:
          </span>

          <button
            id="tab-perfil-todos"
            onClick={() => onSelectPerfil('TODOS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
              perfilAtivo === 'TODOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Visão Geral Integrada ({counts.total})
          </button>

          <button
            id="tab-perfil-fiscal"
            onClick={() => onSelectPerfil('RECEBIMENTO_FISCAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
              perfilAtivo === 'RECEBIMENTO_FISCAL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Recebimento Fiscal (Entrada & Liberação Canhoto)
            {counts.aguardandoFiscal > 0 && (
              <span className="rounded-full bg-emerald-500 text-slate-950 px-1.5 py-0.2 text-[10px] font-bold">
                {counts.aguardandoFiscal}
              </span>
            )}
          </button>

          <button
            id="tab-perfil-almoxarifado"
            onClick={() => onSelectPerfil('ALMOXARIFADO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
              perfilAtivo === 'ALMOXARIFADO'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            Almoxarifado (Fila de Descarga & Conferência)
            {counts.liberadoDescarga > 0 && (
              <span className="rounded-full bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] font-bold">
                {counts.liberadoDescarga}
              </span>
            )}
          </button>

          <button
            id="tab-perfil-divergencias"
            onClick={() => onSelectPerfil('DIVERGENCIAS_AUDITORIA')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 ${
              perfilAtivo === 'DIVERGENCIAS_AUDITORIA'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Tratamento de Divergências (Faturamento/Compras/Fin.)
            {counts.comDivergencia > 0 && (
              <span className="rounded-full bg-red-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {counts.comDivergencia}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-950/60 border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-search-nf"
              type="text"
              placeholder="Buscar por NF, fornecedor, placa ou motorista..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Status do Fluxo:</span>
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="TODOS">Todos os Status ({counts.total})</option>
              <option value="LIBERADO_DESCARGA">1 & 2. Liberado para Descarga ({counts.liberadoDescarga})</option>
              <option value="EM_CONFERENCIA">3. Em Conferência no Almoxarifado ({counts.emConferencia})</option>
              <option value="AGUARDANDO_FISCAL">Aguardando Conclusão Fiscal ({counts.aguardandoFiscal})</option>
              <option value="COM_DIVERGENCIA">Com Divergência / E-mails Enviados ({counts.comDivergencia})</option>
              <option value="CONCLUIDO">4. Concluído / Canhoto Liberado ({counts.concluido})</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
