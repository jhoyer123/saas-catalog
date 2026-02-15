"use client"; // ← Agrega esta línea al inicio

import Form from "@/components/products/form/Form";

export default function Page() {
  // ← Cambia 'page' a 'Page' (buena práctica)

  const handleSubmit = (data: any) => {
    console.log(data);
    // Aquí tu lógica para crear el producto
  };

  return (
    <div className="h-full w-full py-6 px-4">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-6">
        <h1>Crear nuevo producto</h1>
        <Form categories={[]} mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
