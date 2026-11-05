<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2cfecbc0-dfd6-48fd-9c9a-9c207db96566

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firestore database integration

The app now mirrors its shared application records to the configured Firebase
Firestore database while retaining `localStorage` as an offline/local cache.

Collections used:

- `users`
- `action_plans`
- `chat_messages`
- `archives`
- `meeting_minutes`
- `kpis`
- `audit_logs`
- `app_tiles`

### Firebase setup

1. Open the Firebase project referenced by `firebase-applet-config.json`.
2. Ensure the configured Firestore database ID exists and Firestore is enabled.
3. Publish the repository's `firestore.rules` in Firebase Console (Firestore Database → Rules).
4. Run `npm install` and `npm run dev`.

**Important security note:** this project currently uses application-managed username/password
checks rather than Firebase Authentication. The included Firestore rules inherited from the
starter project grant public read/write access to the listed collections. That is not safe for
production, especially because user records contain password hashes and salts. Before deploying
with real users, implement Firebase Authentication (or a trusted server-side API) and replace
the permissive rules with authenticated, role-aware rules. Do not put sensitive production data
in this database until that security work is complete.

The application requires valid Firebase project configuration and network access for shared
cloud persistence. If Firestore is unavailable, the app continues using its browser cache; cloud
sync errors are reported in the browser console.
