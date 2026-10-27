import type { IntegrationSettings } from '../types';

export const integrationSettings: IntegrationSettings[] = [
  {
    companyId: 'c2',
    couponSource: 'manual',
    apiKey: 'aprov_live_4f9c2e1a7b8d3f60c5e2a9d1b7f43c8e',
    webhookUrl: 'https://n8n.cozinhadavomarlene.com.br/webhook/aprov-resgate',
  },
];

export const couponTemplate = {
  name: 'APROV - Gerar cupom no resgate',
  nodes: [
    {
      id: 'resgate',
      name: 'Resgate na APROV',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [0, 0],
      parameters: { httpMethod: 'POST', path: 'aprov-resgate', responseMode: 'onReceived' },
    },
    {
      id: 'cupom',
      name: 'Criar cupom na sua plataforma',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [260, 0],
      parameters: {
        method: 'POST',
        url: 'https://SUA-PLATAFORMA-DE-CUPONS/api/cupons',
        sendBody: true,
        jsonBody: '={ "valor": {{ $json.body.valorEmReais }}, "cliente": "{{ $json.body.clienteId }}" }',
      },
    },
    {
      id: 'devolver',
      name: 'Devolver o cupom para a APROV',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4,
      position: [520, 0],
      parameters: {
        method: 'POST',
        url: '=https://api.aprov.com.br/v1/resgates/{{ $("Resgate na APROV").item.json.body.resgateId }}/cupom',
        sendHeaders: true,
        headerParameters: { parameters: [{ name: 'Authorization', value: 'Bearer SUA_CHAVE_DA_APROV' }] },
        sendBody: true,
        jsonBody: '={ "codigo": "{{ $json.codigo }}", "descricao": "{{ $json.descricao }}", "validade": "{{ $json.validade }}" }',
      },
    },
  ],
  connections: {
    'Resgate na APROV': { main: [[{ node: 'Criar cupom na sua plataforma', type: 'main', index: 0 }]] },
    'Criar cupom na sua plataforma': { main: [[{ node: 'Devolver o cupom para a APROV', type: 'main', index: 0 }]] },
  },
};
