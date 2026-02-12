import type { SVGProps } from 'react';

type IconWeight = 'light' | 'duotone';

interface IconProps extends SVGProps<SVGSVGElement> {
  weight?: IconWeight;
}

function SmileyBase({ mood = 'happy', weight = 'light', ...props }: IconProps & { mood?: 'happy' | 'sad' | 'meh' }) {
  const strokeWidth = weight === 'light' ? 12 : 16;
  return (
    <svg viewBox="0 0 256 256" fill="none" aria-hidden="true" {...props}>
      {weight === 'duotone' ? <circle cx="128" cy="128" r="96" fill="currentColor" opacity="0.2" /> : null}
      <circle cx="128" cy="128" r="96" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="92" cy="108" r="10" fill="currentColor" />
      <circle cx="164" cy="108" r="10" fill="currentColor" />
      {mood === 'sad' ? (
        <path d="M88 172c10-22 30-34 40-34s30 12 40 34" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      ) : mood === 'meh' ? (
        <path d="M90 164h76" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      ) : (
        <path d="M88 148c10 22 30 34 40 34s30-12 40-34" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      )}
    </svg>
  );
}

export function SmileyIcon(props: IconProps) {
  return <SmileyBase {...props} />;
}

export function SmileySadIcon(props: IconProps) {
  return <SmileyBase mood="sad" {...props} />;
}

export function SmileyMehIcon(props: IconProps) {
  return <SmileyBase mood="meh" {...props} />;
}
