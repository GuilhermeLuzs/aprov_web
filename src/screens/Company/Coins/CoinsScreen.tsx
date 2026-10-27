import { useCallback, useState } from 'react';
import { Button, EmptyNotice, Modal, Switch, Tabs } from '../../../components';
import { coinSettingsOrDefault, saveCoinSettings, setCoinsEnabled, useCoinSettings } from '../../../store/coins';
import { useCurrentAccount } from '../../../store/session';
import { CoinPerformance } from './CoinPerformance';
import { CoinSettingsForm } from './CoinSettingsForm';
import { showToast } from '../../../store/toasts';

type CoinTab = 'performance' | 'settings';

const TABS: { key: CoinTab; label: string }[] = [
  { key: 'performance', label: 'Desempenho' },
  { key: 'settings', label: 'Configuração' },
];

export default function CoinsScreen() {
  const account = useCurrentAccount();
  const companyId = account?.companyId ?? '';
  const settings = coinSettingsOrDefault(companyId, useCoinSettings(companyId));
  const [tab, setTab] = useState<CoinTab>('performance');
  const [confirmingOff, setConfirmingOff] = useState(false);
  const closeConfirm = useCallback(() => setConfirmingOff(false), []);
  const coinName = settings.name || 'moedas';

  const toggle = (next: boolean) => {
    if (next) {
      setCoinsEnabled(companyId, true);
      showToast('success', 'Moedas ligadas. Os clientes voltam a ganhar e resgatar.');
    } else setConfirmingOff(true);
  };

  const turnOff = () => {
    setCoinsEnabled(companyId, false);
    setConfirmingOff(false);
    showToast('success', 'Moedas desligadas.');
  };

  return (
    <div className="flex flex-col gap-lg px-lg py-xl lg:px-xxl">
      <div className="flex items-center justify-between gap-lg">
        <h1 className="font-display font-bold text-display text-ink">Moedas</h1>
        <Switch
          checked={settings.enabled}
          onChange={toggle}
          label={settings.enabled ? 'Moedas ligadas' : 'Moedas desligadas'}
          text={settings.enabled ? 'Ligadas' : 'Desligadas'}
        />
      </div>

      {settings.enabled ? (
        tab === 'performance' ? (
          <div className="flex flex-col gap-lg">
            <Tabs label="Seções de moedas" tabs={TABS} value={tab} onChange={setTab} />
            <CoinPerformance settings={settings} />
          </div>
        ) : (
          <CoinSettingsForm
            key={companyId}
            settings={settings}
            onSave={saveCoinSettings}
            toolbar={<Tabs label="Seções de moedas" tabs={TABS} value={tab} onChange={setTab} />}
          />
        )
      ) : (
        <EmptyNotice
          mood="neutral"
          title="As moedas estão desligadas"
          text={
            settings.name
              ? `Os clientes continuam com o saldo de ${coinName}, mas não ganham moedas novas nem resgatam cupons até você ligar de novo.`
              : 'Ligue para criar a moeda da sua empresa e decidir quanto cada avaliação rende.'
          }
          action={<Button label="Ligar as moedas" onClick={() => toggle(true)} />}
        />
      )}

      <Modal
        open={confirmingOff}
        onClose={closeConfirm}
        title="Desligar as moedas?"
        size="sm"
        footer={
          <>
            <Button label="Cancelar" variant="text" onClick={closeConfirm} />
            <Button label="Desligar" onClick={turnOff} />
          </>
        }
      >
        <p className="text-ink">
          Os clientes continuam com o saldo de <span className="font-semibold">{coinName}</span>, mas param de ganhar moedas
          novas e não conseguem resgatar cupons até você ligar de novo.
        </p>
      </Modal>
    </div>
  );
}
