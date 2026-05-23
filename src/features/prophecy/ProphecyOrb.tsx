import { orbColor } from './prophecyHelpers';
import type { StepStatus } from './prophecyTypes';

export interface OrbProps {
  status: StepStatus;
  tint: string;
  size?: number;
  icon?: string;
}

export function ProphecyOrb({ status, tint, size = 84, icon }: OrbProps) {
  const { color, deep } = orbColor(status);
  const isEmpty = status === 'empty';
  const isDone = status === 'done';
  // For active/planned, blend the item-specific tint into the radial fill
  const fillTint = !isDone && !isEmpty ? tint : null;

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      {/* Outer glow */}
      {!isEmpty && (
        <div
          style={{
            position: 'absolute',
            inset: -size * 0.3,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}55 0%, transparent 60%)`,
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Rune ring — purely decorative, must not capture pointer events */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 84 84"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <circle
          cx="42"
          cy="42"
          r="38"
          fill="none"
          stroke={color}
          strokeOpacity={isEmpty ? 0.4 : 0.7}
          strokeWidth="0.6"
          strokeDasharray={isEmpty ? '3 3' : '0'}
        />
        <circle
          cx="42"
          cy="42"
          r="30"
          fill="none"
          stroke={color}
          strokeOpacity={isEmpty ? 0.25 : 0.5}
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
        {!isEmpty &&
          [0, 60, 120, 180, 240, 300].map((a) => (
            <circle
              key={a}
              r="1.4"
              fill={color}
              opacity="0.9"
              cx={42 + 38 * Math.cos((a * Math.PI) / 180)}
              cy={42 + 38 * Math.sin((a * Math.PI) / 180)}
            />
          ))}
      </svg>

      {/* Core */}
      <div
        style={{
          position: 'absolute',
          inset: size * 0.22,
          borderRadius: '50%',
          background: isEmpty
            ? 'transparent'
            : `radial-gradient(circle at 30% 30%, ${fillTint ? fillTint + '80' : color}, ${deep})`,
          border: isEmpty ? `1.5px dashed ${color}99` : `1px solid ${color}aa`,
          boxShadow: isEmpty
            ? 'none'
            : `0 0 ${size * 0.4}px ${color}88, inset 0 0 ${size * 0.2}px rgba(255,255,255,0.25)`,
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        {isDone ? (
          <span
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: size * 0.3,
              fontWeight: 700,
              color: '#fff',
              textShadow: `0 0 8px ${color}`,
            }}
          >
            ✓
          </span>
        ) : icon && !isEmpty ? (
          <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span
            style={{
              fontFamily: '"Cinzel", serif',
              fontSize: size * (isEmpty ? 0.5 : 0.36),
              fontWeight: 700,
              color: isEmpty ? `${color}bb` : '#fff',
              textShadow: isEmpty ? 'none' : `0 0 8px ${color}`,
            }}
          >
            {isEmpty ? '+' : '✦'}
          </span>
        )}
      </div>

      {/* Active pulse ring */}
      {status === 'active' && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: `1px solid ${color}88`,
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}
