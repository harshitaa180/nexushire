import { useInView } from 'framer-motion'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DemoReel } from './DemoReel'
import { cn } from '@/lib/utils'

/**
 * Plays a real video when one is present, and falls back to the scripted
 * `DemoReel` when it isn't — so the hero always has motion, and dropping an
 * MP4 into `public/media/` upgrades it with no code change.
 *
 * Either way, playback is gated on visibility: nothing animates or decodes
 * while it's scrolled off-screen.
 */
export function VideoPanel({
  src,
  poster,
  className,
}: {
  /** Root-relative path, e.g. 'media/showreel.mp4'. Resolved against BASE_URL. */
  src?: string
  poster?: string
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inView = useInView(wrapRef, { margin: '-15%' })

  const [hasVideo, setHasVideo] = useState(Boolean(src))
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)

  const resolved = src ? `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}` : undefined

  // Pause when off-screen; resume when it comes back and the user hasn't
  // explicitly paused it.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !hasVideo) return
    if (inView && playing) void video.play().catch(() => setHasVideo(false))
    else video.pause()
  }, [inView, playing, hasVideo])

  if (!hasVideo) {
    return (
      <div ref={wrapRef} className={className}>
        <DemoReel playing={inView} />
      </div>
    )
  }

  return (
    <div ref={wrapRef} className={cn('group relative overflow-hidden rounded-3xl glass', className)}>
      <video
        ref={videoRef}
        src={resolved}
        poster={poster ? `${import.meta.env.BASE_URL}${poster.replace(/^\//, '')}` : undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onError={() => setHasVideo(false)}
        className="block h-full w-full object-cover"
      />

      {/* Controls — visible on hover, always reachable by keyboard */}
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 flex items-center gap-2 p-3',
          'bg-gradient-to-t from-black/55 to-transparent',
          'opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100',
        )}
      >
        <button
          type="button"
          aria-label={playing ? 'Pause video' : 'Play video'}
          onClick={() => setPlaying((p) => !p)}
          className="grid h-8 w-8 place-items-center rounded-md bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
          onClick={() => setMuted((m) => !m)}
          className="grid h-8 w-8 place-items-center rounded-md bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}
