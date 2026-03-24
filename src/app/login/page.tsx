import Image from "next/image";
import { AuthButton } from "@/components/auth-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}


export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="border-b border-primary/30 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="/mpl-logo.png" alt="MPL 2026 logo" width={32} height={32} />
          <span className="text-lg font-semibold">
            MPL <span className="text-primary">2026</span>
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-t-4 border-t-primary">
          <CardHeader className="items-center justify-items-center text-center">
            <Image
              src="/mpl-logo.png"
              alt="MPL 2026 logo"
              width={64}
              height={64}
              className="mb-2 mx-auto"
            />
            <CardTitle className="text-2xl font-bold">
              MPL <span className="text-primary">2026</span>
            </CardTitle>
            <CardDescription>Sign in to predict auction prices</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {/* OAuth buttons */}
            <AuthButton
              provider="google"
              icon={<GoogleIcon />}
              label="Continue with Google"
            />

            {/* Error message */}
            {error && (
              <p className="mt-2 text-center text-sm text-destructive" role="alert">
                Sign-in failed. Please try again.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
