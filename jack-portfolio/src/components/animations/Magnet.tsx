import { useRef, useState, useCallback, type ReactNode } from 'react';

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}

export function Magnet({
  children,
  padding: _padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      ref.current.style.transition = activeTransition;
      ref.current.style.transform = `translate3d(${dx / strength}px, ${dy / strength}px, 0)`;
    },
    [strength, activeTransition]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    setIsActive(false);
    ref.current.style.transition = inactiveTransition;
    ref.current.style.transform = 'translate3d(0, 0, 0)';
    window.removeEventListener('mousemove', handleMouseMove);
  }, [inactiveTransition, handleMouseMove]);

  const handleMouseEnter = useCallback(() => {
    setIsActive(true);
    window.addEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: 'transform', display: 'inline-block' }}
      data-active={isActive}
    >
      {children}
    </div>
  );
}
