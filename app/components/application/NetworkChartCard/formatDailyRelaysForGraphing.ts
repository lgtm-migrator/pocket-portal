// import { format } from "d3-format"
import { DailyRelayBucket } from "~/models/portal.server"
import { RelayMetric } from "~/models/relaymeter.server"
import { dayjs } from "~/utils/dayjs"
import { norm } from "~/utils/mathUtils"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function formatDailyRelaysForGraphing(relays: RelayMetric[] = []): {
  labels: string[]
  lines: { id: number; values: number[] }[]
  scales: { label: number }[]
} {
  const sortRelaysByDate = relays.sort(
    (a, b) => dayjs(a.From).utc().valueOf() - dayjs(b.From).utc().valueOf(),
  )
  const labels = sortRelaysByDate.map(
    ({ From }) => DAYS[new Date(From.split("T")[0]).getUTCDay()],
  )

  const { high, low } = sortRelaysByDate.reduce(
    ({ high: highest, low: lowest }, { Count }) => ({
      high: Math.max(highest, Count.Success + Count.Failure),
      low:
        lowest === 0
          ? Count.Success + Count.Failure
          : Math.min(lowest, Count.Success + Count.Failure),
    }),
    { high: 0, low: 0 },
  )

  const diff = high - low
  const quarter = diff * 0.25
  const half = diff * 0.5
  const threeQuarter = diff * 0.75

  const lines = [
    {
      id: 1,
      values: sortRelaysByDate.map(({ Count }) =>
        norm(Count.Success + Count.Failure, low, high),
      ),
    },
  ]

  const scales = [
    { label: Number(low.toFixed(0)) },
    { label: Number((low + quarter).toFixed(0)) },
    { label: Number((low + half).toFixed(0)) },
    { label: Number((low + threeQuarter).toFixed(0)) },
    { label: Number(high.toFixed(0)) },
  ]

  return {
    labels,
    lines,
    scales,
  }
}
