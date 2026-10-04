// Form
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/schemas/auth";

//ui components
import InputForm from "../shared/InputForm";
import { PhoneNumberInput } from "../shared/PhoneNumberInput";
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
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
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
          control={control}
          name="full_name"
          errors={errors}
          inputProps={{ placeholder: "Alan Jhon Gonzales Villa" }}
        />

        <InputForm
          label="Correo electrónico"
          control={control}
          name="email"
          errors={errors}
          inputProps={{ placeholder: "alan.gonzales@gmail.com" }}
        />

        <div className="grid w-full gap-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Número de teléfono
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <PhoneNumberInput
                  id="phone"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                  placeholder="7689 8907"
                />
                {fieldState.error && (
                  <p className="text-sm font-medium text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        </div>

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
