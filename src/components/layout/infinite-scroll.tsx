'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  className,
  speed = 20000,
}) => {
  const controls = useAnimation();
  const [width, setWidth] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const scrollWidth = containerRef.current.scrollWidth;
      const childWidth = scrollWidth / 2;
      setWidth(childWidth);

      controls.set({ x: 0 });
      controls.start({
        x: -childWidth,
        transition: {
          duration: childWidth / (speed / 1000), // convert speed from px/s to duration
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      });
    }
  }, [controls, children, speed]);

  return (
    <div className={cn("overflow-hidden w-full", className)}>
      <motion.div
        ref={containerRef}
        className="flex"
        animate={controls}
      >
        <div className="flex flex-shrink-0">{children}</div>
        <div className="flex flex-shrink-0">{children}</div>
      </motion.div>
    </div>
  );
};
