# haydencardwell.com

A small static personal website. White, system fonts, no navigation bar, no external font or framework requests. A small script handles the optional click-to-play startup sound and a waveform-driven reveal of the Windows XP Bliss wallpaper. The portrait starts in black and white and fades into its original color; a translucent white panel keeps the content readable.

## Preview

Requires Python 3. No packages to install.

```sh
python3 build.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory public
```

Open http://127.0.0.1:8765 in Firefox. Serve `public/`, not the repository root.

## Edit the website

- `templates/home.html`: biography and document links.
- `templates/base.html`: shared page structure and metadata.
- `public/assets/site.css`: layout, typography, and article styling.
- `public/docs/`: the existing resume and AWS certifications.
- `templates/writing.html` and `templates/post.html`: writing index and article layout.

Run `python3 build.py` after editing templates or posts. Generated pages in `public/` are committed, so deployment needs no build dependency.

All navigation and document links open a new tab with `noopener noreferrer`. The shared `<base target="_blank">` also covers links in future article content; the “Skip to content” shortcut explicitly stays in the current page.

## Add a post

1. Write the article as an HTML fragment in `content/posts/your-post-slug.html`. Use paragraphs (`<p>`), section headings (`<h2>`), lists, links, and other standard article elements. The shared template supplies the page title, date, page structure; do not add a second `<h1>`.
2. Add a record to the list in `content/posts.json` with `slug`, `title`, and `date` (YYYY-MM-DD), plus an optional `description` for search/social metadata. The slug must match the HTML filename without its extension.
3. Run `python3 build.py` and preview. The homepage writing section is currently hidden. `/writing.html` and the article templates are retained for future posts. The writing index shows all posts, newest first. Each post receives its own `/writing/your-post-slug.html` page and sitemap entry.

The list is currently empty. No placeholder articles are published. To keep a draft private, keep its file out of the JSON list. Draft content stays outside `public/` and is not uploaded by the deployment workflow.

## Hosting

The existing AWS workflow deploys only `public/` to S3 when `main` is pushed, or when run manually. It retains the existing GitHub environment and secret names. All page links use explicit HTML paths, so blog pages require no new CloudFront routing configuration.

After every successful S3 upload, the workflow invalidates `/*` on CloudFront distribution `E3W4QWZSEG1C6F` in account `740365603924` and waits for completion before reporting success. Pushes to `main` and manual runs both refresh the cache automatically. Publication normally takes a few minutes, including GitHub runner startup and CloudFront propagation; already-open pages still need to be refreshed.

The existing `github-actions` IAM user has `cloudfront:CreateInvalidation` and `cloudfront:GetInvalidation` only for this distribution. No CloudFront listing or distribution-editing permission is needed. Deployments run serially so a newer push does not interrupt an upload or its invalidation.

Local preview does not update AWS. Deployment occurs when changes are pushed to `main`. The original Downloads checkout, including its uncommitted edits, is unchanged.

## Startup sound

The words “Windows XP startup sound” are an inline playback button. Clicking reveals the Bliss wallpaper and portrait color in sync with the recording’s measured waveform. Clicking again stops playback, and another click replays the reveal. The small adjacent back arrow plays the recording and visual reveal in reverse, including from partway through playback. Audio metadata is preloaded; playback requires a click. The native buttons support keyboard activation and accessible labels, and reduced-motion preferences show the final appearance immediately.

The WAV file is hosted with the site in `public/assets/windows-xp-startup.wav`; `windows-xp-startup-reversed.wav` contains the same stereo frames in reverse order. The smoothed 20 ms waveform samples are embedded in `startup-sound.js` and are driven by the audio playback clock. The wallpaper uses the [Bliss image on Wikimedia](https://upload.wikimedia.org/wikipedia/en/2/27/Bliss_%28Windows_XP%29.png). Source: [Winhistory’s Windows startup-sound archive](https://www.winhistory.de/more/winstart/winstart_en.htm), [Windows XP recording](https://www.winhistory.de/more/winstart/down/oxp.wav).

## Public resume privacy

The Resume link uses `public/docs/hayden-cardwell-resume.pdf`. Its contact line uses `admin@cardwell.cloud` and masks every phone digit except the first and last. The unredacted document and its original download path have been removed from the published Git history. Both CrowdStrike certifications remain listed.

The deployment checks PDF text, annotations, metadata, and streams before uploading. Install `pypdf` and run `python3 scripts/check_public_resume.py` to run the same check locally. Keep private resume originals outside this repository. Re-clone older copies before contributing so obsolete history is not reintroduced.

The manual “Purge retired resume copies” workflow attempts to delete S3 versions of the retired object and invalidate matching CloudFront distributions using the existing deployment account. Its result reports any permissions that prevented cleanup.
