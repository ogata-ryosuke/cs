import { cn } from '@/lib/utils';

interface TechBadgeProps {
  tech: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function TechBadge({ tech, selected, onClick, size = 'md' }: TechBadgeProps) {
  const isClickable = !!onClick;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-[12px] py-[8px] text-[12px]';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        'inline-block rounded border transition',
        sizeClass,
        selected
          ? 'bg-[#000] text-white border-[#000]'
          : 'bg-[#FAFAFA] text-[#9CA3AF] border-[#E4E4E7]',
        isClickable && !selected && 'hover:bg-[#000] hover:text-white hover:border-[#000] cursor-pointer',
        !isClickable && 'cursor-default',
      )}
    >
      {tech}
    </button>
  );
}
