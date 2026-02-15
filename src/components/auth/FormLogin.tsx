// Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/auth";

//types
import type { LoginData } from "@/lib/schemas/auth";

//ui components
import InputForm from "../shared/InputForm";
import InputPassword from "./InputPassword";
import { Button } from "../ui/button";

// Props for the FormLogin component
interface Props {
  handleLogin: (data: LoginData) => void;
  isPending: boolean;
}

const FormLogin = ({ handleLogin, isPending }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  console.log("Errores:", errors);

  const onSubmit = (data: LoginData) => {
    handleLogin(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <section className="flex flex-col gap-6 w-full max-w-4xl px-4">
        <InputForm
          label="Correo electrónico"
          register={register}
          name="email"
          errors={errors}
          inputProps={{ placeholder: "alan.gonzales@gmail.com" }}
        />

        <InputPassword
          label="Contraseña"
          name="password"
          register={register}
          errors={errors}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </section>
    </form>
  );
};

export default FormLogin;
