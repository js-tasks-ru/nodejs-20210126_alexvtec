function sum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('arguments has unsupported type');
  }

  return a + b;
}

module.exports = sum;
