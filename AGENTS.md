<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep daycare persistence behind async loadState/saveState in src/lib/storage.ts so a desktop storage adapter can replace it later.
- Keep the offline single-device password lock in src/lib/auth.ts; it is a convenience lock, not server-enforced access control.
- Store settings with daycare state and persist enum keys; translate presentation labels through small dictionaries and useT.
- Calculate payment balances from installments through pure shared helpers, and validate backups before replacing state.
