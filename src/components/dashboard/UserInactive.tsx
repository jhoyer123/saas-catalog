import { UserX, CreditCard, Mail } from "lucide-react";

export default function UserInactive() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icono de Estado */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <UserX className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* Título y Mensaje Principal */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">
            Acceso restringido
          </h1>
          <p className="text-sm text-gray-500">
            Tu cuenta de usuario se encuentra actualmente inactiva. Esto suele
            suceder por procesos de verificación inicial o por falta de pago en
            la mensualidad.
          </p>
        </div>

        {/* Caja de Pasos a seguir */}
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 text-sm text-gray-600 text-left space-y-3">
          <p className="font-medium text-gray-700">
            Pasos para reactivar tu cuenta:
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="text-gray-500">
                <span className="font-medium text-gray-700 block">
                  Revisa tu suscripción
                </span>
                Asegúrate de que tu último pago se haya procesado correctamente.
              </p>
            </div>

            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-gray-400 shrink-0" />
              <p className="text-gray-500">
                <span className="font-medium text-gray-700 block">
                  Verifica tu correo
                </span>
                Si acabas de registrarte, revisa tu bandeja de entrada para
                confirmar tu cuenta.
              </p>
            </div>
          </div>
        </div>

        {/* Acción Final */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda? Contacta con el administrador del sistema.
          </p>
          <button
            className="w-full sm:w-auto px-6 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reintentar acceso
          </button>
        </div>
      </div>
    </div>
  );
}
