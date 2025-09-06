// AuthPage is no longer needed - Clerk handles authentication UI automatically
// Users will be redirected to Clerk's hosted sign-in page
export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication handled by Clerk
        </h1>
        <p className="text-gray-600">
          You should be redirected to the sign-in page automatically.
        </p>
      </div>
    </div>
  );
}
