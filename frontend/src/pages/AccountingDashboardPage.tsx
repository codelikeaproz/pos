import { useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadAccountingDashboard, type AccountingSummary } from '../services/accountingDashboardService'
import './dashboard-page.css'

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

export function AccountingDashboardPage() {
  const [summary, setSummary] = useState<AccountingSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void loadAccountingDashboard(controller.signal).then((data) => setSummary(data.summary)).catch((failure) => { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) })
    return () => controller.abort()
  }, [])

  if (error) return <section className="page"><Alert tone="error">{error}</Alert></section>
  if (!summary) return <section className="page"><LoadingState label="Loading Accounting Dashboard…" /></section>

  const cards = [
    ['Total Credit Sales', money.format(Number(summary.totalCreditSales))],
    ['Unpaid Credit', money.format(Number(summary.unpaidCredit))],
    ['Partially Paid Credit', money.format(Number(summary.partiallyPaidCredit))],
    ['Paid Credit', summary.paidCredit],
    ['Collections Today', money.format(Number(summary.collectionsToday))],
    ['Collections This Month', money.format(Number(summary.collectionsThisMonth))],
    ['Total Active Customers', summary.totalCustomers],
    ['Customers With Outstanding Balance', summary.customersWithOutstandingBalance]
  ]

  return <section className="page dashboard-page">
    <header className="page__header"><div><h1 className="page__title">Accounting Dashboard</h1><p className="page__description">Credit, collection, and Customer overview.</p></div></header>
    <div className="dashboard-page__kpis">{cards.map(([label, value]) => <article key={label} className="dashboard-page__kpi"><span className="dashboard-page__kpi-label">{label}</span><strong>{value}</strong></article>)}</div>
  </section>
}
