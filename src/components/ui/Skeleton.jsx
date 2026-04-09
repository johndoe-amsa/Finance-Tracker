export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-bg-tertiary dark:bg-[#111111] rounded-md ${className}`}
      style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }}
      aria-hidden="true"
    />
  )
}
