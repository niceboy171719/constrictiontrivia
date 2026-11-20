import React from 'react';
import type { GameTheme } from '../types/game';

interface SnakeLogoProps {
  theme: GameTheme;
  className?: string;
}

export const SnakeLogo: React.FC<SnakeLogoProps> = ({ theme, className = 'w-14 h-16' }) => {
  const snakeMain = theme.snakeHead;
  const snakeShade = theme.snakeBelly;
  const skinLight = '#EDE5D0';
  const skinMid = '#DDD3BC';
  const skinShade = '#C2B69D';
  const outline = '#2B1616';

  return (
    <svg
      viewBox="0 0 28 32"
      className={className}
      shapeRendering="crispEdges"
      aria-label="Hand constricting a pixel snake"
      role="img"
    >
      {/* Snake head peeking out top of fist */}
      <rect x="10" y="1" width="6" height="1" fill={outline} />
      <rect x="9" y="2" width="8" height="4" fill={snakeMain} />
      <rect x="8" y="3" width="1" height="2" fill={outline} />
      <rect x="17" y="3" width="1" height="2" fill={outline} />
      {/* Snake eyes */}
      <rect x="10" y="3" width="1" height="1" fill="#111116" />
      <rect x="15" y="3" width="1" height="1" fill="#111116" />
      {/* Subtle brow / snout highlight */}
      <rect x="12" y="2" width="2" height="1" fill="#FF8FA3" opacity="0.55" />
      {/* Forked tongue */}
      <rect x="11" y="0" width="1" height="1" fill="#FF5C77" />
      <rect x="14" y="0" width="1" height="1" fill="#FF5C77" />
      {/* Snake neck squeezed into top of fist */}
      <rect x="10" y="6" width="6" height="3" fill={snakeMain} />
      <rect x="9" y="6" width="1" height="3" fill={outline} />
      <rect x="16" y="6" width="1" height="3" fill={outline} />
      <rect x="11" y="7" width="4" height="2" fill={snakeShade} />

      {/* Clenched Fist Outer Border */}
      <rect x="4" y="9" width="13" height="1" fill={outline} />
      <rect x="17" y="10" width="7" height="1" fill={outline} />
      <rect x="3" y="10" width="1" height="14" fill={outline} />
      <rect x="24" y="11" width="1" height="13" fill={outline} />
      <rect x="4" y="24" width="19" height="1" fill={outline} />
      <rect x="16" y="25" width="7" height="1" fill={outline} />

      {/* Finger 1 (Index) */}
      <rect x="4" y="10" width="12" height="2" fill={skinLight} />
      <rect x="4" y="12" width="12" height="1" fill={skinMid} />
      <rect x="4" y="13" width="12" height="1" fill={outline} />

      {/* Finger 2 (Middle) */}
      <rect x="4" y="14" width="12" height="2" fill={skinLight} />
      <rect x="4" y="16" width="12" height="1" fill={skinMid} />
      <rect x="4" y="17" width="12" height="1" fill={outline} />

      {/* Finger 3 (Ring) */}
      <rect x="4" y="18" width="12" height="2" fill={skinLight} />
      <rect x="4" y="20" width="12" height="1" fill={skinMid} />
      <rect x="4" y="21" width="12" height="1" fill={outline} />

      {/* Finger 4 (Pinky) */}
      <rect x="4" y="22" width="12" height="1" fill={skinLight} />
      <rect x="4" y="23" width="12" height="1" fill={skinMid} />

      {/* Vertical Thumb / Palm Grip on Right Side */}
      <rect x="16" y="10" width="1" height="14" fill={outline} />
      <rect x="17" y="11" width="6" height="13" fill={skinLight} />
      <rect x="23" y="11" width="1" height="13" fill={skinShade} />
      {/* Thumb knuckle / palm crease */}
      <rect x="17" y="11" width="5" height="1" fill={skinMid} />
      <rect x="17" y="17" width="2" height="1" fill={skinShade} />
      <rect x="17" y="23" width="6" height="2" fill={skinMid} />

      {/* Snake tail emerging from bottom of fist */}
      <rect x="9" y="25" width="1" height="2" fill={outline} />
      <rect x="14" y="25" width="1" height="2" fill={outline} />
      <rect x="10" y="25" width="4" height="2" fill={snakeMain} />
      <rect x="10" y="25" width="4" height="1" fill={snakeShade} />
      <rect x="8" y="27" width="4" height="2" fill={snakeMain} />
      <rect x="7" y="27" width="1" height="2" fill={outline} />
      <rect x="12" y="27" width="1" height="2" fill={outline} />
      <rect x="6" y="29" width="3" height="1" fill={snakeMain} />
      <rect x="5" y="30" width="2" height="1" fill={snakeShade} />
    </svg>
  );
};
