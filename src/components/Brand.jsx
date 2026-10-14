import React from 'react';
import logoHorizontal from '../assets/raify-logo-horizontal.png';
import logoStacked from '../assets/raify-logo-stacked.png';
import logoHorizontalRoxo from '../assets/raify-logo-horizontal-roxo.png';
import logoStackedRoxo from '../assets/raify-logo-stacked-roxo.png';
import logoHorizontalAzul from '../assets/raify-logo-horizontal-azul.png';
import logoStackedAzul from '../assets/raify-logo-stacked-azul.png';

// Logo na cor de cada área: verde (agricultor/padrão), roxa (agrônomo), azul (admin).
const LOGOS = {
  default: { horizontal: logoHorizontal, stacked: logoStacked },
  agro: { horizontal: logoHorizontalRoxo, stacked: logoStackedRoxo },
  admin: { horizontal: logoHorizontalAzul, stacked: logoStackedAzul }
};

export default function Brand({ variant = 'horizontal', className = '', compact = false, theme = 'default' }) {
  const src = (LOGOS[theme] || LOGOS.default)[variant === 'stacked' ? 'stacked' : 'horizontal'];
  return (
    <img
      src={src}
      alt="RAIFY"
      className={`raify-logo ${compact ? 'raify-logo-compact' : ''} ${className}`}
    />
  );
}
