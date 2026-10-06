import { Button } from './Button'
import './pagination.css'

export type AdminPageSize = 10 | 20 | 50 | 100

type Props = {
  currentPage: number
  lastPage: number
  label: string
  onPageChange: (page: number) => void
  pageSize?: AdminPageSize
  onPageSizeChange?: (pageSize: AdminPageSize) => void
}

export function Pagination({ currentPage, lastPage, label, onPageChange, pageSize, onPageSizeChange }: Props) {
  if (lastPage <= 1 && !onPageSizeChange) return null
  return (
    <nav className="ui-pagination" aria-label={`${label} pages`}>
      {onPageSizeChange && pageSize ? <label className="ui-pagination__size">Rows per page<select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value) as AdminPageSize)} aria-label={`${label} rows per page`}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label> : null}
      <span className="ui-pagination__controls"><Button variant="outline" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Previous</Button><span>Page {currentPage} of {lastPage}</span><Button variant="outline" disabled={currentPage >= lastPage} onClick={() => onPageChange(currentPage + 1)}>Next</Button></span>
    </nav>
  )
}
