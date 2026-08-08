import { initials, avatarColor } from '@/lib/constants';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  const cls = `${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`;

  if (src) {
    return <img src={src} alt={name} className={`${cls} object-cover`} />;
  }
  return <div className={`${cls} ${avatarColor(name)}`}>{initials(name)}</div>;
}
