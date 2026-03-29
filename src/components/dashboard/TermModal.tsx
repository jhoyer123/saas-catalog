"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "1. Descripción del servicio",
    content:
      "JPlataform es una plataforma que permite a los usuarios crear y gestionar catálogos digitales para mostrar productos o servicios. No procesamos pagos, no realizamos ventas ni gestionamos facturación en nombre de los usuarios.",
  },
  {
    title: "2. Uso del servicio",
    content:
      "El usuario se compromete a utilizar la plataforma de manera adecuada y a no publicar contenido ilegal, ofensivo o que infrinja derechos de terceros. Nos reservamos el derecho de suspender o eliminar cuentas que incumplan estas normas.",
  },
  {
    title: "3. Disponibilidad del servicio",
    content:
      'El servicio se ofrece "tal cual" y puede presentar interrupciones, errores o caídas ocasionales. No garantizamos disponibilidad continua ni libre de fallos.',
  },
  {
    title: "4. Responsabilidad del usuario",
    content:
      "El usuario es responsable de la información que publica en su catálogo, incluyendo productos, imágenes, descripciones y cualquier otro contenido.",
  },
  {
    title: "5. Limitación de responsabilidad",
    content: null,
    list: [
      "Pérdidas de ventas o ingresos",
      "Daños derivados del uso o imposibilidad de uso del servicio",
      "Errores en la información publicada por los usuarios",
      "Pérdida de datos, aunque se realizan esfuerzos razonables para evitarlos",
    ],
    listIntro: "JPlataform no se hace responsable por:",
  },
  {
    title: "6. Planes y pagos",
    content:
      "El acceso a ciertas funcionalidades puede estar sujeto a planes de pago. En caso de pagos, el acceso al servicio se activará manualmente una vez verificado el pago. No se garantizan reembolsos, salvo casos excepcionales evaluados individualmente.",
  },
  {
    title: "7. Modificaciones",
    content:
      "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta misma página.",
  },
];

export function TermsModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-inter font-light text-muted-foreground"
        >
          Términos y Condiciones
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="py-4 border-b">
          <DialogTitle className="text-base font-semibold">
            Términos y Condiciones de Uso
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Última actualización: 25 de marzo de 2026
          </p>
        </DialogHeader>

        <ScrollArea className="h-105">
          <div className="py-5 space-y-5 text-sm text-muted-foreground leading-relaxed">
            <p>
              Al utilizar nuestro servicio, aceptas los siguientes términos y
              condiciones.
            </p>

            {sections.map((section, i) => (
              <div key={i} className="space-y-1.5">
                <h3 className="text-sm font-medium text-foreground">
                  {section.title}
                </h3>
                {section.content && <p>{section.content}</p>}
                {section.list && (
                  <>
                    <p>{section.listIntro}</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {section.list.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
                {i < sections.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t flex justify-end">
          <DialogTrigger asChild>
            <Button size="sm">Cerrar</Button>
          </DialogTrigger>
        </div>
      </DialogContent>
    </Dialog>
  );
}
