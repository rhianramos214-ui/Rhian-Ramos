import React, { useState } from 'react';
import {
  X,
  FilePlus,
  Truck,
  Building2,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Barcode,
} from 'lucide-react';
import { NotaFiscalProcesso, ItemNF } from '../types';
import { TEMPLATES_NF_ENTRADA } from '../mockData';
import { formatCurrency, formatCNPJ, generateHash } from '../utils/formatters';

interface NovaEntradaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvarEntrada: (novaNF: NotaFiscalProcesso) => void;
}

export const NovaEntradaModal: React.FC<NovaEntradaModalProps> = ({
  isOpen,
  onClose,
  onSalvarEntrada,
}) => {
  const [numeroNF, setNumeroNF] = useState('000.049.100');
  const [serie, setSerie] = useState('1');
  const [chaveAcesso, setChaveAcesso] = useState('352609' + Math.random().toString().slice(2, 16) + '550010000491001004910088');
  const [docaDesignada, setDocaDesignada] = useState('Doca 01 - Almoxarifado Geral');

  const [fornecedorNome, setFornecedorNome] = useState('Metalfix Parafusos & Fixadores Ltda.');
  const [fornecedorCnpj, setFornecedorCnpj] = useState('18.992.334/0001-55');
  const [fornecedorCidade, setFornecedorCidade] = useState('Joinville / SC');
  const [fornecedorEmail, setFornecedorEmail] = useState('contato@metalfix.com.br');

  const [transpNome, setTranspNome] = useState('TransFix Sul Cargas Ltda.');
  const [motoristaNome, setMotoristaNome] = useState('Edson Arantes Pereira');
  const [motoristaCpf, setMotoristaCpf] = useState('***.582.110-**');
  const [placaVeiculo, setPlacaVeiculo] = useState('SCJ8A90');

  const [itens, setItens] = useState<Omit<ItemNF, 'id' | 'quantidadeRecebida'>[]>([
    {
      codigo: 'PAR-SEXT-M12X50',
      descricao: 'Parafuso Sextavado M12 x 50mm Grau 8.8 Zincado',
      ncm: '73181500',
      cfop: '5101',
      unidade: 'CENTO',
      quantidadeFaturada: 25,
      valorUnitario: 145.00,
      valorTotal: 3625.00,
      divergenciaTipo: 'NENHUMA',
    },
    {
      codigo: 'POR-AUTOTRAV-M12',
      descricao: 'Porca Autotravante M12 com Anel de Nylon Zincada',
      ncm: '73181600',
      cfop: '5101',
      unidade: 'CENTO',
      quantidadeFaturada: 30,
      valorUnitario: 68.00,
      valorTotal: 2040.00,
      divergenciaTipo: 'NENHUMA',
    }
  ]);

  if (!isOpen) return null;

  const handleApplyTemplate = (idx: number) => {
    const tmpl = TEMPLATES_NF_ENTRADA[idx];
    if (!tmpl) return;

    setFornecedorNome(tmpl.fornecedor);
    setFornecedorCnpj(tmpl.cnpj);
    setFornecedorCidade(tmpl.cidadeUf);
    setTranspNome(tmpl.transportadora);
    setMotoristaNome(tmpl.motorista);
    setPlacaVeiculo(tmpl.placa);
    setDocaDesignada(tmpl.doca);

    const randNF = Math.floor(48000 + Math.random() * 2000);
    setNumeroNF(`000.0${randNF}`);
    setChaveAcesso('352609' + Math.random().toString().slice(2, 16) + '55001000' + randNF + '100' + randNF + '77');

    setItens(
      tmpl.itens.map((it) => ({
        codigo: it.codigo,
        descricao: it.descricao,
        ncm: it.ncm,
        cfop: it.cfop,
        unidade: it.unidade,
        quantidadeFaturada: it.quantidadeFaturada,
        valorUnitario: it.valorUnitario,
        valorTotal: it.quantidadeFaturada * it.valorUnitario,
        divergenciaTipo: 'NENHUMA',
      }))
    );
  };

  const handleAddItem = () => {
    setItens([
      ...itens,
      {
        codigo: `MAT-${Math.floor(100 + Math.random() * 900)}`,
        descricao: 'Novo Material Industrial',
        ncm: '84818090',
        cfop: '5101',
        unidade: 'UN',
        quantidadeFaturada: 10,
        valorUnitario: 50.00,
        valorTotal: 500.00,
        divergenciaTipo: 'NENHUMA',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (itens.length === 1) return;
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, val: any) => {
    const updated = [...itens];
    const item = { ...updated[index], [field]: val };
    if (field === 'quantidadeFaturada' || field === 'valorUnitario') {
      item.valorTotal = Number(item.quantidadeFaturada) * Number(item.valorUnitario);
    }
    updated[index] = item;
    setItens(updated);
  };

  const valorTotalCalculado = itens.reduce((acc, cur) => acc + (cur.valorTotal || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const novaNF: NotaFiscalProcesso = {
      id: `nf-${Date.now()}`,
      numeroNF,
      serie,
      chaveAcesso,
      dataEmissao: formattedDate,
      dataEntradaFiscal: formattedDate,
      docaDesignada,
      fornecedor: {
        nome: fornecedorNome,
        cnpj: fornecedorCnpj,
        cidadeUf: fornecedorCidade,
        email: fornecedorEmail,
      },
      transportadora: {
        nome: transpNome,
        cnpj: '12.345.678/0001-90',
        motorista: motoristaNome,
        cpfMotorista: motoristaCpf,
        placaVeiculo,
      },
      valorTotalNF: valorTotalCalculado,
      status: 'LIBERADO_DESCARGA',
      itens: itens.map((it, idx) => ({
        ...it,
        id: `it-${Date.now()}-${idx}`,
        quantidadeRecebida: 0,
      })),
      historico: [
        {
          id: `h-${Date.now()}-1`,
          dataHora: formattedDate,
          etapa: '1. Entrada da NF - Recebimento Fiscal',
          acao: 'Entrada da NF registrada com sucesso no sistema fiscal.',
          responsavel: 'Fernanda Rocha Silva',
          setor: 'Recebimento Fiscal',
          detalhes: `Manifesto validado e vinculado à ${docaDesignada}. Processo liberado para descarga. Ficha física substituída pelo registro digital.`,
        },
        {
          id: `h-${Date.now()}-2`,
          dataHora: formattedDate,
          etapa: '2. Liberação para Descarga',
          acao: 'Material liberado e disponibilizado em tempo real na fila do Almoxarifado.',
          responsavel: 'Sistema de Automação',
          setor: 'TI / Integração',
          detalhes: 'Motorista orientado a encostar na doca.',
        }
      ],
    };

    onSalvarEntrada(novaNF);
    onClose();
  };

  return (
    <div id="nova-entrada-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div id="nova-entrada-container" className="w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <FilePlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Etapa 1 • Recebimento Fiscal
                </span>
                <span className="rounded bg-blue-950 text-blue-300 text-[10px] px-2 py-0.5 border border-blue-800">
                  Entrada da NF & Liberação para Descarga
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-100">Registrar Entrada de Nota Fiscal</h3>
            </div>
          </div>
          <button
            id="btn-close-nova-entrada"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800">
          {/* Quick template loader */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-blue-900">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
              <span><strong>Preenchimento Rápido com Carga Modelo:</strong></span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES_NF_ENTRADA.map((tmpl, idx) => (
                <button
                  key={idx}
                  id={`btn-template-${idx}`}
                  type="button"
                  onClick={() => handleApplyTemplate(idx)}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-blue-900 border border-blue-200 hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                >
                  {tmpl.nomeTemplate.split(' ')[2] || 'Exemplo'}
                </button>
              ))}
            </div>
          </div>

          {/* NF Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Número da NF-e *</label>
              <input
                id="input-numero-nf"
                type="text"
                required
                value={numeroNF}
                onChange={(e) => setNumeroNF(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Série *</label>
              <input
                id="input-serie-nf"
                type="text"
                required
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Doca de Destino (Almoxarifado) *</label>
              <select
                id="select-doca-nf"
                value={docaDesignada}
                onChange={(e) => setDocaDesignada(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden bg-white"
              >
                <option value="Doca 01 - Almoxarifado Geral">Doca 01 - Almoxarifado Geral</option>
                <option value="Doca 02 - Matérias-Primas">Doca 02 - Matérias-Primas</option>
                <option value="Doca 03 - Pesados">Doca 03 - Pesados</option>
                <option value="Doca 04 - Suprimentos e EPIs">Doca 04 - Suprimentos e EPIs</option>
              </select>
            </div>
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-slate-700 mb-1">Chave de Acesso da NF-e (44 dígitos) *</label>
              <div className="relative">
                <input
                  id="input-chave-acesso"
                  type="text"
                  required
                  value={chaveAcesso}
                  onChange={(e) => setChaveAcesso(e.target.value)}
                  className="w-full font-mono rounded-md border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden bg-slate-50"
                />
                <Barcode className="h-4 w-4 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>
          </div>

          {/* Fornecedor & Transporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fornecedor */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/70 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Building2 className="h-4 w-4 text-blue-600" />
                Dados do Emitente / Fornecedor
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] text-slate-600">Razão Social</label>
                  <input
                    id="input-fornecedor-nome"
                    type="text"
                    required
                    value={fornecedorNome}
                    onChange={(e) => setFornecedorNome(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600">CNPJ</label>
                    <input
                      id="input-fornecedor-cnpj"
                      type="text"
                      required
                      value={fornecedorCnpj}
                      onChange={(e) => setFornecedorCnpj(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Cidade / UF</label>
                    <input
                      id="input-fornecedor-cidade"
                      type="text"
                      value={fornecedorCidade}
                      onChange={(e) => setFornecedorCidade(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Transporte */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/70 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Truck className="h-4 w-4 text-blue-600" />
                Dados do Transporte & Motorista
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] text-slate-600">Transportadora</label>
                  <input
                    id="input-transp-nome"
                    type="text"
                    required
                    value={transpNome}
                    onChange={(e) => setTranspNome(e.target.value)}
                    className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600">Motorista</label>
                    <input
                      id="input-motorista-nome"
                      type="text"
                      required
                      value={motoristaNome}
                      onChange={(e) => setMotoristaNome(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Placa do Veículo</label>
                    <input
                      id="input-placa-veiculo"
                      type="text"
                      required
                      value={placaVeiculo}
                      onChange={(e) => setPlacaVeiculo(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs bg-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Package className="h-4 w-4 text-blue-600" />
                Itens Faturados na Nota Fiscal ({itens.length})
              </h4>
              <button
                id="btn-add-item-row"
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-2.5 py-2">Código</th>
                    <th className="px-2.5 py-2">Descrição do Material</th>
                    <th className="px-2.5 py-2">Unid.</th>
                    <th className="px-2.5 py-2 text-right">Qtd. Faturada</th>
                    <th className="px-2.5 py-2 text-right">Valor Unit. (R$)</th>
                    <th className="px-2.5 py-2 text-right">Total (R$)</th>
                    <th className="px-2 py-2 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {itens.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-2.5 py-1.5">
                        <input
                          type="text"
                          value={it.codigo}
                          onChange={(e) => handleUpdateItem(idx, 'codigo', e.target.value)}
                          className="w-28 rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                        />
                      </td>
                      <td className="px-2.5 py-1.5">
                        <input
                          type="text"
                          value={it.descricao}
                          onChange={(e) => handleUpdateItem(idx, 'descricao', e.target.value)}
                          className="w-full min-w-44 rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="px-2.5 py-1.5">
                        <input
                          type="text"
                          value={it.unidade}
                          onChange={(e) => handleUpdateItem(idx, 'unidade', e.target.value)}
                          className="w-16 rounded border border-slate-300 px-2 py-1 text-xs uppercase"
                        />
                      </td>
                      <td className="px-2.5 py-1.5 text-right">
                        <input
                          type="number"
                          min="1"
                          value={it.quantidadeFaturada}
                          onChange={(e) => handleUpdateItem(idx, 'quantidadeFaturada', Number(e.target.value))}
                          className="w-20 rounded border border-slate-300 px-2 py-1 text-xs text-right font-bold"
                        />
                      </td>
                      <td className="px-2.5 py-1.5 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={it.valorUnitario}
                          onChange={(e) => handleUpdateItem(idx, 'valorUnitario', Number(e.target.value))}
                          className="w-24 rounded border border-slate-300 px-2 py-1 text-xs text-right"
                        />
                      </td>
                      <td className="px-2.5 py-1.5 text-right font-semibold text-slate-900">
                        {formatCurrency(it.valorTotal || 0)}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <button
                          type="button"
                          disabled={itens.length === 1}
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end p-2 text-xs font-semibold text-slate-800 bg-slate-50 rounded-md">
              <span>Valor Total da NF: <strong className="text-blue-700 text-sm ml-2">{formatCurrency(valorTotalCalculado)}</strong></span>
            </div>
          </div>

          {/* Workflow Automation Notice */}
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Automação em Tempo Real:</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Ao clicar em &quot;Confirmar Entrada&quot;, o status passará automaticamente para <strong>Liberado para Descarga</strong> na doca selecionada. O Almoxarifado receberá o aviso instantaneamente em seu terminal, dispensando qualquer ficha de papel.
              </p>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              id="btn-cancel-nova-entrada"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-nova-entrada"
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirmar Entrada e Liberar para Descarga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
