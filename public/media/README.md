# Drop-in video

`VideoPanel` renders the scripted `DemoReel` by default. To use a real video
instead, put a file here and pass its path:

```tsx
<VideoPanel src="media/showreel.mp4" poster="media/showreel-poster.jpg" />
```

Paths are resolved against Vite's `BASE_URL`, so they work both locally and
under the `/nexushire/` GitHub Pages prefix. If the file fails to load for any
reason the panel falls back to the reel automatically, so a missing or broken
video can never leave a blank space on the page.

Keep clips short, muted and loopable — they autoplay, and autoplay with sound
is blocked by every browser.
