// src/components/Toast.jsx
import { CheckCircle2, XCircle, X } from "lucide-react";

export default function Toast({ type = "success", message, onClose }) {
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: <CheckCircle2 size={16} className="text-green-600 shrink-0" />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <XCircle size={16} className="text-red-600 shrink-0" />,
    },
  };
  const s = styles[type];
  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${s.bg} ${s.border} ${s.text} max-w-sm`}
    >
      {s.icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 ml-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
