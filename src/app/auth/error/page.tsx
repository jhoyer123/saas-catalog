// app/auth/error/page.tsx
export default function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Link inválido o expirado</h1>
      <p className="text-gray-500 mt-2">
        El link de verificación ya no es válido.
      </p>
      <a href="/auth/login" className="mt-4 underline">
        Volver al login
      </a>
    </div>
  );
}
