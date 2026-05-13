"use client"

interface BarChartProps {
  data: { date: string; count: number }[]
  color?: string
}

export function BarChart({ data, color = "bg-primary" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex items-end gap-[3px] h-28">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full">
          <div
            className={`w-full rounded-t ${color} transition-all duration-500`}
            style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
            title={`${d.date}: ${d.count}`}
          />
        </div>
      ))}
    </div>
  )
}

export function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
