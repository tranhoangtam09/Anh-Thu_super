import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { formatVND } from '../utils/formatters';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, suffix = '', className = '' }) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;

    const startVal = prevValueRef.current;
    const targetVal = value;
    const obj = { val: startVal };

    const tween = gsap.to(obj, {
      val: targetVal,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        if (el) {
          el.innerText = `${formatVND(obj.val)}${suffix ? ` ${suffix}` : ''}`;
        }
      },
    });

    prevValueRef.current = targetVal;

    return () => {
      tween.kill();
    };
  }, [value, suffix]);

  return (
    <span ref={numberRef} className={className}>
      {formatVND(value)}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
};
