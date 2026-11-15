import type { CompanyRegistrationPayload } from '../../../api';
import { MODALITY_TO_API, SIZE_TO_API } from '../../../store/session';
import type { Category, CompanySize, Modality } from '../../../types';
import {
  isValidCep,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  onlyDigits,
} from '../../../utils/validation';

export type SignUpForm = {
  cnpj: string;
  name: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  category: Category | '';
  modality: Modality | '';
  size: CompanySize | '';
  responsibleName: string;
  responsibleCpf: string;
  responsibleEmail: string;
  responsiblePhone: string;
  password: string;
  passwordConfirmation: string;
};

export type FormErrors = Partial<Record<keyof SignUpForm, string>>;

export const STEP_LABELS = ['Empresa', 'Responsável', 'Senha'];

export const CNPJ_TAKEN = 'Já existe cadastro para este CNPJ.';

const COMPANY_FIELDS: (keyof SignUpForm)[] = [
  'cnpj', 'name', 'zipCode', 'street', 'number', 'complement', 'district', 'city', 'state',
  'email', 'phone', 'category', 'modality', 'size',
];

const RESPONSIBLE_FIELDS: (keyof SignUpForm)[] = ['responsibleName', 'responsibleCpf', 'responsibleEmail', 'responsiblePhone'];

const SERVER_FIELD: Record<string, keyof SignUpForm> = { niche: 'category' };

export const emptyForm: SignUpForm = {
  cnpj: '',
  name: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
  email: '',
  phone: '',
  category: '',
  modality: '',
  size: '',
  responsibleName: '',
  responsibleCpf: '',
  responsibleEmail: '',
  responsiblePhone: '',
  password: '',
  passwordConfirmation: '',
};

function filled(text: string) {
  return text.trim() !== '';
}

function companyErrors(form: SignUpForm): FormErrors {
  const errors: FormErrors = {};
  if (!filled(form.cnpj)) errors.cnpj = 'Informe o CNPJ.';
  else if (!isValidCnpj(form.cnpj)) errors.cnpj = 'CNPJ inválido. Confira os números.';
  if (!filled(form.name)) errors.name = 'Informe o nome da empresa.';
  if (!isValidCep(form.zipCode)) errors.zipCode = 'Informe um CEP com 8 números.';
  if (!filled(form.street)) errors.street = 'Informe a rua.';
  if (!filled(form.number)) errors.number = 'Informe o número.';
  if (!filled(form.district)) errors.district = 'Informe o bairro.';
  if (!filled(form.city)) errors.city = 'Informe a cidade.';
  if (form.state.trim().length !== 2) errors.state = 'Informe a UF.';
  if (!isValidEmail(form.email)) errors.email = 'Informe um e-mail válido.';
  if (!isValidPhone(form.phone)) errors.phone = 'Informe um telefone com DDD.';
  if (!form.category) errors.category = 'Escolha o nicho.';
  if (!form.modality) errors.modality = 'Escolha a modalidade.';
  if (!form.size) errors.size = 'Escolha o porte.';
  return errors;
}

function responsibleErrors(form: SignUpForm): FormErrors {
  const errors: FormErrors = {};
  if (!filled(form.responsibleName)) errors.responsibleName = 'Informe o nome do responsável.';
  if (!isValidCpf(form.responsibleCpf)) errors.responsibleCpf = 'CPF inválido. Confira os números.';
  if (!isValidEmail(form.responsibleEmail)) errors.responsibleEmail = 'Informe um e-mail válido.';
  if (!isValidPhone(form.responsiblePhone)) errors.responsiblePhone = 'Informe um telefone com DDD.';
  return errors;
}

function passwordErrors(form: SignUpForm): FormErrors {
  const errors: FormErrors = {};
  if (!isValidPassword(form.password)) {
    errors.password = 'A senha precisa ter 8 ou mais caracteres, com letra e número.';
  }
  if (form.passwordConfirmation !== form.password) {
    errors.passwordConfirmation = 'As senhas não são iguais.';
  }
  return errors;
}

export function stepErrors(step: number, form: SignUpForm): FormErrors {
  if (step === 1) return companyErrors(form);
  if (step === 2) return responsibleErrors(form);
  return passwordErrors(form);
}

export function toPayload(form: SignUpForm): CompanyRegistrationPayload | null {
  if (!form.category || !form.modality || !form.size) return null;
  return {
    cnpj: onlyDigits(form.cnpj),
    name: form.name.trim(),
    email: form.email.trim(),
    phone: onlyDigits(form.phone),
    zipCode: onlyDigits(form.zipCode),
    street: form.street.trim(),
    number: form.number.trim(),
    complement: form.complement.trim(),
    district: form.district.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    niche: form.category,
    modality: MODALITY_TO_API[form.modality],
    size: SIZE_TO_API[form.size],
    responsibleName: form.responsibleName.trim(),
    responsibleCpf: onlyDigits(form.responsibleCpf),
    responsibleEmail: form.responsibleEmail.trim(),
    responsiblePhone: onlyDigits(form.responsiblePhone),
    password: form.password,
  };
}

export function formErrorsFromServer(errors: Record<string, string>): FormErrors {
  const found: FormErrors = {};
  Object.entries(errors).forEach(([field, message]) => {
    const key = SERVER_FIELD[field] ?? (field as keyof SignUpForm);
    if (key in emptyForm) found[key] = message;
  });
  return found;
}

export function stepOfErrors(errors: FormErrors): number {
  const fields = Object.keys(errors) as (keyof SignUpForm)[];
  if (fields.some((field) => COMPANY_FIELDS.includes(field))) return 1;
  if (fields.some((field) => RESPONSIBLE_FIELDS.includes(field))) return 2;
  return 3;
}
