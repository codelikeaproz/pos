import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { ConsignmentAccountForm, type AccountErrors } from '../features/consignmentAccounts/ConsignmentAccountForm'
import { ConsignmentAccountTable } from '../features/consignmentAccounts/ConsignmentAccountTable'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createConsignmentAccount, deleteConsignmentAccount, loadConsignmentAccountOptions, loadConsignmentAccounts, updateConsignmentAccount } from '../services/consignmentAccountService'
import type { ConsignmentAccount, ConsignmentAccountInput, ConsignmentAccountList, ConsignmentAccountOptions } from '../types/consignmentAccount'
import './consignment-accounts-page.css'
import { SearchField } from '../components/ui/SearchField'
import { Pagination } from '../components/ui/Pagination'

const EMPTY:ConsignmentAccountList={accounts:[],currentPage:1,lastPage:1,total:0}; const EMPTY_OPTIONS:ConsignmentAccountOptions={stations:[],consignees:[]}
const errorsFrom=(e:unknown):AccountErrors=>e instanceof ApiError?{name:e.errors.name?.[0],email:e.errors.email?.[0],station_id:e.errors.station_id?.[0],consignee_id:e.errors.consignee_id?.[0],password:e.errors.password?.[0]}:{}

export function ConsignmentsPage() {
  const navigate=useNavigate(); const {showToast}=useToast(); const [list,setList]=useState(EMPTY); const [options,setOptions]=useState(EMPTY_OPTIONS); const [searchInput,setSearchInput]=useState(''); const [search,setSearch]=useState(''); const [page,setPage]=useState(1); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null); const [dialog,setDialog]=useState<{mode:'create'}|{mode:'edit';account:ConsignmentAccount}|null>(null); const [target,setTarget]=useState<ConsignmentAccount|null>(null); const [submitting,setSubmitting]=useState(false); const [formError,setFormError]=useState<string|null>(null); const [fieldErrors,setFieldErrors]=useState<AccountErrors>({})
  const refresh=useCallback(async(signal?:AbortSignal)=>{setLoading(true);setError(null);try{setList(await loadConsignmentAccounts(search,page,signal))}catch(e){if(!signal?.aborted)setError(getUserFacingApiMessage(e))}finally{if(!signal?.aborted)setLoading(false)}},[search,page])
  useEffect(()=>{const id=setTimeout(()=>{setPage(1);setSearch(searchInput.trim())},350);return()=>clearTimeout(id)},[searchInput]); useEffect(()=>{const c=new AbortController();void refresh(c.signal);return()=>c.abort()},[refresh]); useEffect(()=>{loadConsignmentAccountOptions().then(setOptions).catch(e=>setError(getUserFacingApiMessage(e)))},[])
  async function save(input:ConsignmentAccountInput){if(!dialog)return;setSubmitting(true);setFormError(null);setFieldErrors({});try{const response=dialog.mode==='create'?await createConsignmentAccount(input):await updateConsignmentAccount(dialog.account.id,input);setDialog(null);showToast(response.message);await refresh()}catch(e){setFieldErrors(errorsFrom(e));setFormError(getUserFacingApiMessage(e))}finally{setSubmitting(false)}}
  async function remove(){if(!target)return;setSubmitting(true);try{const response=await deleteConsignmentAccount(target.id);setTarget(null);showToast(response.message);await refresh()}catch(e){setFormError(getUserFacingApiMessage(e))}finally{setSubmitting(false)}}
  const editing=dialog?.mode==='edit'?dialog.account:undefined; const formId=editing?`edit-account-${editing.id}`:'add-account'
  return <section className="page account-page"><header className="page__header account-page__header"><div><h1 className="page__title">Consignment Account Management</h1><p className="page__description">Manage accounts associated with Stations and Consignees.</p></div><div className="account-page__header-actions"><Button variant="outline" onClick={()=>navigate('/consignees')} icon={<AppIcons.add size={iconSize}/>}>Add Consignee</Button><Button onClick={()=>setDialog({mode:'create'})} icon={<AppIcons.add size={iconSize}/>}>Add Account</Button></div></header>
  <SearchField value={searchInput} onChange={setSearchInput} onClear={()=>{setSearchInput('');setSearch('');setPage(1)}} placeholder="Search accounts..." label="Search accounts" />
  {error?<Alert tone="error" title="Accounts could not be loaded">{error}</Alert>:null}{loading?<LoadingState label="Loading accounts…"/>:<><div className="account-summary">{list.total} account{list.total===1?'':'s'}</div><ConsignmentAccountTable accounts={list.accounts} onEdit={a=>setDialog({mode:'edit',account:a})} onDelete={setTarget}/><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Account" onPageChange={setPage} /></>}
  <Modal open={dialog!==null} title={editing?'Edit Consignment Account':'Add Consignment Account'} onClose={()=>!submitting&&setDialog(null)} actions={<Button type="submit" form={formId} disabled={submitting} icon={<AppIcons.save size={iconSize}/>}>{editing?'Save Changes':'Save Account'}</Button>}>{formError?<Alert tone="error" title="Account could not be saved">{formError}</Alert>:null}{dialog?<ConsignmentAccountForm key={formId} formId={formId} account={editing} options={options} errors={fieldErrors} disabled={submitting} onSubmit={input=>void save(input)}/>:null}</Modal>
  <Modal open={target!==null} title="Delete Consignment Account?" onClose={()=>!submitting&&setTarget(null)} actions={<Button variant="danger" onClick={()=>void remove()} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke}/>}>Delete Account</Button>}><div className="account-delete"><AppIcons.warning size={24}/><div><p>Are you sure you want to delete <strong>“{target?.name}”</strong>?</p><p>This account will no longer be able to access the system.</p></div></div></Modal></section>
}
