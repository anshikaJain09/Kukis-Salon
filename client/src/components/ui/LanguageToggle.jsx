import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { springSnappy } from '../../lib/motion.js';

/**
 * LanguageToggle — Modern Pastel pill toggle switching seamlessly between EN and ગુજરાતી
 */
export const LanguageToggle = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-full bg-white/85 border border-purple-100/90 backdrop-blur-md shadow-pastel-sm ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors z-10 min-h-[40px] min-w-[40px] flex items-center justify-center ${
          language === 'en' ? 'text-white font-bold' : 'text-amethyst-700 hover:text-pastel-amethyst'
        }`}
      >
        {language === 'en' && (
          <motion.div
            layoutId="activeLangIndicator"
            className="absolute inset-0 bg-gradient-to-r from-pastel-pink to-pastel-purple rounded-full -z-10 shadow-sm"
            transition={springSnappy}
          />
        )}
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('gu')}
        className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors z-10 min-h-[40px] min-w-[40px] flex items-center justify-center ${
          language === 'gu' ? 'text-white font-bold' : 'text-amethyst-700 hover:text-pastel-amethyst'
        }`}
      >
        {language === 'gu' && (
          <motion.div
            layoutId="activeLangIndicator"
            className="absolute inset-0 bg-gradient-to-r from-pastel-pink to-pastel-purple rounded-full -z-10 shadow-sm"
            transition={springSnappy}
          />
        )}
        ગુજરાતી
      </button>
    </div>
  );
};

export default LanguageToggle;
