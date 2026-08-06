import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Newspaper,
  Inbox,
  Mail,
  Check,
  CircleDot,
  Settings,
  LayoutTemplate,
  LifeBuoy,
  FolderDown,
  ShoppingCart,
} from "lucide-react"
import { isAuthenticated, login, logout } from "@/lib/auth"
import { AccountSettings } from "@/components/admin/AccountSettings"
import { SmtpSettings } from "@/components/admin/SmtpSettings"
import { OrdersPanel } from "@/components/admin/OrdersPanel"
import { ContentEditor } from "@/components/admin/ContentEditor"
import { TicketsPanel } from "@/components/admin/TicketsPanel"
import { CustomerCodesPanel } from "@/components/admin/CustomerCodesPanel"
import { ResourcesPanel } from "@/components/admin/ResourcesPanel"
import { adminListPosts, deletePost, postKeys, type Post } from "@/lib/newsletter"
import {
  adminListContacts,
  setContactHandled,
  deleteContact,
  contactKeys,
  type ContactMessage,
} from "@/lib/contact"
import { assetUrl, ApiError } from "@/lib/api-client"
import { Button } from "@/components/ui/Button"
import { PostEditor } from "@/components/newsletter/PostEditor"
import { Spinner, ErrorState } from "@/components/common/States"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

type View = { mode: "list" } | { mode: "create" } | { mode: "edit"; post: Post }
type Tab = "posts" | "orders" | "contacts" | "tickets" | "resources" | "content" | "email" | "account"

export default function Admin() {
  const [authed, setAuthed] = useState(() => isAuthenticated())
  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />
  return <AdminDashboard onLogout={() => setAuthed(false)} />
}

