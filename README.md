# ANAWAR HEIN Football — GitHub Pages

## Shared AR YONE data

This website loads match, channel, and sports data directly from `https://www.aryone.live/`.
Update only these files in the AR YONE GitHub repository:

- `custom-matches.js`
- `channels.js`
- `games.js`

ANAWAR HEIN LIVE will display those updates automatically. Its branding, theme,
access codes, and device-local settings remain separate.

This version is 100% static. It uses HTML, CSS and JavaScript only, so no Python server is required.

## Publish

1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, and `app.js` to the repository root.
3. Open **Settings → Pages**.
4. Set Source to **Deploy from a branch**, branch **main**, folder **/(root)**.
5. Save and wait for the GitHub Pages URL.

The main Football page has no match API and no browser Add Match form. Every match is maintained directly in `custom-matches.js` and published through GitHub Pages. League, teams, logos, kickoff, status, scores, and an authorized MP4/HLS stream can be configured in code.

Click a match card to open its configured MP4 or HLS (`.m3u8`) source. There is no fallback video; a match without `stream` shows a stream-unavailable message.

For multiple qualities, add a `streams` array to a match in `custom-matches.js`, for example `{label:'HD', url:'https://example.com/hd.m3u8'}`. SD, HD, FHD, backup servers, MP4, and HLS links are supported. The first link opens by default and viewers can switch using the player buttons.

The Settings page stores auto-refresh, interval, autoplay, and accent-color preferences in the browser.

The Live TV page includes sample HLS channels, search, categories, fullscreen playback, and a custom-channel form. Edit `channels.js` for permanent channels or use the plus button to store channels in the current browser. Only publish streams you are authorized to distribute.

The Results page uses a free browser-compatible football scoreboard endpoint and includes date navigation plus All, Live, Finished, and Upcoming filters.

The News page loads the latest football headlines from a free browser-compatible news endpoint, with a breaking-news hero, search, category filters, refresh, and links to full articles.

The Burmese-language Sports Live page supports manually added basketball, volleyball, tennis, combat-sport, badminton, and other games. Permanent games live in `games.js`; the plus-button form stores custom games in the current browser. MP4 and HLS playback are supported.

The GitHub Pages-only access gate redirects protected pages to `access.html`. `admin-codes.html` creates expiring codes. Change `secret` and `adminPin` in `access-config.js` before publishing. This is a convenience gate, not secure authentication, because client-side secrets can be inspected.

Protected pages show the member name and remaining access time in days, hours, or minutes. The badge refreshes every 30 seconds and sends expired users back to login automatically.
