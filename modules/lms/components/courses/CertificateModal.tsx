'use client';

import React from 'react';
import { Award, Download, X, Share2, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    userName: string;
    courseTitle: string;
    issuedAt: string;
    certificateId: string;
  };
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10">
        
        {/* Left Side: Preview */}
        <div className="flex-1 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-12 relative overflow-hidden flex items-center justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative w-full aspect-[1.414/1] bg-white dark:bg-slate-950 border-8 border-double border-slate-200 dark:border-slate-800 p-8 shadow-inner flex flex-col items-center justify-between text-center overflow-hidden group">
            <div className="absolute top-4 left-4 flex items-center gap-1 opacity-20">
               <ShieldCheck size={16} /> <span className="text-[10px] font-bold uppercase tracking-widest">Verified LMS</span>
            </div>
            
            <div className="mt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 mx-auto border-2 border-primary/20 shadow-lg">
                <Award size={32} />
              </div>
              <h2 className="text-3xl font-serif font-black tracking-tight mb-2">CERTIFICATE</h2>
              <p className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground uppercase">of Completion</p>
            </div>

            <div className="my-6">
              <p className="text-sm text-muted-foreground mb-1 italic">This is to certify that</p>
              <h3 className="text-2xl font-black text-primary border-b-2 border-primary/20 pb-2 mb-4 px-8 min-w-[200px]">
                {data.userName || 'Student Name'}
              </h3>
              <p className="text-sm text-muted-foreground italic mb-2">has successfully completed the course</p>
              <h4 className="text-xl font-bold max-w-md">{data.courseTitle}</h4>
            </div>

            <div className="flex justify-between w-full mt-4 pb-4">
               <div className="text-left">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-50">Issue Date</p>
                  <p className="text-xs font-bold">{new Date(data.issuedAt).toLocaleDateString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-50">Certificate ID</p>
                  <p className="text-xs font-bold text-primary">{data.certificateId}</p>
               </div>
            </div>
            
            {/* Hologram-like effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/50 p-8 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 md:static md:mb-8 self-end w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
           >
             <X size={20} />
           </button>

           <div className="flex-1">
              <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl mb-4">
                <Award size={24} />
              </div>
              <h3 className="text-2xl font-black mb-2">Congratulations!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                You have mastered all concepts in this course. This certificate is a testament to your commitment and hard work.
              </p>

              <div className="space-y-3">
                 <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-primary text-white font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">
                    <Download size={18} /> Download PDF
                 </button>
                 <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    <Share2 size={18} /> Share Achievement
                 </button>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                 <ShieldCheck size={16} className="text-primary" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                 Verified & Authenticated by <br/> LMS Platform
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
