import React, { useRef, useState, useEffect } from 'react';
import { PenTool, CheckCircle, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { AssinaturaEletronica } from '../types';
import { generateHash } from '../utils/formatters';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assinatura: AssinaturaEletronica) => void;
  titulo: string;
  departamentoPadrao: 'Recebimento Fiscal' | 'Almoxarifado';
  responsavelPadrao: string;
  cargoPadrao: string;
  matriculaPadrao: string;
  descricaoAcao: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  departamentoPadrao,
  responsavelPadrao,
  cargoPadrao,
  matriculaPadrao,
  descricaoAcao,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [responsavel, setResponsavel] = useState(responsavelPadrao);
  const [cargo, setCargo] = useState(cargoPadrao);
  const [matricula, setMatricula] = useState(matriculaPadrao);

  useEffect(() => {
    if (isOpen) {
      setResponsavel(responsavelPadrao);
      setCargo(cargoPadrao);
      setMatricula(matriculaPadrao);
      setHasSignature(false);

      // Delay to ensure canvas is mounted
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw a subtle baseline
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(30, canvas.height - 35);
            ctx.lineTo(canvas.width - 30, canvas.height - 35);
            ctx.stroke();
          }
        }
      }, 50);
    }
  }, [isOpen, responsavelPadrao, cargoPadrao, matriculaPadrao]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, canvas.height - 35);
    ctx.lineTo(canvas.width - 30, canvas.height - 35);
    ctx.stroke();
    setHasSignature(false);
  };

  const generateAutomaticSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas();

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const startX = 60;
    const startY = 60;
    ctx.moveTo(startX, startY);

    // Realistic cursive simulation
    ctx.bezierCurveTo(startX + 40, startY - 30, startX + 60, startY + 30, startX + 110, startY - 10);
    ctx.bezierCurveTo(startX + 140, startY - 40, startX + 180, startY + 20, startX + 230, startY);
    ctx.bezierCurveTo(startX + 270, startY + 40, startX + 310, startY - 25, startX + 350, startY + 15);
    ctx.stroke();

    // Underline loop
    ctx.beginPath();
    ctx.moveTo(startX + 20, startY + 35);
    ctx.quadraticCurveTo(startX + 180, startY + 15, startX + 340, startY + 35);
    ctx.stroke();

    setHasSignature(true);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const assinatura: AssinaturaEletronica = {
      responsavel,
      cargo,
      matricula,
      departamento: departamentoPadrao,
      dataHora: formattedDate,
      hashAutenticacao: generateHash(),
      rubricaBase64: signatureData,
      ipOrigem: `192.168.10.${Math.floor(Math.random() * 80 + 10)} (Terminal Corporativo)`,
    };

    onConfirm(assinatura);
    onClose();
  };

  return (
    <div id="signature-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div id="signature-modal-container" className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{titulo}</h3>
              <p className="text-xs text-slate-500">{descricaoAcao}</p>
            </div>
          </div>
          <button
            id="btn-close-signature-modal"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* User details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Responsável</label>
              <input
                id="input-sig-responsavel"
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cargo</label>
              <input
                id="input-sig-cargo"
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Matrícula</label>
              <input
                id="input-sig-matricula"
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Department badge */}
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-900">
            <span className="font-medium">Departamento: <span className="font-semibold">{departamentoPadrao}</span></span>
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="h-4 w-4" /> Certificação Eletrônica Integrada
            </span>
          </div>

          {/* Canvas Signature Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700">
                Desenhe sua rubrica ou assine abaixo:
              </label>
              <div className="flex gap-2">
                <button
                  id="btn-generate-rubrica"
                  type="button"
                  onClick={generateAutomaticSignature}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Gerar Rubrica Digital
                </button>
                <span className="text-slate-300">|</span>
                <button
                  id="btn-clear-canvas"
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Limpar
                </button>
              </div>
            </div>

            <div className="relative rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={520}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full touch-none cursor-crosshair bg-white"
              />
              {!hasSignature && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  Assine com o mouse ou toque na tela
                </div>
              )}
            </div>
          </div>

          {/* Legal statement */}
          <p className="text-[11px] leading-relaxed text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-200">
            Ao assinar eletronicamente, você formaliza e atesta sob responsabilidade funcional as quantidades e condições físicas informadas no processo, gerando registro imutável com data/hora e identificador de segurança.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            id="btn-cancel-signature"
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-signature"
            type="button"
            onClick={handleConfirm}
            disabled={!hasSignature || !responsavel.trim()}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold shadow-xs transition ${
              hasSignature && responsavel.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            Confirmar Assinatura Eletrônica
          </button>
        </div>
      </div>
    </div>
  );
};
