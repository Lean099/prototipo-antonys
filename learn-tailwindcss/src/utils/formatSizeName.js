const formatSizeName = (sizeName) => {
  const sizeNames = {
    simple: 'Simple',
    doble: 'Doble',
    triple: 'Triple',
    cuadruple: 'Cuádruple',
  };

  return sizeNames[sizeName] ?? sizeName;
};

export default formatSizeName;
