import { Ban } from "lucide-react";

export default function StoreInactive() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <Ban className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">
            Tu tienda está suspendida
          </h1>
          <p className="text-sm text-gray-500">
            Tu cuenta ha sido desactivada temporalmente. Esto puede deberse a un
            problema con tu plan o a una revisión de tu cuenta.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 text-sm text-gray-600 text-left space-y-1">
          <p className="font-medium text-gray-700">¿Qué puedes hacer?</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Verifica el estado de tu suscripción</li>
            <li>Contacta a soporte si crees que es un error</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <p className="text-sm text-gray-500">
            Contacta a soporte para resolver este problema.
          </p>
        </div>
      </div>
    </div>
  );
}
