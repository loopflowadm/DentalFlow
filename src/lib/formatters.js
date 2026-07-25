/**
 * Utilitários de Formatação e Mascaramento de Dados LGPD
 */

// Formatar Telefone/WhatsApp: (83) 99999-8888 ou (83) 9999-8888
export const formatPhone = (val) => {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

// Formatar CPF: 000.000.000-00
export const formatCPF = (val) => {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

// Formatar RG: 00.000.000-0
export const formatRG = (val) => {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8, 9)}`;
};

// Mascarar CPF para proteção LGPD (ex: 123.***.***-45)
export const maskCPF = (val) => {
  const formatted = formatCPF(val);
  if (!formatted || formatted.length < 14) return formatted;
  return `${formatted.slice(0, 4)}***.***${formatted.slice(11)}`;
};

// Mascarar Telefone para proteção LGPD (ex: (83) *****-6655)
export const maskPhone = (val) => {
  const formatted = formatPhone(val);
  if (!formatted || formatted.length < 14) return formatted;
  return `${formatted.slice(0, 5)} *****-${formatted.slice(-4)}`;
};

// Mascarar E-mail para proteção LGPD (ex: a***o@gmail.com)
export const maskEmail = (val) => {
  if (!val || !val.includes('@')) return val;
  const [user, domain] = val.split('@');
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
};
