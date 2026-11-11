
const STORAGE_KEY = 'barcodepro_products';
const COUNTER_KEY = 'barcodepro_counter';

export function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function generateInternalCode() {
  let counter = Number(localStorage.getItem(COUNTER_KEY)) || 0;

  const products = getProducts();

  counter++;

  let code;

  do {
    code = `BP${String(counter).padStart(6, '0')}`;
    if (products.some(p => p.code === code)) {
      counter++;
      continue;
    }
    break;
  } while (true);

  localStorage.setItem(COUNTER_KEY, counter);

  return code;
}

export function saveProduct(product) {
  const products = getProducts();

  products.push({
    ...product,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  });

  saveProducts(products);
}

export function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

export function isValidEAN13(code) {
  if (!/^\d{13}$/.test(code)) return false;

  const digits = code.split('').map(Number);

  const sum = digits
    .slice(0, 12)
    .reduce((total, digit, index) => {
      return total + digit * (index % 2 === 0 ? 1 : 3);
    }, 0);

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === digits[12];
}
