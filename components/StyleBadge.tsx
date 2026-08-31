
import React from 'react';
import { Play, Loader2, StopCircle } from 'lucide-react';
import { STYLE_SHORTCODES, VoiceStyle } from '../types';

interface StyleBadgeProps {
  label: string;
  styleKey: VoiceStyle;
  isActive: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  onSelect: () => void;
  onPreview: (e: React.MouseEvent) => void;
}

const StyleBadge: React.FC<StyleBadgeProps> = ({ 
  label, 
  styleKey,
  isActive, 
  isPlaying, 
  isLoading,
  onSelect,
  onPreview
}) => {
  return (
    <div
      onClick={onSelect}
      className={`
        relative group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer select-none
        ${isActive 
          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500' 
          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
        }
      `}
    >
      {/* Shortcode display (visible on hover or active) */}
      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1 rounded border border-slate-200">
        {STYLE_SHORTCODES[styleKey]}
      </span>

      <span className="flex-grow">{label}</span>

      {/* Play Button - Separate Click Handler */}
      <button
        onClick={onPreview}
        disabled={isLoading}
        className={`
          flex-shrink-0 p-1.5 rounded-full hover:bg-indigo-200 transition-colors
          ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
          ${isPlaying ? 'text-red-500 bg-red-100 hover:bg-red-200' : 'text-indigo-500 bg-indigo-100'}
        `}
        title="শুনুন (Preview)"
      >
        {isLoading ? (
          <Loader2 className="animate-spin w-3.5 h-3.5" />
        ) : isPlaying ? (
           <StopCircle className="w-3.5 h-3.5" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current" />
        )}
      </button>
    </div>
  );
};

export default StyleBadge;
