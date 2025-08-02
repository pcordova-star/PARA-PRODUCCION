// Inspired by https://gist.github.com/rotvulpix/69a24cc199a4253d058c
export const validateRut = (rut: string): boolean => {
  if (!/^[0-9]{1,2}(?:\.[0-9]{3}){2}-?[0-9kK]$/.test(rut)) {
    return false;
  }

  const cleanRut = rut.replace(/[.-]/g, '');
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toLowerCase();

  let sum = 0;
  let multiple = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiple;
    if (multiple < 7) {
      multiple += 1;
    } else {
      multiple = 2;
    }
  }

  const dvExpected = 11 - (sum % 11);

  if (dvExpected === 11) {
    return dv === '0';
  }
  if (dvExpected === 10) {
    return dv === 'k';
  }
  return dv === dvExpected.toString();
};

export const formatRut = (rut: string): string => {
  let cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (!cleanRut) return "";
  
  let body = cleanRut.slice(0, -1);
  let dv = cleanRut.slice(-1);

  let formattedBody = "";
  for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) {
      formattedBody = "." + formattedBody;
    }
    formattedBody = body[i] + formattedBody;
  }
  
  return formattedBody + "-" + dv;
};
