import React from 'react';
import { motion } from 'framer-motion';
import { springSnappy } from '../../lib/motion.js';

/**
 * TactileCard — Modern Pastel surface card with subtle spring hover/tap physics
 */
export const TactileCard = ({
  children,
  className = '',
  onClick,
  glow = false,
  interactive = false,
  variant = 'glass', // 'glass' | 'surface' | 'flat'
}) => {
  const baseClasses = 'relative rounded-3xl p-6 transition-all duration-200 overflow-hidden';

  const variantClasses = {
    glass: 'bg-white/85 backdrop-blur-xl border border-purple-100/90 shadow-pastel-md',
    surface: 'bg-white/95 border border-purple-100 shadow-pastel-sm',
    flat: 'bg-pastel-lavender/50 border border-purple-100/60',
  };

  const glowClasses = glow
    ? 'ring-1 ring-pastel-purple/30 shadow-purple-glow'
    : '';

  const Component = interactive || onClick ? motion.div : 'div';

  const motionProps = interactive || onClick
    ? {
        whileHover: { y: -3, scale: 1.008, transition: springSnappy },
        whileTap: { scale: 0.985, transition: springSnappy },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${glowClasses} ${
        interactive || onClick ? 'cursor-pointer hover:border-pastel-pink/50 hover:shadow-pastel-lg' : ''
      } ${className}`}
      {...motionProps}
    >
      {glow && (
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-pastel-pink/15 to-pastel-purple/15 rounded-full blur-2xl pointer-events-none" />
      )}
      {children}
    </Component>
  );
};

export default TactileCard;
