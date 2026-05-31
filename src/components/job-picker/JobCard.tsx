'use client'

import Link from 'next/link'

type JobCardProps = {
  icon: string
  title: string
  description: string
  status: 'active' | 'soon'
  href?: string
}

export function JobCard({ icon, title, description, status, href }: JobCardProps) {
  const isActive = status === 'active' && href

  const inner = (
    <div
      className={[
        'relative flex flex-col gap-3 rounded-2xl border p-5 transition-colors',
        isActive
          ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer'
          : 'border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50',
      ].join(' ')}
    >
      <span className="text-2xl">{icon}</span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-white/50 leading-relaxed">{description}</p>
      </div>
      {status === 'soon' && (
        <span className="absolute top-3 right-3 text-[10px] font-medium text-white/30 border border-white/10 rounded px-1.5 py-0.5">
          Em breve
        </span>
      )}
    </div>
  )

  if (isActive) {
    return <Link href={href}>{inner}</Link>
  }

  return <div aria-disabled="true">{inner}</div>
}
