import { Loader2, AlertTriangle } from "lucide-react"
import { useLang } from "@/i18n"

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <Loader2 className="size-7 animate-spin text-accent" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useLang()
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line py-16 text-center">
      <AlertTriangle className="size-9 text-amber-400" />
      <p className="text-muted">{message ?? t("state.error")}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-line px-4 py-2 text-sm text-fg hover:border-accent/50 hover:text-white"
        >
          {t("cta.retry")}
        </button>
      )}
    </div>
  )
}
