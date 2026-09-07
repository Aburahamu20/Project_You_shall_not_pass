type SummaryCardProps = {
  title: string
  value: string
  description: string
  variant?: 'default' | 'success' | 'danger'
}

export function SummaryCard({
  title,
  value,
  description,
  variant = 'default',
}: SummaryCardProps) {
  return (
    <article className="summary-card">
      <span>{title}</span>

      <strong className={variant === 'default' ? undefined : variant}>
        {value}
      </strong>

      <p>{description}</p>
    </article>
  )
}