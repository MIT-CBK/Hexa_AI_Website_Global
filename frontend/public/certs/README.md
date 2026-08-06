# Certification badges

The Certifications section renders a badge image per certification (`logoUrl` in
`data/default-content.ts` → `/certs/<name>.svg`).

Currently these are **original, on-brand hexagon credential seals** (custom SVGs
created for this site — not the issuers' official trademarked artwork). They give
a clean, consistent wall out of the box.

To use the **official** badge for any cert, drop an image here and point its
`logoUrl` at it (or just replace the matching file). Names in use:

`oscp.svg` · `oswe.svg` · `osep.svg` · `osed.svg` · `crto.svg` · `crtl.svg` ·
`cissp.svg` · `ceh-master.svg` · `ccnp.svg`

If a file is missing or fails to load, the badge falls back to the hexagon emblem
automatically — the layout never breaks.
