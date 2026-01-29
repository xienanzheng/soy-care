## Mobile builds with Capacitor

1. Install dependencies
   ```sh
   npm install
   ```
2. Build the web bundle
   ```sh
   npm run build
   ```
3. Sync web assets into native shells
   ```sh
   npx cap sync
   ```
4. Open Android Studio / Xcode
   ```sh
   npx cap open android
   npx cap open ios
   ```
5. Configure signing, push notification entitlements, and run on a device or simulator.

Environment variables for Supabase must be present in `.env` before you run `npm run build` so the compiled bundle references your personal project.
