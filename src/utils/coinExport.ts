import type { RewardTopic } from '../types';
import type { DayCoins, TopicTotal } from './coinEarnings';

type ExportInput = {
  coinName: string;
  weekly: boolean;
  rows: DayCoins[];
  topics: TopicTotal[];
  topicLabel: (topic: RewardTopic) => string;
  valueInReais: number;
};

const DATE_FORMAT = 'dd/mm/yyyy';
const MONEY_FORMAT = '"R$" #,##0.00';
const MIN_WIDTH = 10;
const PADDING = 2;
const MONEY_PREFIX = 'R$ ';

function toDate(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

export async function earningsWorkbook({ coinName, weekly, rows, topics, topicLabel, valueInReais }: ExportInput): Promise<Blob> {
  const { Workbook } = await import('exceljs');
  const workbook = new Workbook();

  const byDay = workbook.addWorksheet(weekly ? 'Por semana' : 'Por dia');
  byDay.columns = [
    { header: weekly ? 'Semana de' : 'Dia', key: 'day', style: { numFmt: DATE_FORMAT } },
    { header: 'Avaliações', key: 'reviews' },
    { header: `${coinName} ganhas`, key: 'earned' },
    { header: 'Valor ganho', key: 'earnedReais', style: { numFmt: MONEY_FORMAT } },
    { header: 'Cupons resgatados', key: 'coupons' },
    { header: `${coinName} resgatadas`, key: 'redeemed' },
    { header: 'Valor resgatado', key: 'redeemedReais', style: { numFmt: MONEY_FORMAT } },
  ];
  rows.forEach((row) =>
    byDay.addRow({
      day: toDate(row.day),
      reviews: row.reviews,
      earned: row.earned,
      earnedReais: row.earned * valueInReais,
      coupons: row.coupons,
      redeemed: row.redeemed,
      redeemedReais: row.redeemed * valueInReais,
    }),
  );

  const byTopic = workbook.addWorksheet('Por tópico');
  byTopic.columns = [
    { header: 'Tópico', key: 'topic' },
    { header: `${coinName} ganhas`, key: 'coins' },
    { header: 'Valor', key: 'reais', style: { numFmt: MONEY_FORMAT } },
  ];
  topics.forEach((t) => byTopic.addRow({ topic: topicLabel(t.topic), coins: t.coins, reais: t.coins * valueInReais }));

  [byDay, byTopic].forEach((sheet) => {
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.columns.forEach((column, index) => {
      let widest = MIN_WIDTH;
      sheet.eachRow((row) => {
        const value = row.getCell(index + 1).value;
        const length =
          value instanceof Date ? DATE_FORMAT.length : typeof value === 'number' ? value.toFixed(2).length + MONEY_PREFIX.length : String(value ?? '').length;
        widest = Math.max(widest, length);
      });
      column.width = widest + PADDING;
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
