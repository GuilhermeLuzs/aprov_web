import { useState } from 'react';
import { Button, Modal, TextAreaField, TextField } from '../../../components';
import { mockToday } from '../../../mocks';
import { addCouponCodes, addCouponOffer } from '../../../store/coupons';
import type { CouponOffer } from '../../../types';
import { COUPON_TITLE_MAX, parseCodes } from '../../../utils/coupons';
import { plural } from '../../../utils/format';
import { showToast } from '../../../store/toasts';

const CODES_MAX_TEXT = 20000;

type Props = {
  companyId: string;
  coinName: string;
  offer: CouponOffer | null;
  takenCodes: string[];
  onClose: () => void;
};

type Errors = Partial<Record<'title' | 'coinCost' | 'validUntil' | 'codes', string>>;

export function CouponModal({ companyId, coinName, offer, takenCodes, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [coinCost, setCoinCost] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [codesText, setCodesText] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const parsed = parseCodes(codesText, takenCodes);
  const skipped = [...parsed.repeated, ...parsed.tooLong];

  const save = () => {
    const found: Errors = {};
    if (!offer) {
      if (!title.trim()) found.title = 'Diga qual é o desconto.';
      const cost = Number(coinCost);
      if (!Number.isInteger(cost) || cost < 1) found.coinCost = 'Use um número inteiro maior que zero.';
      if (!validUntil) found.validUntil = 'Informe até quando o cupom vale.';
      else if (validUntil < mockToday) found.validUntil = 'A validade precisa ser hoje ou depois.';
    }
    if (parsed.codes.length === 0) found.codes = 'Cole pelo menos um código novo.';
    setErrors(found);
    if (Object.keys(found).length > 0) {
      showToast(
        'error',
        offer ? 'Nenhum código adicionado. Confira a lista.' : 'Não deu para criar o cupom. Confira os campos marcados.',
      );
      return;
    }
    const added = plural(parsed.codes.length, 'código', 'códigos');
    const ignored = skipped.length > 0 ? ` ${plural(skipped.length, 'ignorado', 'ignorados')}.` : '';
    if (offer) {
      addCouponCodes(offer.id, parsed.codes);
      showToast(
        'success',
        `${plural(parsed.codes.length, 'código adicionado', 'códigos adicionados')} a "${offer.title}".${ignored}`,
      );
    } else {
      addCouponOffer({
        companyId,
        title: title.trim(),
        coinCost: Number(coinCost),
        validUntil,
        codes: parsed.codes.map((code) => ({ code })),
      });
      showToast('success', `Cupom "${title.trim()}" criado com ${added}.${ignored}`);
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={offer ? `Adicionar códigos: ${offer.title}` : 'Novo cupom'}
      footer={
        <>
          <Button label="Cancelar" variant="text" onClick={onClose} />
          <Button label={offer ? 'Adicionar códigos' : 'Criar cupom'} onClick={save} />
        </>
      }
    >
      {offer ? null : (
        <>
          <TextField
            label="Desconto"
            value={title}
            onChange={(value) => setTitle(value.slice(0, COUPON_TITLE_MAX))}
            placeholder="Ex.: 10% em qualquer pedido"
            counter={`${title.length}/${COUPON_TITLE_MAX}`}
            error={errors.title}
          />
          <div className="grid gap-md sm:grid-cols-2">
            <TextField
              label={`Custo em ${coinName}`}
              value={coinCost}
              onChange={(value) => setCoinCost(value.replace(/\D/g, '').slice(0, 5))}
              inputMode="numeric"
              placeholder="Ex.: 50"
              error={errors.coinCost}
            />
            <TextField label="Vale até" type="date" value={validUntil} onChange={setValidUntil} error={errors.validUntil} />
          </div>
        </>
      )}
      <TextAreaField
        label="Códigos"
        value={codesText}
        onChange={(value) => setCodesText(value.slice(0, CODES_MAX_TEXT))}
        maxLength={CODES_MAX_TEXT}
        rows={6}
        placeholder={'Um código por linha, do jeito que a sua loja aceita. Ex.:\nVOVO-A1B2\nVOVO-C3D4'}
        error={errors.codes}
      />
      <p className="text-caption text-ink-muted">
        {parsed.codes.length > 0 ? `${plural(parsed.codes.length, 'código novo', 'códigos novos')}. ` : ''}
        {skipped.length > 0
          ? `${plural(skipped.length, 'código ignorado', 'códigos ignorados')} por já existirem num cupom seu ou passarem de 30 caracteres.`
          : ''}
        {parsed.codes.length === 0 && skipped.length === 0
          ? 'Cada cliente que resgatar recebe um código diferente desta lista.'
          : ''}
      </p>
    </Modal>
  );
}
