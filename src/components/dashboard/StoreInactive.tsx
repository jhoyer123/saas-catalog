import { CreditCard, AlertCircle, ArrowRight, Upload } from "lucide-react";

export default function PaymentPending() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-gray-50/90 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-red-100 p-8 text-center space-y-6">
        {/* Icono */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center relative">
          <CreditCard className="w-8 h-8 text-red-500" />
          <AlertCircle className="w-5 h-5 text-red-600 absolute -top-1 -right-1 bg-white rounded-full" />
        </div>

        {/* Mensaje */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">
            Suscripción pausada
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tu tienda está temporalmente desactivada por falta de pago. Una vez
            que realices el pago, nuestro equipo validará el comprobante y
            reactivará tu acceso.
          </p>
        </div>

        {/* Pasos reales */}
        <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Cómo reactivar tu tienda:
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold">
                1
              </div>
              Realiza el pago correspondiente
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold">
                2
              </div>
              Envía el comprobante
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              Espera la validación (normalmente rápida)
            </li>
          </ul>
        </div>

        {/* Acciones */}
        <button
          onClick={() => window.location.reload()}
          className="cursor-pointer w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
        >
          Ya envié el comprobante, actualizar.
        </button>

        <p className="text-xs text-gray-400">
          ¿Dudas o demora?{" "}
          <span className="underline cursor-pointer">Contactar soporte</span>
        </p>
      </div>
    </div>
  );
}
