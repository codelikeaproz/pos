import { Button } from './Button'
import './pagination.css'

type Props = {
  currentPage: number
  lastPage: number
  label: string
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, lastPage, label, onPageChange }: Props) {
  if (lastPage <= 1) return null
  return (
    <nav className="ui-pagination" aria-label={`${label} pages`}>
      <Button variant="outline" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Previous</Button>
      <span>Page {currentPage} of {lastPage}</span>
      <Button variant="outline" disabled={currentPage >= lastPage} onClick={() => onPageChange(currentPage + 1)}>Next</Button>
    </nav>
  )
}
