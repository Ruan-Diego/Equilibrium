import { useState } from 'react'
import { toast } from 'sonner'
import {
  archiveArea,
  createArea,
  renameArea,
  reorderAreas,
} from '@/data/areasRepo'
import { useAuth } from '@/hooks/useAuth'
import { useAreas } from '@/hooks/useAreas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { emptyLabel } from '@/domain/labels'

type DialogMode =
  | { type: 'create' }
  | { type: 'rename'; areaId: string; name: string }
  | null

export function AreasManagePage() {
  const { user } = useAuth()
  const { areas, loading, error, refresh } = useAreas()
  const [dialog, setDialog] = useState<DialogMode>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [busy, setBusy] = useState(false)

  function openCreate() {
    setNameDraft('')
    setDialog({ type: 'create' })
  }

  function openRename(areaId: string, name: string) {
    setNameDraft(name)
    setDialog({ type: 'rename', areaId, name })
  }

  function closeDialog() {
    if (busy) return
    setDialog(null)
    setNameDraft('')
  }

  async function submitDialog() {
    if (!user) return
    const trimmed = nameDraft.trim()
    if (!trimmed) {
      toast.error('Informe um nome para a área.')
      return
    }

    setBusy(true)
    try {
      if (dialog?.type === 'create') {
        await createArea(user.uid, trimmed)
      } else if (dialog?.type === 'rename') {
        await renameArea(user.uid, dialog.areaId, trimmed)
      }
      setDialog(null)
      setNameDraft('')
      await refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível salvar.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function move(areaId: string, direction: -1 | 1) {
    if (!user) return
    const index = areas.findIndex((a) => a.id === areaId)
    const target = index + direction
    if (index < 0 || target < 0 || target >= areas.length) return

    const ordered = [...areas]
    const [item] = ordered.splice(index, 1)
    ordered.splice(target, 0, item)
    const orderedIds = ordered.map((a) => a.id)

    setBusy(true)
    try {
      await reorderAreas(user.uid, orderedIds)
      await refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível reordenar.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function onArchive(areaId: string) {
    if (!user) return
    setBusy(true)
    try {
      await archiveArea(user.uid, areaId)
      await refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível arquivar.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Áreas</h1>
          <p className="text-sm text-muted-foreground">
            Crie, renomeie, reordene ou arquive.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={busy}>
          Nova área
        </Button>
      </header>

      {loading && areas.length === 0 && (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      )}

      {error && areas.length === 0 && (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
          >
            Tentar de novo
          </Button>
        </div>
      )}

      {!loading && areas.length === 0 && !error && (
        <div className="space-y-4 py-8">
          <p className="text-muted-foreground">{emptyLabel}</p>
          <Button type="button" onClick={openCreate}>
            Criar área
          </Button>
        </div>
      )}

      {areas.length > 0 && (
        <ul className="divide-y divide-border/60 border-y border-border/60">
          {areas.map((area, index) => (
            <li
              key={area.id}
              className="flex flex-wrap items-center gap-3 py-4 sm:flex-nowrap"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{area.name}</p>
                <p className="text-xs text-muted-foreground">
                  Atenção: {area.score}/10
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Mover para cima"
                  disabled={busy || index === 0}
                  onClick={() => void move(area.id, -1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Mover para baixo"
                  disabled={busy || index === areas.length - 1}
                  onClick={() => void move(area.id, 1)}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => openRename(area.id, area.name)}
                >
                  Renomear
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  className="text-destructive hover:text-destructive"
                  onClick={() => void onArchive(area.id)}
                >
                  Arquivar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.type === 'rename' ? 'Renomear área' : 'Nova área'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submitDialog()
            }}
            className="space-y-4"
          >
            <Input
              autoFocus
              placeholder="Nome da área"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              disabled={busy}
              aria-invalid={nameDraft.length > 0 && nameDraft.trim() === ''}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={closeDialog}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={busy || nameDraft.trim() === ''}
              >
                {dialog?.type === 'rename' ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
