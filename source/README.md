# NQ Journal source

The website at the repository root is built from these files.

- `nq_journal.src.html`: the whole journal (layout, styles, code). Edit this, not `../index.html`.
- `assets/`: the Mona Sans font (SIL Open Font License, see `MONA-SANS-OFL.txt`) and the favicon, embedded at build time.
- `firebase-config.json`: the Firebase project's public web settings. Trades are protected by the Firestore rules and by sign-up being turned off, not by this file.
- `build_site.py`: run `python3 source/build_site.py` to rebuild `../index.html`, then commit and push. GitHub Pages publishes it within a minute or two.
- `bridge/`: the small Firebase bridge (`../nqfb.js`): email/password sign-in and Firestore, with offline saving.

Data layout in Firestore: `users/<uid>/days/<YYYY-MM-DD>` holds that day's trades keyed by id; `users/<uid>/shots/<id>` holds one screenshot each. Firestore rules allow each signed-in user only their own `users/<uid>` tree.
