import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import {
  createArea,
  deleteArea,
  renameArea,
  reorderAreas,
  setAreaActive,
  type Area,
} from '@/data/areasRepo'
import { useAuth } from '@/hooks/useAuth'
import { useAreas } from '@/hooks/useAreas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { emptyLabel } from '@/domain/labels'
import { cn } from '@/lib/utils'

type DialogMode =
  | { type: 'create' }
  | { type: 'rename'; areaId: string; name: string }
  | { type: 'delete'; areaId: string; name: string }
  | null

type SortableAreaRowProps = {
  area: Area
  busy: boolean
  onRename: (areaId: string, name: string) => void
  onDelete: (areaId: string, name: string) => void
  onToggleActive: (areaId: string, active: boolean) => void
}

function SortableAreaRow({
  area,
  busy,
  onRename,
  onDelete,
  onToggleActive,
}: SortableAreaRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area.id, disabled: busy })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-wrap items-center gap-3 py-4 sm:flex-nowrap',
        isDragging && 'relative z-10 bg-background opacity-90 shadow-sm',
        !area.active && 'opacity-55',
      )}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className={cn(
          'inline-flex size-8 shrink-0 touch-none items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          busy
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-grab active:cursor-grabbing',
        )}
        aria-label={`Arrastar ${area.name}`}
        disabled={busy}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{area.name}</p>
        <p className="text-xs text-muted-foreground">
          Atenção: {area.score}/10
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <label className="flex w-[5.5rem] shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={area.active}
            disabled={busy}
            onCheckedChange={(checked) => onToggleActive(area.id, checked)}
            aria-label={
              area.active
                ? `Desativar ${area.name}`
                : `Ativar ${area.name}`
            }
          />
          <span className="w-14 tabular-nums" aria-hidden>
            {area.active ? 'Ativa' : 'Inativa'}
          </span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => onRename(area.id, area.name)}
        >
          Renomear
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(area.id, area.name)}
        >
          Deletar
        </Button>
      </div>
    </li>
  )
}

export function AreasManagePage() {
  const { user } = useAuth()
  const { areas, loading, error, refresh, setAreas } = useAreas({
    includeInactive: true,
  })
  const [dialog, setDialog] = useState<DialogMode>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function openCreate() {
    setNameDraft('')
    setDialog({ type: 'create' })
  }

  function openRename(areaId: string, name: string) {
    setNameDraft(name)
    setDialog({ type: 'rename', areaId, name })
  }

  function openDelete(areaId: string, name: string) {
    setDialog({ type: 'delete', areaId, name })
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

  async function confirmDelete() {
    if (!user || dialog?.type !== 'delete') return
    setBusy(true)
    try {
      await deleteArea(user.uid, dialog.areaId)
      setDialog(null)
      await refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível deletar.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    if (!user || busy) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = areas.findIndex((a) => a.id === active.id)
    const newIndex = areas.findIndex((a) => a.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const previous = areas
    const next = arrayMove(areas, oldIndex, newIndex)
    setAreas(next)

    setBusy(true)
    try {
      await reorderAreas(
        user.uid,
        next.map((a) => a.id),
      )
    } catch (err) {
      setAreas(previous)
      toast.error(
        err instanceof Error ? err.message : 'Não foi possível reordenar.',
      )
    } finally {
      setBusy(false)
    }
  }

  async function onToggleActive(areaId: string, active: boolean) {
    if (!user) return
    const previous = areas
    setAreas((list) =>
      list.map((a) => (a.id === areaId ? { ...a, active } : a)),
    )

    setBusy(true)
    try {
      await setAreaActive(user.uid, areaId, active)
    } catch (err) {
      setAreas(previous)
      toast.error(
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar o status.',
      )
    } finally {
      setBusy(false)
    }
  }

  const formDialog =
    dialog?.type === 'create' || dialog?.type === 'rename' ? dialog : null
  const deleteDialog = dialog?.type === 'delete' ? dialog : null

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Áreas</h1>
          <p className="text-sm text-muted-foreground">
            Crie, ative ou desative, arraste para reordenar ou delete.
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => void onDragEnd(event)}
        >
          <SortableContext
            items={areas.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="divide-y divide-border/60 border-y border-border/60">
              {areas.map((area) => (
                <SortableAreaRow
                  key={area.id}
                  area={area}
                  busy={busy}
                  onRename={openRename}
                  onDelete={openDelete}
                  onToggleActive={(id, active) => void onToggleActive(id, active)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <Dialog
        open={formDialog !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formDialog?.type === 'rename' ? 'Renomear área' : 'Nova área'}
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
                {formDialog?.type === 'rename' ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar área</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remover <span className="font-medium text-foreground">{deleteDialog?.name}</span>?
            O histórico de atenção desta área também será apagado.
          </p>
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
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => void confirmDelete()}
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
