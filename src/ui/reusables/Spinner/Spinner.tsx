interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color = '#2563eb' }: SpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 32,
    lg: 38,
  };

  const spinnerSize = sizeMap[size];
  const borderWidth = size === 'lg' ? 4 : 2;

  return (
    <div
      style={{
        width: `${spinnerSize}px`,
        height: `${spinnerSize}px`,
        border: `${borderWidth}px solid ${color}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 1s linear infinite',
      }}
      role="status"
      aria-label="Loading"
    >
      <span
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        }}
      >
        Loading...
      </span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
