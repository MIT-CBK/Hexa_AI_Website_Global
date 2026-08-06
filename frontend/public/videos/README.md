# Video assets

Files currently in use on the home page:

| File | Where it plays | Notes |
|------|----------------|-------|
| `hero.mp4` | **Hero background** (full-bleed, muted, looping, behind the globe) | landscape 16:9 recommended |
| `showcase1.mp4` | "Intelligence in motion" showcase, left tile | 16:9 |
| `showcase2.mp4` | "Intelligence in motion" showcase, right tile | 16:9 |

Optional companions for each: a `.webm` (smaller, loaded first if present) and a
`*-poster.jpg` (shown instantly while the video loads, e.g. `hero-poster.jpg`).
If a file is missing, that spot falls back to an animated placeholder — the
layout never breaks.

## ⚠️ Performance — please compress

The clips dropped in here are large (hero ~20 MB, showcase ~47–48 MB, one is 4K).
That's too heavy for a fast-loading site. Recommended: 1080p max, ~2–5 MB each.
With ffmpeg:

```bash
# 1080p, good quality, web-optimized, no audio:
ffmpeg -i input.mp4 -vf "scale=-2:1080" -c:v libx264 -crf 26 -preset slow \
       -an -movflags +faststart hero.mp4

# also make a smaller webm (optional, loads first):
ffmpeg -i input.mp4 -vf "scale=-2:1080" -c:v libvpx-vp9 -crf 34 -b:v 0 -an hero.webm
```

## Converting an `.m3u8` (HLS) to MP4

```bash
ffmpeg -i "https://…/<name>_720w.m3u8" -c copy showcase1.mp4
```
