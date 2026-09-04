import { cn } from '@/lib/cn';

/**
 * Decorative floating circle. Purely visual — never announced to screen readers.
 *
 * @param {'ring'|'dot-t'|'dot-c'} [props.shape]
 * @param {'slow'|'mid'|'spin'|false} [props.motion]
 * @param {object} [props.style]  position + size, e.g. { top: '8%', right: '6%' }
 */
export default function Deco({ shape = 'ring', motion = 'slow', size = 120, style, className }) {
  const motionClass =
    motion === 'spin' ? 'spin-slow' : motion === 'mid' ? 'float-mid' : motion ? 'float-slow' : null;

  return (
    <div
      aria-hidden="true"
      className={cn('deco', `deco-${shape}`, motionClass, className)}
      style={{ width: size, height: size, ...style }}
    />
  );
}
