import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;

export function Tooltip({
  children,
  content,
  side = 'top',
  delayDuration = 300,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          style={{
            background: '#1e1828',
            border: '1px solid rgba(147,73,204,0.3)',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11,
            color: '#c8bee0',
            maxWidth: 220,
            lineHeight: 1.4,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            zIndex: 9999,
          }}
        >
          {content}
          <TooltipPrimitive.Arrow
            style={{ fill: '#1e1828' }}
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
