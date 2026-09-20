"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combinatorSelectionSchema = exports.variantFormSchema = void 0;
var zod_1 = require("zod");
exports.variantFormSchema = zod_1.z.object({
    sku: zod_1.z.string().optional().nullable(),
    price: zod_1.z.number().positive(),
    offer_price: zod_1.z.number().positive().optional().nullable(),
    stock: zod_1.z.number().int().min(0).default(0),
    is_available: zod_1.z.boolean().default(true),
});
exports.combinatorSelectionSchema = zod_1.z
    .array(zod_1.z.string().uuid())
    .min(1, 'Debe seleccionar al menos un valor por atributo');
