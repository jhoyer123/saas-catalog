import { z } from "zod";

const MAX_BANNERS = 3;
const MAX_SIZE_MB = 3;

export const bannerSchema = z
  .object({
    images: z
      .array(z.custom<File>())
      .refine(
        (files) =>
          files.every((file) => file.size <= MAX_SIZE_MB * 1024 * 1024),
        `Cada banner no puede superar ${MAX_SIZE_MB}MB`,
      ),
    imageExisting: z.array(z.string()),
    imageToDelete: z.array(z.string()),
  })
  .refine((data) => data.images.length + data.imageExisting.length >= 1, {
    message: "Debes tener al menos un banner",
    path: ["images"],
  })
  .refine(
    (data) => data.images.length + data.imageExisting.length <= MAX_BANNERS,
    {
      message: `Máximo ${MAX_BANNERS} banners permitidos`,
      path: ["images"],
    },
  );

export type BannerFormValues = z.infer<typeof bannerSchema>;
