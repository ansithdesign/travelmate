import { useEffect, useRef, useState } from 'react'
import { ArrowSquareOut, CaretLeft, CaretRight, DownloadSimple, File as FileIcon, FileImage, FilePdf, PencilSimple, Plus, Trash, UploadSimple, X } from '@phosphor-icons/react'
import type { Trip, TripFile } from '../../types'
import { deleteFile, filesArePersistent, formatSize, getFile, openStored, putFile } from '../../utils/files'
import { uid } from '../../utils/id'
import { useStore } from '../../store/store'
import { Button } from '../ui/Button'
import { InputField } from '../ui/Field'
import { Menu } from '../ui/Menu'
import { ConfirmDialog, Sheet } from '../ui/Sheet'
import { useToast } from '../ui/Toast'

const MAX = 25 * 1024 * 1024

function iconFor(mime: string) {
  if (mime === 'application/pdf') return FilePdf
  if (mime.startsWith('image/')) return FileImage
  return FileIcon
}

const stem = (n: string) => n.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()

/** Shows a stored file inside the app: images and PDFs inline, anything else as a card with a download. */
function FilePreview({ files, id, onClose, onChange, onOpen }: { files: TripFile[]; id: string | null; onClose: () => void; onChange: (id: string) => void; onOpen: (f: TripFile, download?: boolean) => void }) {
  const idx = files.findIndex((f) => f.id === id)
  const f = idx >= 0 ? files[idx] : null
  const [url, setUrl] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let live = true
    let made: string | null = null
    setUrl(null)
    setMissing(false)
    if (f) {
      getFile(f.id).then((b) => {
        if (!live) return
        if (!b) return setMissing(true)
        made = URL.createObjectURL(b)
        setUrl(made)
      })
    }
    return () => {
      live = false
      if (made) URL.revokeObjectURL(made)
    }
  }, [f?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const Icon = f ? iconFor(f.mime) : FileIcon
  const step = (d: number) => onChange(files[(idx + d + files.length) % files.length].id)

  return (
    <Sheet
      open={!!f}
      onClose={onClose}
      title={f?.name ?? 'File'}
      description={f ? `${f.fileName} · ${formatSize(f.size)}` : undefined}
      footer={
        f ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="lg" icon={ArrowSquareOut} onClick={() => onOpen(f)}>
              Open in new tab
            </Button>
            <Button size="lg" icon={DownloadSimple} onClick={() => onOpen(f, true)}>
              Download
            </Button>
          </div>
        ) : undefined
      }
    >
      {f ? (
        <div>
          <div className="flex min-h-[52dvh] items-center justify-center overflow-hidden rounded-[22px] bg-well">
            {missing ? (
              <p className="px-6 text-center text-body text-ink-3">This file is not on this device. It was added from another browser.</p>
            ) : !url ? (
              <p className="text-meta text-ink-3">Loading</p>
            ) : f.mime.startsWith('image/') ? (
              <img src={url} alt={f.name} className="max-h-[60dvh] w-full object-contain" />
            ) : f.mime === 'application/pdf' ? (
              <iframe src={url} title={f.name} className="h-[60dvh] w-full border-0 bg-white" />
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                <span className="flex size-16 items-center justify-center rounded-[20px] bg-accent-soft text-accent-ink">
                  <Icon size={32} weight="duotone" aria-hidden />
                </span>
                <p className="text-body text-ink-3">This kind of file cannot be shown here. Download it to open it in another app.</p>
              </div>
            )}
          </div>
          {files.length > 1 ? (
            <div className="mt-3 flex items-center justify-between">
              <button type="button" onClick={() => step(-1)} aria-label="Previous file" className="press flex size-11 items-center justify-center rounded-full bg-well text-ink-2">
                <CaretLeft size={18} weight="bold" aria-hidden />
              </button>
              <p className="num text-caption font-semibold text-ink-3">
                {idx + 1} of {files.length}
              </p>
              <button type="button" onClick={() => step(1)} aria-label="Next file" className="press flex size-11 items-center justify-center rounded-full bg-well text-ink-2">
                <CaretRight size={18} weight="bold" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  )
}

interface Draft {
  key: string
  file: File
  name: string
}

/** Tickets, booking PDFs and photos for a trip, each with a name people can change. */
export function TripFiles({ trip }: { trip: Trip }) {
  const { saveTrip } = useStore()
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [renaming, setRenaming] = useState<TripFile | null>(null)
  const [newName, setNewName] = useState('')
  const [removing, setRemoving] = useState<TripFile | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState<string | null>(null)
  const files = trip.files ?? []

  function picked(list: FileList | null) {
    if (!list || list.length === 0) return
    const ok: Draft[] = []
    let big = 0
    for (const f of Array.from(list)) {
      if (f.size > MAX) big++
      else ok.push({ key: uid('u-'), file: f, name: stem(f.name) || f.name })
    }
    if (big) toast.error(`${big === 1 ? 'One file is' : `${big} files are`} over 25 MB and was skipped`)
    if (ok.length) setDrafts(ok)
    if (input.current) input.current.value = ''
  }

  async function saveDrafts() {
    setSaving(true)
    const added: TripFile[] = []
    let kept = true
    for (const d of drafts) {
      const id = uid('f-')
      const stored = await putFile(id, d.file)
      kept = kept && stored
      added.push({ id, name: d.name.trim() || stem(d.file.name) || d.file.name, fileName: d.file.name, mime: d.file.type || 'application/octet-stream', size: d.file.size, addedAt: new Date().toISOString() })
    }
    saveTrip({ ...trip, files: [...files, ...added] })
    setSaving(false)
    setDrafts([])
    toast.success(added.length === 1 ? `${added[0].name} added` : `${added.length} files added`)
    if (!kept) toast.error('This browser would not keep the files after you close it')
  }

  async function open(f: TripFile, download = false) {
    const ok = await openStored(f.id, f.fileName, download)
    if (!ok) toast.error('That file is not on this device')
  }

  return (
    <section aria-labelledby="tickets" className="mt-7">
      <div className="flex min-h-11 items-center justify-between gap-3 px-0.5">
        <h2 id="tickets" className="text-title">
          Tickets and files
        </h2>
      </div>
      {files.length ? (
        <ul className="panel-strong rows flat mt-3 rounded-[28px]">
          {files.map((f) => {
            const Icon = iconFor(f.mime)
            return (
              <li key={f.id} className="relative flex items-center gap-3 py-3 pr-2 pl-4 focus-within:z-10">
                <button type="button" onClick={() => setPreviewing(f.id)} className="press flex min-w-0 flex-1 items-center gap-3 text-left" aria-label={`Preview ${f.name}`}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-accent-soft text-accent-ink">
                    <Icon size={22} weight="duotone" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{f.name}</span>
                    <span className="block truncate text-caption text-ink-3">
                      {f.fileName} · {formatSize(f.size)}
                    </span>
                  </span>
                </button>
                <Menu
                  label={`Actions for ${f.name}`}
                  items={[
                    { label: 'Rename', icon: PencilSimple, onSelect: () => (setRenaming(f), setNewName(f.name)) },
                    { label: 'Open in new tab', icon: ArrowSquareOut, onSelect: () => open(f) },
                    { label: 'Download', icon: DownloadSimple, onSelect: () => open(f, true) },
                    { label: 'Remove', icon: Trash, onSelect: () => setRemoving(f), danger: true },
                  ]}
                />
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="panel mt-3 rounded-[28px] p-5 text-body text-ink-3">Add flight tickets, hotel vouchers or any PDF or photo, so everyone can open them from here.</p>
      )}
      <input ref={input} type="file" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => picked(e.target.files)} />
      <button type="button" onClick={() => input.current?.click()} className="glass-control press mt-3 inline-flex h-[42px] items-center gap-2 rounded-full pr-4 pl-3 text-[14px] font-medium hover:bg-solid">
        <Plus size={18} weight="bold" className="text-accent" aria-hidden />
        Add files
      </button>

      <Sheet
        open={drafts.length > 0}
        onClose={() => setDrafts([])}
        title={drafts.length === 1 ? 'Name this file' : `Name ${drafts.length} files`}
        description="The name is what everyone sees. The original file name stays underneath."
        footer={
          <Button block size="lg" icon={UploadSimple} disabled={saving} onClick={saveDrafts}>
            {saving ? 'Adding' : drafts.length === 1 ? 'Add file' : `Add ${drafts.length} files`}
          </Button>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={(e) => (e.preventDefault(), saveDrafts())}>
          {drafts.map((d, i) => {
            const Icon = iconFor(d.file.type)
            return (
              <div key={d.key} className="flex items-end gap-2">
                <span className="mb-1 flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-accent-soft text-accent-ink">
                  <Icon size={22} weight="duotone" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <InputField label={`${d.file.name} · ${formatSize(d.file.size)}`} data-autofocus={i === 0 ? true : undefined} value={d.name} onChange={(e) => setDrafts((x) => x.map((y) => (y.key === d.key ? { ...y, name: e.target.value } : y)))} placeholder="BLR to SXR ticket" />
                </div>
                {drafts.length > 1 ? (
                  <button type="button" aria-label={`Skip ${d.file.name}`} onClick={() => setDrafts((x) => x.filter((y) => y.key !== d.key))} className="press mb-1 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-3 hover:bg-well">
                    <X size={18} weight="bold" aria-hidden />
                  </button>
                ) : null}
              </div>
            )
          })}
          {!filesArePersistent() ? <p className="text-caption text-ink-3">This browser is not keeping files between visits.</p> : null}
          <button type="submit" hidden />
        </form>
      </Sheet>

      <Sheet
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title="Rename file"
        footer={
          <Button
            block
            size="lg"
            disabled={!newName.trim()}
            onClick={() => {
              if (!renaming) return
              saveTrip({ ...trip, files: files.map((f) => (f.id === renaming.id ? { ...f, name: newName.trim() } : f)) })
              toast.success('Renamed')
              setRenaming(null)
            }}
          >
            Save name
          </Button>
        }
      >
        <InputField label="Name" data-autofocus value={newName} onChange={(e) => setNewName(e.target.value)} />
      </Sheet>

      <FilePreview files={files} id={previewing} onClose={() => setPreviewing(null)} onChange={setPreviewing} onOpen={open} />

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={`Remove ${removing?.name ?? 'this file'}?`}
        body="It will be deleted from this trip."
        confirmLabel="Remove"
        onConfirm={() => {
          if (!removing) return
          deleteFile(removing.id)
          saveTrip({ ...trip, files: files.filter((f) => f.id !== removing.id) })
          toast.success('Removed')
        }}
      />
    </section>
  )
}
