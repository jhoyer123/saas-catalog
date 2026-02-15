// Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/schemas/auth";

//ui components
import InputForm from "../shared/InputForm";
import InputPassword from "./InputPassword";
import { Button } from "../ui/button";

//types
import type { RegisterData } from "@/lib/schemas/auth";

// Props for the FormRegister component
interface Props {
  handleRegister: (data: RegisterData) => void;
  isPending: boolean;
}

const FormRegister = ({ handleRegister, isPending }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterData) => {
    handleRegister(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <section className="flex flex-col gap-6 w-full max-w-4xl px-4">
        <InputForm
          label="Nombre completo"
          register={register}
          name="full_name"
          errors={errors}
          inputProps={{ placeholder: "Alan Jhon Gonzales Villa" }}
        />

        <InputForm
          label="Correo electrónico"
          register={register}
          name="email"
          errors={errors}
          inputProps={{ placeholder: "alan.gonzales@gmail.com" }}
        />

        <InputForm
          label="Número de teléfono"
          register={register}
          name="phone"
          errors={errors}
          inputProps={{ placeholder: "678878654" }}
        />

        <InputPassword
          label="Contraseña"
          name="password"
          register={register}
          errors={errors}
        />

        <InputPassword
          label="Confirmar contraseña"
          name="confirmPassword"
          register={register}
          errors={errors}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creando cuenta..." : "Registrarse"}
        </Button>
      </section>
    </form>
  );
};

export default FormRegister;
