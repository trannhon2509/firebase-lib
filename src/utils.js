// Các hàm tiện ích cho sản phẩm

// Hàm tạo tên random
export function randomName() {
  const adjectives = ['Cool', 'Smart', 'Fast', 'Bright', 'Fresh', 'Strong', 'Happy', 'Lucky', 'Magic', 'Chill'];
  const nouns = ['Phone', 'Laptop', 'Shirt', 'Shoes', 'Bag', 'Watch', 'Bottle', 'Book', 'Pen', 'Chair'];
  return (
    adjectives[Math.floor(Math.random() * adjectives.length)] +
    ' ' +
    nouns[Math.floor(Math.random() * nouns.length)] +
    ' #' + Math.floor(Math.random() * 10000)
  );
}

// Hàm tạo mã màu hex random
export function randomHexColor() {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

// Hàm random số lượng màu (1-5) và trả về mảng mã hex
export function randomColors() {
  const count = Math.floor(Math.random() * 5) + 1;
  return Array.from({ length: count }, randomHexColor);
}

export function createProducts(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: randomName(),
    price: Math.floor(Math.random() * 1000) + 10, // 10 - 1009
    quantity: Math.floor(Math.random() * 100) + 1, // 1 - 100
    colors: randomColors(),
    image: 'https://i.pravatar.cc/300',
  }));
}

export function getProductsFromLocalStorage() {
  const data = localStorage.getItem('products');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveProductsToLocalStorage(products) {
  localStorage.setItem('products', JSON.stringify(products));
}
