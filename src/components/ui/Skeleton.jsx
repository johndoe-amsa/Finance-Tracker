export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-bg-tertiary dark:bg-[#27272a] rounded-md ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent 0%, var(--skeleton-shimmer) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        backgroundRepeat: 'no-repeat',
        animation: 'shimmer 1.6s ease-in-out infinite',
      }}
      aria-hidden="true"
    />
  )
}
