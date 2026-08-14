"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productOptionTypesSelectionSchema = void 0;
var zod_1 = require("zod");
exports.productOptionTypesSelectionSchema = zod_1.z
    .array(zod_1.z.object({
    optionTypeId: zod_1.z.string().uuid(),
    isVisual: zod_1.z.boolean().default(false),
}))
    .min(1);