/* ----------------------------- Login gate ----------------------------- */

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [mfaRequired, setMfaRequired] = useState(false)
  const inputCls =
    "w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"

  const mutation = useMutation({
    mutationFn: (vars: { email: string; password: string; code?: string }) =>
      login(vars.email, vars.password, vars.code),
    onSuccess,
    onError: (err) => {
      if (err instanceof ApiError && err.mfaRequired) setMfaRequired(true)
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const code = String(form.get("code") ?? "").trim()
    mutation.mutate({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      code: code || undefined,
    })
  }

  const errorMsg =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.isError
        ? "Sign-in failed."
        : ""

  return (
    <div className="grid min-h-screen place-items-center px-5 pt-16">
      <div className="border-gradient w-full max-w-sm rounded-lg p-8">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-accent/15 text-accent">
          <Lock className="size-6" />
        </div>
        <h1 className="mt-5 text-center text-xl font-semibold">Admin</h1>
        <p className="mt-1.5 text-center text-sm text-muted">
          {mfaRequired ? "Enter your two-factor authentication code." : "Sign in to continue."}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            name="email"
            type="email"
            autoComplete="username"
            autoFocus
            placeholder="Email"
            aria-label="Email"
            className={inputCls}
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Password"
            className={inputCls}
          />
          {mfaRequired && (
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code or recovery code"
              aria-label="Verification code"
              className={inputCls}
            />
          )}
          {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            <ShieldCheck className="size-4" />
            {mutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
}

/* --------------------------- Admin dashboard --------------------------- */

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<View>({ mode: "list" })
  const [tab, setTab] = useState<Tab>("posts")
  const queryClient = useQueryClient()

  function handleSaved() {
    void queryClient.invalidateQueries({ queryKey: postKeys.all })
    setView({ mode: "list" })
  }

  function handleLogout() {
    logout()
    queryClient.clear()
    onLogout()
  }

  // Post create/edit screen
  if (view.mode !== "list") {
    return (
      <div className="mx-auto max-w-4xl px-5 pt-28 pb-24 lg:px-8">
        <button
          onClick={() => setView({ mode: "list" })}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to list
        </button>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">
          {view.mode === "create" ? "Write a new post" : "Edit post"}
        </h1>
        <div className="mt-8">
          <PostEditor
            post={view.mode === "edit" ? view.post : undefined}
            onSaved={handleSaved}
            onCancel={() => setView({ mode: "list" })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pt-28 pb-24 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="size-4" />
            Sign out
          </Button>
          {tab === "posts" && (
            <Button onClick={() => setView({ mode: "create" })}>
              <Plus className="size-4" />
              New post
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-line">
        <TabButton active={tab === "posts"} onClick={() => setTab("posts")} icon={<Newspaper className="size-4" />}>
          Posts
        </TabButton>
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")} icon={<ShoppingCart className="size-4" />}>
          Orders
        </TabButton>
        <TabButton active={tab === "contacts"} onClick={() => setTab("contacts")} icon={<Inbox className="size-4" />}>
          Inquiries
        </TabButton>
        <TabButton active={tab === "tickets"} onClick={() => setTab("tickets")} icon={<LifeBuoy className="size-4" />}>
          Support
        </TabButton>
        <TabButton active={tab === "resources"} onClick={() => setTab("resources")} icon={<FolderDown className="size-4" />}>
          Resources
        </TabButton>
        <TabButton active={tab === "content"} onClick={() => setTab("content")} icon={<LayoutTemplate className="size-4" />}>
          Content
        </TabButton>
        <TabButton active={tab === "email"} onClick={() => setTab("email")} icon={<Mail className="size-4" />}>
          Email
        </TabButton>
        <TabButton active={tab === "account"} onClick={() => setTab("account")} icon={<Settings className="size-4" />}>
          Account
        </TabButton>
      </div>

      {tab === "posts" && <PostsPanel onEdit={(post) => setView({ mode: "edit", post })} />}
      {tab === "orders" && <OrdersPanel />}
      {tab === "contacts" && <ContactsPanel />}
      {tab === "tickets" && (
        <div className="mt-6 flex flex-col gap-5">
          <CustomerCodesPanel />
          <TicketsPanel />
        </div>
      )}
      {tab === "resources" && <ResourcesPanel />}
      {tab === "content" && <ContentEditor />}
      {tab === "email" && <SmtpSettings />}
      {tab === "account" && <AccountSettings />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-cyan text-white"
          : "border-transparent text-muted hover:text-white",
      )}
    >
      {icon}
      {children}
    </button>
  )
}

/* ------------------------------- Posts ------------------------------- */

function PostsPanel({ onEdit }: { onEdit: (post: Post) => void }) {
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: postKeys.adminList(),
    queryFn: adminListPosts,
  })
  const posts = data ?? []

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  })

  function handleDelete(post: Post) {
    if (!window.confirm(`Delete the post "${post.title}"?`)) return
    deleteMutation.mutate(post.id)
  }

  if (isPending) return <Spinner label="Loading…" />
  if (isError)
    return (
      <div className="mt-8">
        <ErrorState message="Could not load the post list." onRetry={() => refetch()} />
      </div>
    )

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-line">
      {posts.map((post, i) => (
        <div
          key={post.id}
          className={`flex items-center gap-4 bg-panel/40 p-4 ${i > 0 ? "border-t border-line" : ""}`}
        >
          <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-elevated">
            {assetUrl(post.coverImage) ? (
              <img src={assetUrl(post.coverImage)} alt="" className="size-full object-cover" />
            ) : (
              <div className="bg-grid size-full opacity-40" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-fg">{post.title}</p>
            <p className="text-xs text-faint">
              {post.category} · {formatDate(post.publishedAt)}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(post)}
              className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-accent"
              aria-label={`Edit ${post.title}`}
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() => handleDelete(post)}
              disabled={deleteMutation.isPending}
              className="grid size-9 place-items-center rounded-lg text-muted hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
              aria-label={`Delete ${post.title}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <p className="bg-panel/40 p-10 text-center text-sm text-muted">
          No posts yet. Click “New post” to get started.
        </p>
      )}
    </div>
  )
}

/* ----------------------------- Contacts ----------------------------- */

function ContactsPanel() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: contactKeys.list(),
    queryFn: adminListContacts,
  })
  const contacts = data ?? []

  const handledMutation = useMutation({
    mutationFn: (vars: { id: string; handled: boolean }) =>
      setContactHandled(vars.id, vars.handled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  })

  function handleDelete(c: ContactMessage) {
    if (!window.confirm(`Delete the inquiry from "${c.name}"?`)) return
    deleteMutation.mutate(c.id)
  }

  if (isPending) return <Spinner label="Loading…" />
  if (isError)
    return (
      <div className="mt-8">
        <ErrorState message="Could not load the inquiry list." onRetry={() => refetch()} />
      </div>
    )

  if (contacts.length === 0)
    return (
      <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-dashed border-line py-20 text-center">
        <Inbox className="size-10 text-faint" />
        <p className="text-muted">No inquiries yet.</p>
      </div>
    )

  const pending = contacts.filter((c) => !c.handled).length

  return (
    <div className="mt-6 flex flex-col gap-3">
      <p className="text-sm text-muted">
        {contacts.length} inquiries · <span className="text-accent">{pending} unhandled</span>
      </p>
      {contacts.map((c) => (
        <div
          key={c.id}
          className={cn(
            "rounded-lg border bg-panel/40 p-5",
            c.handled ? "border-line opacity-70" : "border-accent/40",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-fg">{c.name}</span>
                {c.company && <span className="text-sm text-faint">· {c.company}</span>}
                {!c.handled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent">
                    <CircleDot className="size-3" />
                    New
                  </span>
                )}
              </div>
              <a
                href={`mailto:${encodeURIComponent(c.email)}`}
                className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <Mail className="size-3.5" />
                {c.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-faint">{formatDate(c.createdAt)}</span>
              <button
                onClick={() => handledMutation.mutate({ id: c.id, handled: !c.handled })}
                disabled={handledMutation.isPending}
                className={cn(
                  "grid size-9 place-items-center rounded-lg transition-colors disabled:opacity-50",
                  c.handled
                    ? "text-emerald-400 hover:bg-white/5"
                    : "text-muted hover:bg-white/5 hover:text-emerald-400",
                )}
                aria-label={c.handled ? "Mark as unhandled" : "Mark as handled"}
                title={c.handled ? "Handled" : "Mark as handled"}
              >
                <Check className="size-4" />
              </button>
              <button
                onClick={() => handleDelete(c)}
                disabled={deleteMutation.isPending}
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50"
                aria-label={`Delete inquiry from ${c.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm whitespace-pre-wrap text-muted">{c.message}</p>
        </div>
      ))}
    </div>
  )
}
