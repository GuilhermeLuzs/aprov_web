import { isCnpjTaken, isEmailTaken, type CompanyRegistration } from '../../../store/session';
import type { Category, CompanySize, Modality } from '../../../types';
import {
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidPassword,
  isValidPhone,
} from '../../../utils/validation';

export type SignUpForm = {
  cnpj: string;
  name: string;
  address: string;
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
export const EMAIL_TAKEN = 'Este e-mail já tem uma conta na APROV.';

export const emptyForm: SignUpForm = {
  cnpj: '',
  name: '',
  address: '',
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
  else if (isCnpjTaken(form.cnpj)) errors.cnpj = CNPJ_TAKEN;
  if (!filled(form.name)) errors.name = 'Informe o nome da empresa.';
  if (!filled(form.address)) errors.address = 'Informe o endereço.';
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
  else if (isEmailTaken(form.responsibleEmail)) errors.responsibleEmail = EMAIL_TAKEN;
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

export function toRegistration(form: SignUpForm): CompanyRegistration | null {
  if (!form.category || !form.modality || !form.size) return null;
  return {
    cnpj: form.cnpj,
    name: form.name.trim(),
    address: form.address.trim(),
    email: form.email.trim(),
    phone: form.phone,
    category: form.category,
    modality: form.modality,
    size: form.size,
    responsible: {
      name: form.responsibleName.trim(),
      cpf: form.responsibleCpf,
      email: form.responsibleEmail.trim(),
      phone: form.responsiblePhone,
    },
    password: form.password,
  };
}
