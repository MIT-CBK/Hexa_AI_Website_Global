import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  KeyRound,
  ShieldCheck,
  ShieldOff,
  Users,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Copy,
} from "lucide-react"
import {
  changePassword,
  getMfaStatus,
  mfaSetup,
  mfaEnable,
  mfaDisable,
  listUsers,
  createUser,
  deleteUser,
  accountKeys,
  type AdminAccount,
} from "@/lib/account"
import { ApiError } from "@/lib/api-client"
import { Button } from "@/components/ui/Button"
import { Spinner, ErrorState } from "@/components/common/States"
import { formatDate } from "@/lib/utils"

const inputCls =
  "w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"

function errMsg(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback
}

export function AccountSettings() {
  return (
    <div className="mt-6 flex flex-col gap-5">
      <ChangePasswordCard />
      <MfaCard />
      <UsersCard />
    </div>
  )
}

/* --------------------------- Change password --------------------------- */

function ChangePasswordCard() {
  const [done, setDone] = useState(false)
  const mutation = useMutation({
    mutationFn: (v: { current: string; next: string }) => changePassword(v.current, v.next),
    onSuccess: () => setDone(true),
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setDone(false)
    const f = new FormData(e.currentTarget)
    const next = String(f.get("next") ?? "")
    if (next !== String(f.get("confirm") ?? "")) {
      mutation.reset()
      return alert("Password confirmation does not match")
    }
    mutation.mutate({ current: String(f.get("current") ?? ""), next })
  }

  return (
    <Card icon={<KeyRound className="size-5" />} title="Change password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" key={done ? "done" : "form"}>
        <input name="current" type="password" autoComplete="current-password" placeholder="Current password" className={inputCls} />
        <input name="next" type="password" autoComplete="new-password" placeholder="New password (≥ 8 characters)" className={inputCls} />
        <input name="confirm" type="password" autoComplete="new-password" placeholder="Re-enter new password" className={inputCls} />
        {mutation.isError && <p className="text-xs text-rose-400">{errMsg(mutation.error, "Failed to change password.")}</p>}
        {done && <p className="text-xs text-emerald-400">Password changed successfully.</p>}
        <div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Update password"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

/* ------------------------------- MFA ------------------------------- */

function MfaCard() {
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery({ queryKey: accountKeys.mfa(), queryFn: getMfaStatus })

  const [setup, setSetup] = useState<{ qrDataUrl: string; secret: string } | null>(null)
  const [recovery, setRecovery] = useState<string[] | null>(null)

  const setupMut = useMutation({ mutationFn: mfaSetup, onSuccess: setSetup })
  const enableMut = useMutation({
    mutationFn: mfaEnable,
    onSuccess: (res) => {
      setRecovery(res.recoveryCodes)
      setSetup(null)
      queryClient.invalidateQueries({ queryKey: accountKeys.mfa() })
    },
  })
  const disableMut = useMutation({
    mutationFn: mfaDisable,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.mfa() }),
  })

  if (isPending)
    return (
      <Card icon={<ShieldCheck className="size-5" />} title="Two-factor authentication (MFA)">
        <Spinner />
      </Card>
    )

  const enabled = data?.enabled

  return (
    <Card icon={<ShieldCheck className="size-5" />} title="Two-factor authentication (MFA)">
      {/* One-time recovery codes after enabling */}
      {recovery && (
        <div className="mb-4 rounded-xl border border-amber-400/40 bg-amber-400/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-300">
            <AlertTriangle className="size-4" />
            Save your recovery codes — shown only once!
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-fg">
            {recovery.map((c) => (
              <span key={c} className="rounded bg-ink/60 px-3 py-1.5">{c}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(recovery.join("\n"))}>
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button size="sm" onClick={() => setRecovery(null)}>I've saved them</Button>
          </div>
        </div>
      )}

      {enabled ? (
        <div className="flex flex-col gap-3">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-400">
            <ShieldCheck className="size-4" />
            Enabled
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              disableMut.mutate(String(new FormData(e.currentTarget).get("pw") ?? ""))
            }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm text-muted">Enter your password to disable MFA.</p>
            <input name="pw" type="password" autoComplete="current-password" placeholder="Password" className={inputCls} />
            {disableMut.isError && <p className="text-xs text-rose-400">{errMsg(disableMut.error, "Failed to disable MFA.")}</p>}
            <div>
              <Button type="submit" variant="outline" disabled={disableMut.isPending}>
                <ShieldOff className="size-4" />
                {disableMut.isPending ? "Disabling…" : "Disable MFA"}
              </Button>
            </div>
          </form>
        </div>
      ) : setup ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            enableMut.mutate(String(new FormData(e.currentTarget).get("code") ?? ""))
          }}
          className="flex flex-col gap-3"
        >
          <p className="text-sm text-muted">
            Scan the QR code with Google Authenticator / Authy, then enter the 6-digit code to confirm.
          </p>
          <img src={setup.qrDataUrl} alt="QR MFA" className="size-44 rounded-xl border border-line bg-white p-2" />
          <p className="text-xs text-faint">
            Or enter the key manually: <span className="font-mono text-muted">{setup.secret}</span>
          </p>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" className={inputCls} />
          {enableMut.isError && <p className="text-xs text-rose-400">{errMsg(enableMut.error, "Invalid code.")}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={enableMut.isPending}>
              {enableMut.isPending ? "Enabling…" : "Confirm & enable"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSetup(null)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Add an extra layer of protection: require a code from your authenticator app each time you sign in.
          </p>
          {setupMut.isError && <p className="text-xs text-rose-400">{errMsg(setupMut.error, "Could not initialize MFA.")}</p>}
          <div>
            <Button onClick={() => setupMut.mutate()} disabled={setupMut.isPending}>
              <ShieldCheck className="size-4" />
              {setupMut.isPending ? "Creating…" : "Enable MFA"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

/* ------------------------------ Users ------------------------------ */

function UsersCard() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: accountKeys.users(),
    queryFn: listUsers,
  })
  const [adding, setAdding] = useState(false)

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      setAdding(false)
      queryClient.invalidateQueries({ queryKey: accountKeys.users() })
    },
  })
  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.users() }),
    onError: (e) => alert(errMsg(e, "Delete failed.")),
  })

  function handleDelete(u: AdminAccount) {
    if (!window.confirm(`Delete the account ${u.email}?`)) return
    deleteMut.mutate(u.id)
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    createMut.mutate({
      email: String(f.get("email") ?? ""),
      name: String(f.get("name") ?? ""),
      password: String(f.get("password") ?? ""),
    })
  }

  return (
    <Card
      icon={<Users className="size-5" />}
      title="Admin accounts"
      action={
        !adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" />
            Add
          </Button>
        )
      }
    >
      {adding && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-ink/40 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" placeholder="Name" className={inputCls} />
            <input name="email" type="email" placeholder="Email" className={inputCls} />
          </div>
          <input name="password" type="password" autoComplete="new-password" placeholder="Password (≥ 8 characters)" className={inputCls} />
          {createMut.isError && <p className="text-xs text-rose-400">{errMsg(createMut.error, "Failed to create account.")}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={createMut.isPending}>
              {createMut.isPending ? "Creating…" : "Create account"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isPending ? (
        <Spinner />
      ) : isError ? (
        <ErrorState message="Could not load the list." onRetry={() => refetch()} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          {(data ?? []).map((u, i) => (
            <div key={u.id} className={`flex items-center gap-3 bg-panel/40 p-3.5 ${i > 0 ? "border-t border-line" : ""}`}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {u.name}
                  {u.mfaEnabled && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-400">
                      <Check className="size-3" />
                      MFA
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-faint">
                  {u.email} · {formatDate(u.createdAt)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(u)}
                disabled={deleteMut.isPending}
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                aria-label={`Delete ${u.email}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ------------------------------ Card shell ------------------------------ */

function Card({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-line bg-panel/40 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-accent/15 text-accent">{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
