import './page.css'

export type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{title}</h1>
        <p className="page__description">{description}</p>
      </header>
      <p className="page__note">Placeholder only — business features arrive in later phases.</p>
    </div>
  )
}
