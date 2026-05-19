import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ChevronRight, X, MousePointer2 } from 'lucide-react';

const TOUR_STEPS = [
  {
    target: '#nav-dashboard',
    route: '/dashboard',
    title: 'Ringkasan di Dashboard',
    description: 'Selamat datang di IntelliCash! Di sini kamu bisa melihat ringkasan keuanganmu, saldo total, dan progres tabungan secara sekilas.',
    placement: 'right' as const,
  },
  {
    target: '#nav-transactions',
    route: '/transactions',
    title: 'Pantau Transaksi',
    description: 'Pindah ke tab Transaksi untuk melihat semua histori pemasukan dan pengeluaran.',
    placement: 'right' as const,
  },
  {
    target: '#add-transaction-btn',
    route: '/transactions',
    title: 'Catat Transaksi Mudah',
    description: 'Klik tombol ini untuk mulai mencatat pemasukan atau pengeluaran barumu. Jangan sampai ada yang terlewat!',
    placement: 'bottom' as const,
  },
  {
    target: '#nav-analytics',
    route: '/analytics',
    title: 'Analitik Mendalam',
    description: 'Mari kita lihat seberapa sehat keuanganmu dari berbagai grafik.',
    placement: 'right' as const,
  },
  {
    target: '#analytics-ai-insights',
    route: '/analytics',
    title: 'Insight Pintar (AI)',
    description: 'Keren kan? IntelliCash akan memberikan saran serta analisis cerdas yang personal untuk membantu keuanganmu.',
    placement: 'top' as const,
  },
  {
    target: '#nav-ai-assistant',
    route: '/ai-chat',
    title: 'Asisten AI',
    description: 'Terakhir, kamu bisa mengobrol dengan asisten pintar kami kapan saja.',
    placement: 'right' as const,
  },
  {
    target: '#ai-chat-input',
    route: '/ai-chat',
    title: 'Tanya Apapun ke AI',
    description: 'Punya pertanyaan seperti "Bagaimana cara nabung untuk beli motor?" Ketik di sini dan AI akan membantumu!',
    placement: 'top' as const,
  }
];

interface TooltipPosition {
  top: number;
  left: number;
  arrowX: number;
  arrowY: number;
}

export default function OnboardingTutorial() {
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('intellicash_tour_seen_v2');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setIsActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const currentStep = TOUR_STEPS[step];

  const updateTargetPosition = useCallback(() => {
    if (!isActive || !currentStep) return;
    const isMobile = window.innerWidth < 768; // Adjust threshold
    
    // On mobile, use mobile nav IDs if they exist and are targeted
    let targetSelector = currentStep.target;
    if (isMobile && targetSelector.startsWith('#nav-')) {
      targetSelector = targetSelector + '-mobile';
    }

    const el = document.querySelector(targetSelector) || document.querySelector(currentStep.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (isActive && currentStep) {
      if (location.pathname !== currentStep.route) {
        navigate(currentStep.route);
        // Wait for page to render before getting rect
        setTimeout(updateTargetPosition, 500);
      } else {
        updateTargetPosition();
      }
    }
  }, [isActive, step, currentStep, location.pathname, navigate, updateTargetPosition]);

  useEffect(() => {
    if (isActive) {
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition, true);
      return () => {
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition, true);
      };
    }
  }, [isActive, updateTargetPosition]);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('intellicash_tour_seen_v2', 'true');
    setIsActive(false);
  };

  if (!isActive) return null;

  const tooltipWidth = 320;
  const tooltipHeight = 200; // approximate
  const padding = 20;

  let tooltipStyle: React.CSSProperties = { opacity: 0 };
  let svgStyle: React.CSSProperties = { display: 'none' };
  let pathD = '';
  
  if (targetRect) {
    const isMobile = window.innerWidth < 768;
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;

    let tTop = 0;
    let tLeft = 0;
    
    // Default placement logic
    if (currentStep.placement === 'right' && !isMobile) {
      tLeft = targetRect.right + padding + 40; // extra space for arrow
      tTop = centerY - tooltipHeight / 2;
    } else if (currentStep.placement === 'left' && !isMobile) {
      tLeft = targetRect.left - tooltipWidth - padding - 40;
      tTop = centerY - tooltipHeight / 2;
    } else if (currentStep.placement === 'top' || isMobile) {
      tTop = targetRect.top - tooltipHeight - padding - 40;
      tLeft = Math.max(16, Math.min(centerX - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
      if (tTop < 16) { 
        // fallback to bottom if top is out of bounds
        tTop = targetRect.bottom + padding + 40;
      }
    } else if (currentStep.placement === 'bottom') {
      tTop = targetRect.bottom + padding + 40;
      tLeft = Math.max(16, Math.min(centerX - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16));
    }
    
    // Bounds checking
    tTop = Math.max(16, Math.min(tTop, window.innerHeight - tooltipHeight - 16));
    tLeft = Math.max(16, Math.min(tLeft, window.innerWidth - tooltipWidth - 16));

    tooltipStyle = {
      position: 'fixed',
      top: tTop,
      left: tLeft,
      width: tooltipWidth,
      opacity: 1,
      zIndex: 100000,
    };

    // Calculate arrow path from tooltip center to target edge
    const ttCenterX = tLeft + tooltipWidth / 2;
    const ttCenterY = tTop + tooltipHeight / 2;
    
    pathD = `M ${ttCenterX} ${ttCenterY} Q ${ttCenterX} ${centerY} ${currentStep.placement === 'right' && !isMobile ? targetRect.right + 10 : centerX} ${currentStep.placement === 'top' ? targetRect.top - 10 : currentStep.placement === 'bottom' ? targetRect.bottom + 10 : centerY}`;

    svgStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 99999,
      display: 'block'
    };
  }

  return (
    <>
      <div className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto" onClick={handleNext}></div>
      
      {targetRect && (
        <>
          <div 
            className="fixed z-[99999] rounded-xl border-2 border-brand-400 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
            }}
          />
          <svg style={svgStyle}>
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>
            <motion.path 
              d={pathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeDasharray="6,6"
              markerEnd="url(#arrowhead)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              key={`arrow-${step}`}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </svg>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={`step-${step}`}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          className="bg-[#1a1a1a] border border-brand-500/30 rounded-2xl p-6 shadow-2xl shadow-brand-500/20"
          style={tooltipStyle}
        >
          <button onClick={handleComplete} className="absolute top-4 right-4 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
               <MousePointer2 className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-white text-lg tracking-tight leading-tight">{currentStep?.title}</h3>
          </div>
          
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {currentStep?.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-brand-400' : 'w-1.5 bg-white/20'}`} />
              ))}
            </div>
            <button 
              onClick={handleNext}
              className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              {step === TOUR_STEPS.length - 1 ? (
                <>Selesai <Check className="w-4 h-4" /></>
              ) : (
                <>Lanjut <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
