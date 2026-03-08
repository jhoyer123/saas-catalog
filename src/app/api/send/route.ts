import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  await resend.emails.send({
    from: "noreply@tudominio.com",
    to: "usuario@ejemplo.com",
    subject: "Hola!",
    html: "<p>Tu mensaje</p>",
  });
}
