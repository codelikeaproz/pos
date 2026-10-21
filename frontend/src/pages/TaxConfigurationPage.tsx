import { FormEvent, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Panel } from '../components/ui/Panel'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { loadTaxSetting, updateTaxSetting } from '../services/taxSettingService'
import './tax-configuration-page.css'

export function TaxConfigurationPage() {
  const { showToast } = useToast()
  const [vatRate, setVatRate] = useState('')
  const [vatCalculationActive, setVatCalculationActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateError, setRateError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void loadTaxSetting(controller.signal).then(setting => { setVatRate(setting.vatRate); setVatCalculationActive(setting.vatCalculationActive) }).catch(reason => {
      if (!controller.signal.aborted) setError(getUserFacingApiMessage(reason))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  async function save(event: FormEvent): Promise<void> {
    event.preventDefault(); setSaving(true); setError(null); setRateError(null)
    try {
      const result = await updateTaxSetting(vatRate.trim())
      setVatRate(result.taxSetting.vatRate); setVatCalculationActive(result.taxSetting.vatCalculationActive); showToast(result.message)
    } catch (reason) {
      setError(getUserFacingApiMessage(reason))
      if (reason instanceof ApiError) setRateError(reason.errors.vatRate?.[0] ?? null)
    } finally { setSaving(false) }
  }

  return <section className="page tax-configuration-page">
    <header className="page__header"><div><h1 className="page__title">Tax Configuration</h1><p className="page__description">Manage the current business tax status and reference VAT rate.</p></div></header>
    {loading ? <LoadingState label="Loading Tax Configuration…" /> : <Panel title="Current Configuration">
      <form className="tax-configuration-form" onSubmit={event => void save(event)}>
        <div className="page__field"><Label htmlFor="tax-status">Tax Status</Label><select id="tax-status" className="ui-input" value="NON_VAT" disabled><option value="NON_VAT">Non-VAT</option><option value="VAT_REGISTERED" disabled>VAT Registered — Future Support</option></select></div>
        <div className="page__field"><Label htmlFor="vat-rate" required>VAT Rate</Label><div className="tax-configuration-form__rate"><Input id="vat-rate" type="number" inputMode="decimal" min="0" max="100" step="0.01" value={vatRate} onChange={event => { setVatRate(event.target.value); setRateError(null) }} disabled={saving} error={Boolean(rateError)} required /><span>%</span></div>{rateError ? <span className="page__field-error">{rateError}</span> : null}</div>
        <div className="tax-configuration-form__status"><span>VAT Calculation</span><strong className={`tax-configuration-form__status-value tax-configuration-form__status-value--${vatCalculationActive ? 'active' : 'inactive'}`}>{vatCalculationActive ? 'ACTIVE' : 'INACTIVE'}</strong></div>
        <p className="page__note">VAT is not applied to sales while the system is configured as Non-VAT.</p>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Button type="submit" disabled={saving} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>{saving ? 'Saving…' : 'Save'}</Button>
      </form>
    </Panel>}
  </section>
}
