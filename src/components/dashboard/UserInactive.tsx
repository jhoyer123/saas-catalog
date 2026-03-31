import { User, Lock, RefreshCw } from "lucide-react";

export default function UserPendingApproval() {
  const reload = () => window.location.reload();

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-gray-100/80 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
        {/* Icono Principal */}
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-600" strokeWidth={2.5} />
        </div>

        {/* Textos */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">Acceso pendiente</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tu cuenta ha sido creada, pero un administrador debe activarla antes
            de que puedas entrar al sistema.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-4 text-left">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Revisión manual
            </p>
            <p className="text-xs text-gray-500">
              Normalmente las solicitudes se aprueban en menos de 24 horas.
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <button
            onClick={reload}
            className="cursor-pointer w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Verificar estado
          </button>

          <p className="text-xs text-gray-400">
            ¿Necesitas ayuda?{" "}
            <span className="underline cursor-pointer hover:text-gray-600">
              Contacta con soporte
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
