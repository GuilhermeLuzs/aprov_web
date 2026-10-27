import { useCallback, useState, type ReactNode, type SubmitEvent } from 'react';
import { Check, Copy, Download, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button, IconButton, Modal, TextField } from '../../../components';
import { couponTemplate } from '../../../mocks';
import { regenerateApiKey, saveWebhookUrl, useIntegrationSettings } from '../../../store/integrations';
import { useCurrentAccount } from '../../../store/session';
import { icon } from '../../../theme';
import { isValidHttpsUrl } from '../../../utils/validation';
import { showToast } from '../../../store/toasts';

const COPIED_MS = 2000;
const REVOKE_DELAY_MS = 1000;

const STEPS = [
  'Baixe o modelo e importe no N8N, um programa gratuito de automação (menu Workflows, Import from file).',
  'No passo "Criar cupom na sua plataforma", troque o endereço pelo da sua plataforma de cupons.',
  'No passo "Devolver o cupom para a APROV", cole a sua chave de API.',
  'Ative o fluxo e cole aqui embaixo o endereço do webhook que o N8N mostrar.',
];

const ROUTES = [
  {
    method: 'GET',
    path: '/v1/clientes/{clienteId}/saldo',
    description: 'Consulta quantas moedas da sua empresa o cliente tem.',
    example: '{ "clienteId": "u3", "saldo": 120 }',
  },
  {
    method: 'POST',
    path: '/v1/clientes/{clienteId}/debitos',
    description: 'Debita moedas do cliente. Recusa se o saldo não for suficiente.',
    example: '{ "moedas": 50 }  →  { "saldo": 70 }',
  },
  {
    method: 'POST',
    path: '/v1/resgates/{resgateId}/cupom',
    description: 'Devolve o cupom gerado para um resgate pendente; o cliente vê o código no app.',
    example: '{ "codigo": "VOMARLENE10", "descricao": "10% na lasanha", "validade": "2026-12-31" }',
  },
];

function Card({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="flex min-w-zero flex-col gap-md rounded-card border border-border bg-surface p-lg">
      <div className="flex flex-col gap-xs">
        <h2 className="font-display font-semibold text-subtitle text-ink">{title}</h2>
        <p className="text-caption text-ink-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function downloadTemplate() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(couponTemplate, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'aprov-gerar-cupom-no-resgate.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

function masked(key: string): string {
  return `${key.slice(0, 11)}${'•'.repeat(Math.max(0, key.length - 15))}${key.slice(-4)}`;
}

export function AdvancedIntegration() {
  const account = useCurrentAccount();
  const companyId = account?.companyId ?? '';
  const settings = useIntegrationSettings(companyId);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [webhook, setWebhook] = useState(settings.webhookUrl);
  const [webhookError, setWebhookError] = useState<string>();
  const closeConfirm = useCallback(() => setConfirming(false), []);

  const copyKey = async () => {
    await navigator.clipboard.writeText(settings.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_MS);
  };

  const generate = () => {
    regenerateApiKey(companyId);
    setConfirming(false);
    setRevealed(true);
    showToast('success', 'Chave nova gerada. A anterior parou de funcionar.');
  };

  const saveWebhook = (event: SubmitEvent) => {
    event.preventDefault();
    if (!isValidHttpsUrl(webhook)) {
      setWebhookError('Cole um endereço que comece com https://.');
      showToast('error', 'Não deu para salvar o endereço.');
      return;
    }
    setWebhookError(undefined);
    saveWebhookUrl(companyId, webhook.trim());
    showToast('success', 'Endereço salvo.');
  };

  return (
    <div className="flex flex-col gap-lg">
      <div className="grid items-start gap-lg xl:grid-cols-2">
        <div className="flex min-w-zero flex-col gap-lg">
          <Card
            title="Gerar o código na hora do resgate"
            description="Quando o cliente resgata, o N8N (um programa gratuito de automação) cria o cupom na sua loja virtual e devolve o código para ele no app."
          >
            <ol className="flex flex-col gap-sm">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-md">
                  <span className="flex h-avatar-sm w-avatar-sm shrink-0 items-center justify-center rounded-pill bg-primary-dim font-semibold text-caption text-primary">
                    {index + 1}
                  </span>
                  <span className="text-ink">{step}</span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex h-control w-max items-center gap-sm rounded-pill bg-primary px-xl font-semibold text-surface hover:bg-primary-press"
            >
              <Download size={icon.size.md} strokeWidth={icon.strokeWidth} aria-hidden />
              Baixar modelo (JSON)
            </button>
          </Card>

          <Card title="Chave de API" description="É ela que deixa o seu N8N falar com a APROV. Não compartilhe.">
            <div className="flex items-center gap-xs rounded-control border border-border bg-surface-alt pl-md">
              <code className="sensitive min-w-zero flex-1 truncate font-mono text-caption text-ink">
                {revealed ? settings.apiKey : masked(settings.apiKey)}
              </code>
              <IconButton
                Icon={revealed ? EyeOff : Eye}
                label={revealed ? 'Esconder a chave' : 'Mostrar a chave'}
                onClick={() => setRevealed((v) => !v)}
              />
              <IconButton Icon={copied ? Check : Copy} label={copied ? 'Chave copiada' : 'Copiar a chave'} onClick={copyKey} />
            </div>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex w-max items-center gap-sm font-semibold text-caption text-primary hover:text-primary-press"
            >
              <RefreshCw size={icon.size.sm} strokeWidth={icon.strokeWidth} aria-hidden />
              Gerar nova chave
            </button>
          </Card>

          <Card
            title="Endereço do fluxo"
            description="A APROV chama este endereço toda vez que um cliente resgata moedas da sua empresa."
          >
            <form onSubmit={saveWebhook} noValidate className="flex flex-col gap-md">
              <TextField
                label="URL do webhook do N8N"
                value={webhook}
                sensitive
                onChange={setWebhook}
                placeholder="https://seu-n8n.com/webhook/aprov-resgate"
                error={webhookError}
              />
              <div>
                <Button label="Salvar endereço" type="submit" disabled={webhook.trim() === settings.webhookUrl} />
              </div>
            </form>
          </Card>
        </div>

        <Card
          title="Rotas da API"
          description="O que o modelo usa por baixo. Toda chamada leva a chave no cabeçalho Authorization: Bearer."
        >
          <ul className="flex flex-col">
            {ROUTES.map((route) => (
              <li
                key={route.path}
                className="flex flex-col gap-sm border-b border-border py-md first:pt-zero last:border-b-0 last:pb-zero"
              >
                <div className="flex flex-wrap items-center gap-sm">
                  <span className="rounded-pill bg-primary-dim px-sm py-xs font-mono font-semibold text-micro text-primary">
                    {route.method}
                  </span>
                  <code className="min-w-zero break-all font-mono text-caption text-ink">{route.path}</code>
                </div>
                <p className="text-caption text-ink-muted">{route.description}</p>
                <pre className="overflow-x-auto rounded-control bg-surface-alt p-md font-mono text-micro text-ink">
                  {route.example}
                </pre>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal
        open={confirming}
        onClose={closeConfirm}
        title="Gerar uma nova chave?"
        size="sm"
        footer={
          <>
            <Button label="Cancelar" variant="text" onClick={closeConfirm} />
            <Button label="Gerar nova chave" onClick={generate} />
          </>
        }
      >
        <p className="text-ink">A chave atual para de funcionar na hora. Você vai precisar colar a nova no seu N8N.</p>
      </Modal>
    </div>
  );
}
