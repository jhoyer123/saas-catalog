import { z } from "zod";

const MAX_BANNERS = 3;
const MAX_SIZE_MB = 3;

export const bannerSchema = z.object({
  images: z
    .custom<FileList | null>()
    .refine(
      (files) => !files || files.length <= MAX_BANNERS,
      `Máximo ${MAX_BANNERS} banners permitidos`,
    )
    .refine(
      (files) =>
        !files ||
        Array.from(files).every(
          (file) => file.size <= MAX_SIZE_MB * 1024 * 1024,
        ),
      `Cada banner no puede superar ${MAX_SIZE_MB}MB`,
    ),
  imageExisting: z.array(z.string()),
  imageToDelete: z.array(z.string()),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;
