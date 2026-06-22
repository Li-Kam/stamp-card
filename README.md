# Stamps of Gold 💛

A little static website: a stamp card where each stamp is a reason she's wonderful.
Fill a card with 10 stamps and she trades it in for a **real nugget of gold** — and a
golden nugget drops into the glass jar on the page as a keepsake tally.

Everything lives in plain HTML/CSS/JS — no build step, no frameworks. You add stamps
by editing one file: **`stamps.json`**.

---

## How it works

- The **Current Card** shows up to 10 stamps. Each filled stamp can be tapped to read
  *why* she earned it.
- When a card reaches 10 stamps it's **full** — she redeems it for actual gold, and the
  jar gains **one gold nugget**.
- The **Gold Jar** shows one nugget for every full card. The jar fills up over time.
- On a return visit, brand-new stamps gently animate in (a little press), and a newly
  earned nugget drops into the jar — a bit of anticipation each time.

---

## Adding a stamp (the only thing you'll normally do)

Open **`stamps.json`** and add an entry to the `stamps` list of the latest card:

```json
{ "date": "2026-06-25", "reason": "For making me laugh until I cried." }
```

- `date` — `YYYY-MM-DD`. Shown nicely formatted in the popover.
- `reason` — the little note shown when she taps the stamp. Keep it short and sweet.

When a card reaches **10 stamps**, start a **new card** by adding another object to the
`cards` list:

```json
{
  "cards": [
    { "id": 1, "redeemed": true,  "stamps": [ ... 10 stamps ... ] },
    { "id": 2, "redeemed": false, "stamps": [
      { "date": "2026-07-01", "reason": "For the picnic you planned." }
    ] }
  ]
}
```

A card counts as a jar nugget once it has 10 stamps. (`redeemed` is just a note for you —
mark it `true` once you've handed over the real gold.)

### Personalize it

The top of `stamps.json` has a `config` block:

```json
"config": {
  "herName": "HER_NAME",
  "title": "Stamps of Gold",
  "subtitle": "Every stamp is a little reason you're wonderful.",
  "message": "Fill a card with 10 stamps and trade it in for a real nugget of gold. — Love, ME",
  "stampsPerCard": 10
}
```

Change `herName`, `message`, etc. to whatever you like.

---

## Preview it on your computer

Because the page loads `stamps.json`, you need a tiny local server (opening the file
directly won't work). From this folder:

```bash
python -m http.server 4178
```

Then open <http://localhost:4178> in your browser.

---

## Publish it free on GitHub Pages

1. Create a new repository on GitHub (e.g. `stamp-card`) and push these files:

   ```bash
   git add .
   git commit -m "Stamps of Gold"
   git branch -M main
   git remote add origin https://github.com/<your-username>/stamp-card.git
   git push -u origin main
   ```

2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick branch **`main`** and folder **`/ (root)`**, then **Save**.
5. After a minute your site is live at
   `https://<your-username>.github.io/stamp-card/`. Send her the link. 💛

To add a stamp later: edit `stamps.json`, then `git commit` and `git push`. The live site
updates within a minute.

> Tip: keep the repo **public** so Pages works on a free account (the URL is shareable
> but not easily discoverable). If you'd rather it not be found, use a hard-to-guess repo
> name.

---

## Files

| File          | What it is                                              |
|---------------|---------------------------------------------------------|
| `index.html`  | Page structure                                          |
| `styles.css`  | All the styling, jar, and animations                    |
| `app.js`      | Loads `stamps.json` and renders the card + jar          |
| `stamps.json` | **Your data** — stamps, reasons, and personalization    |
| `.nojekyll`   | Tells GitHub Pages to serve files as-is                 |
