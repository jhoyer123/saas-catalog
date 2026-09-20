"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var productOptionTypes_schema_1 = require("./productOptionTypes.schema");
var productVariant_schema_1 = require("./productVariant.schema");
var okSelection = [
    { optionTypeId: '00000000-0000-0000-0000-000000000001', isVisual: true },
];
var badSelection = [];
console.log('selection ok:', productOptionTypes_schema_1.productOptionTypesSelectionSchema.safeParse(okSelection));
console.log('selection bad:', productOptionTypes_schema_1.productOptionTypesSelectionSchema.safeParse(badSelection));
console.log('variant ok:', productVariant_schema_1.variantFormSchema.safeParse({ price: 10, stock: 5 }));
console.log('variant bad price:', productVariant_schema_1.variantFormSchema.safeParse({ price: -1, stock: 0 }));
console.log('combinator ok:', productVariant_schema_1.combinatorSelectionSchema.safeParse(['00000000-0000-0000-0000-000000000010']));
console.log('combinator bad:', productVariant_schema_1.combinatorSelectionSchema.safeParse([]));
