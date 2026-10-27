import { useId, useState, type DragEvent } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Play, Trash2 } from 'lucide-react';
import { icon } from '../theme';
import type { ProductMedia } from '../types';
import { ACCEPTED_MEDIA, MAX_MEDIA, MEDIA_HINT, acceptMedia, coverOf, type MediaRejection } from '../utils/itemForm';

type Props = {
  media: ProductMedia[];
  onChange: (media: ProductMedia[]) => void;
  error?: string;
};

const THUMB_BUTTON =
  'flex h-thumb-action w-thumb-action items-center justify-center rounded-pill bg-media-control text-surface transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50';

export function MediaPicker({ media, onChange, error }: Props) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<MediaRejection[]>([]);
  const full = media.length >= MAX_MEDIA;
  const coverUrl = coverOf(media);

  const addFiles = (files: File[]) => {
    const result = acceptMedia(files, media.length);
    const added: ProductMedia[] = result.accepted.map(({ file, kind }, index) => ({
      id: `m${Date.now()}-${index}`,
      kind,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setRejected(result.rejected);
    if (added.length > 0) onChange([...media, ...added]);
  };

  const move = (index: number, offset: number) => {
    const next = [...media];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    onChange(next);
  };

  const remove = (id: string) => {
    onChange(media.filter((item) => item.id !== id));
    setRejected([]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!full) addFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="flex flex-col gap-sm">
      <span className="font-semibold text-caption text-ink">
        Fotos e vídeos ({media.length}/{MAX_MEDIA})
      </span>

      <div className="grid grid-cols-3 gap-md sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-3">
        {media.map((item, index) => (
          <figure key={item.id} className="relative aspect-square overflow-hidden rounded-control bg-surface-alt">
            {item.kind === 'photo' ? (
              <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <>
                <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover" aria-label={item.name} />
                <span className="absolute inset-zero flex items-center justify-center text-surface" aria-hidden>
                  <Play size={icon.size.lg} strokeWidth={icon.strokeWidth} />
                </span>
              </>
            )}
            {item.url === coverUrl && item.kind === 'photo' ? (
              <span className="absolute top-sm left-sm rounded-pill bg-primary px-sm py-xs font-semibold text-micro text-surface">Capa</span>
            ) : null}
            <div className="absolute inset-x-zero bottom-zero flex items-center justify-between gap-xs p-xs">
              <div className="flex gap-xs">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Mover ${item.name} para a esquerda`} className={THUMB_BUTTON}>
                  <ChevronLeft size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === media.length - 1}
                  aria-label={`Mover ${item.name} para a direita`}
                  className={THUMB_BUTTON}
                >
                  <ChevronRight size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
                </button>
              </div>
              <button type="button" onClick={() => remove(item.id)} aria-label={`Remover ${item.name}`} className={THUMB_BUTTON}>
                <Trash2 size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
              </button>
            </div>
          </figure>
        ))}

        {!full ? (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`aspect-square rounded-control border-2 border-dashed transition-colors ${
              dragging ? 'border-primary bg-primary-dim' : error ? 'border-disagree' : 'border-border'
            }`}
          >
            <label
              htmlFor={inputId}
              className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-xs p-sm text-center text-caption text-ink-muted hover:text-primary"
            >
              <ImagePlus size={icon.size.lg} strokeWidth={icon.strokeWidth} aria-hidden />
              <span className="font-semibold">Adicionar</span>
              <span>ou arraste aqui</span>
            </label>
            <input
              id={inputId}
              type="file"
              multiple
              accept={ACCEPTED_MEDIA}
              onChange={(event) => {
                addFiles(Array.from(event.target.files ?? []));
                event.target.value = '';
              }}
              className="sr-only"
            />
          </div>
        ) : null}
      </div>

      <p className={`text-caption ${error ? 'text-disagree' : 'text-ink-muted'}`}>{error ?? MEDIA_HINT}</p>
      {rejected.length > 0 ? (
        <ul role="alert" className="flex flex-col gap-xs rounded-control bg-disagree-dim p-md text-caption text-disagree">
          {rejected.map((item) => (
            <li key={item.name}>
              <span className="font-semibold">{item.name}</span> não entrou: {item.reason}.
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
