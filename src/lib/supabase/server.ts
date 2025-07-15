// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // Option 1 (Preferred): Let TypeScript infer the type
  const cookieStore = await cookies();

  // Option 2 (Alternative if Option 1 still gives issues or for strict typing):
  // Assert the type, acknowledging that in the server environment, it *is* ReadonlyRequestCookies
  // const cookieStore = cookies() as ReadonlyRequestCookies;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // This set method is on the cookieStore object itself, which is designed
            // to interact with the response headers for setting cookies.
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `cookies()` helper can only be called from a Server Component or Server Action.
            // This catch block handles cases where the client might attempt to use this server client.
            console.warn(
              "Supabase createServerClient set cookie error:",
              error,
            );
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options }); // Setting value to '' effectively removes it
          } catch (error) {
            console.warn(
              "Supabase createServerClient remove cookie error:",
              error,
            );
          }
        },
      },
    },
  );
}
