import { generateVariantCombinations } from './generateVariantCombinations';
import { generateSku } from './generateSku';

const selected = {
  'type-a': ['val-a1', 'val-a2'],
  'type-b': ['val-b1'],
};

const existing = ['type-a:val-a1|type-b:val-b1'];

const combos = generateVariantCombinations(selected, existing);
console.log('combos:', combos);

const valuesById = {
  'val-a2': { value: 'Rojo' },
  'val-b1': { value: 'M' },
};

if (combos.length > 0) {
  console.log('sku:', generateSku('mi-producto', combos[0], valuesById));
}
