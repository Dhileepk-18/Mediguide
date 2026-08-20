import React from 'react';
import { useAppStore } from '../../store/appStore.js';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
export const ToastContainer = () => {
    const { toasts, removeToast } = useAppStore();
    if (toasts.length === 0)
        return null;
    return (<div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
            let Icon = CheckCircle2;
            let borderBg = 'bg-white border-health-200 text-ink-main';
            let iconColor = 'text-status-success';
            if (toast.type === 'error') {
                Icon = AlertCircle;
                borderBg = 'bg-white border-red-200 text-ink-main';
                iconColor = 'text-red-500';
            }
            else if (toast.type === 'warning') {
                Icon = AlertTriangle;
                borderBg = 'bg-white border-amber-200 text-ink-main';
                iconColor = 'text-amber-500';
            }
            else if (toast.type === 'info') {
                Icon = Info;
                borderBg = 'bg-white border-blue-200 text-ink-main';
                iconColor = 'text-blue-500';
            }
            return (<div key={toast.id} className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-soft-lg border ${borderBg} transition-all duration-300 animate-slide-in`}>
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`}/>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-ink-main">{toast.title}</div>
              {toast.message && <p className="text-xs text-ink-muted mt-0.5">{toast.message}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-ink-muted hover:text-ink-main p-1 rounded-lg transition-colors">
              <X className="w-4 h-4"/>
            </button>
          </div>);
        })}
    </div>);
};
