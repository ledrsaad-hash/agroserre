import { useTranslation } from 'react-i18next'
import { formatMAD, formatKg } from '@/utils/formatters'
import type { VenteCalculee } from '@/types/vente'

interface VenteCalculsProps {
  calculs: VenteCalculee
}

export function VenteCalculs({ calculs }: VenteCalculsProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-primary-50 rounded-2xl p-4 space-y-3">
      <p className="font-bold text-primary-800 text-sm">{t('vente.calculs')}</p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label={t('vente.tonnageBrut')}   value={formatKg(calculs.tonnageBrut)} />
        <Row label={t('vente.tonnageNet')}     value={formatKg(calculs.tonnageNet)} bold />
        <Row label={t('vente.totalBrut')}      value={formatMAD(calculs.totalBrut)} />
        <Row label={t('vente.totalNet')}       value={formatMAD(calculs.totalNet)} bold />
        <Row label={t('vente.chargesVariables')}  value={formatMAD(calculs.chargesVariables)} red />
        {calculs.chargesFixesTotal > 0 && (
          <Row label={t('vente.chargesFixesTotal')} value={formatMAD(calculs.chargesFixesTotal)} red />
        )}
        <Row label={t('vente.coutVente')}      value={formatMAD(calculs.coutVenteTotal)} red bold />
        <Row label={t('vente.poidsMoyen')}     value={formatKg(calculs.poidsMoyenParRegime)} />
      </div>

      <div className="border-t-2 border-primary-200 pt-3 mt-1">
        <div className="flex justify-between items-center">
          <span className="font-bold text-primary-900 text-sm">{t('vente.revenusNetFinal')}</span>
          <span className={`text-xl font-extrabold ${calculs.revenusNetFinal >= 0 ? 'text-primary-700' : 'text-red-600'}`}>
            {formatMAD(calculs.revenusNetFinal)}
          </span>
        </div>
        <p className="text-xs text-primary-500 mt-0.5">{t('vente.revenusNetFinalHint')}</p>
      </div>
    </div>
  )
}

function Row({ label, value, bold, red }: { label: string; value: string; bold?: boolean; red?: boolean }) {
  return (
    <>
      <span className="text-gray-500">{label}</span>
      <span className={`text-end ${bold ? 'font-bold' : 'font-medium'} ${red ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </>
  )
}
