import { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, CreditCard, FileBarChart,
  FileText, HandCoins, LayoutDashboard, LifeBuoy, LockKeyhole, LogOut, Menu, Plus,
  Search, Settings, ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp, Users, Wallet,
  X, Building2, Clock3, CircleDollarSign, Download, Eye, EyeOff, BadgeCheck, CircleAlert
} from 'lucide-react';

type Screen = 'home' | 'login' | 'register' | 'dashboard';
type Section = 'overview' | 'customers' | 'contracts' | 'receivables' | 'cashflow' | 'reports' | 'settings';
type Customer = { id: string; name: string; email: string; phone: string; status: 'Ativo' | 'Inativo'; createdAt: string };
type Contract = { id: string; customerId: string; customerName: string; principal: number; total: number; installments: number; paid: number; dueDate: string; status: 'Em dia' | 'Atrasado' | 'Quitado'; createdAt: string };
type Payment = { id: string; customerName: string; amount: number; date: string; method: string; status: 'Confirmado' | 'Pendente'; contractId: string };
type DemoUser = { name: string; email: string; company: string };
type ModalKind = 'customer' | 'contract' | 'payment' | null;

const STORE = {
  user: 'credorpay.demo.user.v1',
  customers: 'credorpay.demo.customers.v1',
  contracts: 'credorpay.demo.contracts.v1',
  payments: 'credorpay.demo.payments.v1',
};
const seedCustomers: Customer[] = [
  { id: 'CLI-1042', name: 'Mariana Oliveira', email: 'mariana@email.com', phone: '(11) 98812-4310', status: 'Ativo', createdAt: '2026-10-02' },
  { id: 'CLI-1041', name: 'Rafael Costa', email: 'rafael@email.com', phone: '(11) 97721-8020', status: 'Ativo', createdAt: '2026-09-28' },
  { id: 'CLI-1040', name: 'Fernanda Lima', email: 'fernanda@email.com', phone: '(21) 99142-5531', status: 'Ativo', createdAt: '2026-09-21' },
  { id: 'CLI-1039', name: 'Lucas Martins', email: 'lucas@email.com', phone: '(31) 98810-2004', status: 'Inativo', createdAt: '2026-09-14' },
  { id: 'CLI-1038', name: 'Beatriz Souza', email: 'beatriz@email.com', phone: '(41) 99221-7788', status: 'Ativo', createdAt: '2026-09-09' },
];
const seedContracts: Contract[] = [
  { id: 'CTR-2026-0142', customerId: 'CLI-1042', customerName: 'Mariana Oliveira', principal: 12000, total: 14400, installments: 12, paid: 7, dueDate: '2026-10-24', status: 'Em dia', createdAt: '2026-04-24' },
  { id: 'CTR-2026-0141', customerId: 'CLI-1041', customerName: 'Rafael Costa', principal: 8000, total: 9600, installments: 12, paid: 4, dueDate: '2026-10-18', status: 'Atrasado', createdAt: '2026-06-18' },
  { id: 'CTR-2026-0138', customerId: 'CLI-1040', customerName: 'Fernanda Lima', principal: 5000, total: 5600, installments: 8, paid: 8, dueDate: '2026-10-05', status: 'Quitado', createdAt: '2026-02-05' },
  { id: 'CTR-2026-0136', customerId: 'CLI-1038', customerName: 'Beatriz Souza', principal: 15000, total: 18000, installments: 12, paid: 5, dueDate: '2026-10-27', status: 'Em dia', createdAt: '2026-05-27' },
];
const seedPayments: Payment[] = [
  { id: 'REC-00831', customerName: 'Fernanda Lima', amount: 700, date: '2026-10-18', method: 'Pix', status: 'Confirmado', contractId: 'CTR-2026-0138' },
  { id: 'REC-00830', customerName: 'Mariana Oliveira', amount: 1200, date: '2026-10-17', method: 'Transferência', status: 'Confirmado', contractId: 'CTR-2026-0142' },
  { id: 'REC-00829', customerName: 'Beatriz Souza', amount: 1500, date: '2026-10-16', method: 'Pix', status: 'Confirmado', contractId: 'CTR-2026-0136' },
  { id: 'REC-00828', customerName: 'Rafael Costa', amount: 800, date: '2026-10-15', method: 'Dinheiro', status: 'Pendente', contractId: 'CTR-2026-0141' },
];
const navItems: { id: Section; label: string; icon: typeof LayoutDashboard; group: string }[] = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard, group: 'WORKSPACE' },
  { id: 'customers', label: 'Clientes', icon: Users, group: 'WORKSPACE' },
  { id: 'contracts', label: 'Contratos', icon: FileText, group: 'WORKSPACE' },
  { id: 'receivables', label: 'Recebíveis', icon: CalendarDays, group: 'FINANCEIRO' },
  { id: 'cashflow', label: 'Fluxo de caixa', icon: Wallet, group: 'FINANCEIRO' },
  { id: 'reports', label: 'Relatórios', icon: FileBarChart, group: 'GESTÃO' },
  { id: 'settings', label: 'Configurações', icon: Settings, group: 'GESTÃO' },
];

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function saveStore<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* local demo only */ }
}
function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
}
function dateBR(value: string) {
  if (!value) return '—';
  const date = new Date(value + (value.length === 10 ? 'T12:00:00' : ''));
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR').format(date);
}
function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}
function makeId(prefix: string) {
  return prefix + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function Brand({ light = false }: { light?: boolean }) {
  return <div className={`brand ${light ? 'brand-light' : ''}`}><span className="brand-mark"><HandCoins size={19} strokeWidth={2.2} /></span><span>credor<span className="brand-pay">pay</span></span></div>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => readStore<DemoUser | null>(STORE.user, null) ? 'dashboard' : 'home');
  const [section, setSection] = useState<Section>('overview');
  const [user, setUser] = useState<DemoUser | null>(() => readStore<DemoUser | null>(STORE.user, null));
  const [customers, setCustomers] = useState<Customer[]>(() => readStore(STORE.customers, seedCustomers));
  const [contracts, setContracts] = useState<Contract[]>(() => readStore(STORE.contracts, seedContracts));
  const [payments, setPayments] = useState<Payment[]>(() => readStore(STORE.payments, seedPayments));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [auth, setAuth] = useState({ name: '', company: '', email: '', password: '' });

  useEffect(() => saveStore(STORE.customers, customers), [customers]);
  useEffect(() => saveStore(STORE.contracts, contracts), [contracts]);
  useEffect(() => saveStore(STORE.payments, payments), [payments]);
  useEffect(() => { if (user) saveStore(STORE.user, user); else localStorage.removeItem(STORE.user); }, [user]);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 3200);
    return () => window.clearTimeout(id);
  }, [notice]);

  const totals = useMemo(() => {
    const active = contracts.filter(item => item.status !== 'Quitado');
    const principal = active.reduce((sum, item) => sum + item.principal, 0);
    const outstanding = active.reduce((sum, item) => sum + Math.max(0, item.total * (item.installments - item.paid) / item.installments), 0);
    const received = payments.filter(item => item.status === 'Confirmado').reduce((sum, item) => sum + item.amount, 0);
    const overdue = contracts.filter(item => item.status === 'Atrasado').length;
    return { principal, outstanding, received, overdue, active: active.length };
  }, [contracts, payments]);

  function go(next: Screen) {
    setScreen(next); setAuthError('');
    if (next !== 'dashboard') setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function signOut() {
    setUser(null); localStorage.removeItem(STORE.user); setScreen('home'); setSection('overview'); setSidebarOpen(false);
    setNotice('Você saiu da demonstração.');
  }
  function submitAuth(event: React.FormEvent<HTMLFormElement>, mode: 'login' | 'register') {
    event.preventDefault(); setAuthError('');
    const email = auth.email.trim().toLowerCase();
    if (!email || !auth.password.trim()) { setAuthError('Preencha e-mail e senha para continuar.'); return; }
    if (mode === 'register' && (!auth.name.trim() || !auth.company.trim())) { setAuthError('Informe seu nome e o nome da empresa.'); return; }
    const nextUser: DemoUser = {
      name: mode === 'register' ? auth.name.trim() : (auth.name.trim() || email.split('@')[0]),
      email,
      company: mode === 'register' ? auth.company.trim() : (auth.company.trim() || 'Minha organização'),
    };
    setUser(nextUser); saveStore(STORE.user, nextUser); setScreen('dashboard'); setSection('overview');
    setNotice(mode === 'register' ? 'Conta de demonstração criada.' : 'Bem-vindo de volta!');
    setAuth({ name: '', company: '', email: '', password: '' });
  }
  function addCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    if (!name || !email) return;
    setCustomers(prev => [{ id: makeId('CLI'), name, email, phone, status: 'Ativo', createdAt: new Date().toISOString().slice(0, 10) }, ...prev]);
    setModal(null); setNotice('Cliente adicionado à demonstração.');
  }
  function addContract(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const customerId = String(data.get('customerId') || '');
    const customer = customers.find(item => item.id === customerId);
    const principal = Number(data.get('principal'));
    const total = Number(data.get('total'));
    const installments = Number(data.get('installments'));
    const dueDate = String(data.get('dueDate') || '');
    if (!customer || principal <= 0 || total < principal || installments < 1 || !dueDate) return;
    setContracts(prev => [{ id: makeId('CTR'), customerId, customerName: customer.name, principal, total, installments, paid: 0, dueDate, status: 'Em dia', createdAt: new Date().toISOString().slice(0, 10) }, ...prev]);
    setModal(null); setNotice('Contrato de demonstração criado.');
  }
  function addPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const contractId = String(data.get('contractId') || '');
    const contract = contracts.find(item => item.id === contractId);
    const amount = Number(data.get('amount'));
    const method = String(data.get('method') || 'Pix');
    const date = String(data.get('date') || new Date().toISOString().slice(0, 10));
    if (!contract || amount <= 0) return;
    setPayments(prev => [{ id: makeId('REC'), customerName: contract.customerName, amount, date, method, status: 'Confirmado', contractId }, ...prev]);
    setContracts(prev => prev.map(item => item.id === contractId ? { ...item, paid: Math.min(item.installments, item.paid + 1), status: item.paid + 1 >= item.installments ? 'Quitado' : item.status } : item));
    setModal(null); setNotice('Recebimento registrado localmente.');
  }
  function exportCsv() {
    const rows = [['ID', 'Cliente', 'Valor principal', 'Valor total', 'Parcelas', 'Pagas', 'Vencimento', 'Status'], ...contracts.map(c => [c.id, c.customerName, c.principal, c.total, c.installments, c.paid, c.dueDate, c.status])];
    const csv = rows.map(row => row.map(cell => '"' + String(cell).replaceAll('"', '""') + '"').join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'credor-pay-relatorio.csv'; anchor.click(); URL.revokeObjectURL(url);
    setNotice('Relatório CSV exportado.');
  }

  if (screen === 'home') return <Landing onLogin={() => go('login')} onRegister={() => go('register')} />;
  if (screen === 'login' || screen === 'register') {
    const register = screen === 'register';
    return <div className="auth-layout">
      <div className="auth-side">
        <button className="auth-brand-button" onClick={() => go('home')} aria-label="Voltar para a página inicial"><Brand light /></button>
        <div className="auth-pitch">
          <span className="eyebrow light-eyebrow"><Sparkles size={14}/> GESTÃO FINANCEIRA INTELIGENTE</span>
          <h1>Mais clareza para cada decisão.</h1>
          <p>Organize clientes, contratos e recebíveis em uma experiência financeira simples e profissional.</p>
          <div className="auth-proof"><span><ShieldCheck size={17}/> Visão centralizada</span><span><Activity size={17}/> Acompanhamento contínuo</span></div>
          <div className="auth-graphic"><div className="graphic-top"><span>Carteira acompanhada</span><TrendingUp size={18}/></div><strong>R$ 128.450,00</strong><div className="graphic-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="graphic-bottom"><span>Resumo ilustrativo</span><span>+12,8%</span></div></div>
        </div>
        <span className="auth-footer-note">Ambiente de demonstração • Não utilize dados reais</span>
      </div>
      <div className="auth-main">
        <button className="back-link" onClick={() => go('home')}><ChevronLeft size={17}/> Voltar ao início</button>
        <div className="auth-card">
          <div className="auth-mobile-brand"><Brand /></div>
          <span className="eyebrow">{register ? 'COMECE POR AQUI' : 'BEM-VINDO DE VOLTA'}</span>
          <h2>{register ? 'Crie sua conta' : 'Acesse sua conta'}</h2>
          <p className="muted">{register ? 'Configure seu espaço de gestão em poucos passos.' : 'Entre com seus dados para abrir o painel de demonstração.'}</p>
          <form className="form-stack" onSubmit={event => submitAuth(event, register ? 'register' : 'login')}>
            {register && <><label>Seu nome<input value={auth.name} onChange={e => setAuth({ ...auth, name: e.target.value })} placeholder="Ex.: Carlos Silva" autoComplete="name" required /></label><label>Nome da empresa<input value={auth.company} onChange={e => setAuth({ ...auth, company: e.target.value })} placeholder="Ex.: Silva Crédito" autoComplete="organization" required /></label></>}
            <label>E-mail<input type="email" value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} placeholder="voce@empresa.com.br" autoComplete="email" required /></label>
            <label>Senha <span className="password-field"><input type={showPassword ? 'text' : 'password'} value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} placeholder="Digite qualquer senha para testar" autoComplete={register ? 'new-password' : 'current-password'} required /><button type="button" className="icon-button password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label>
            {authError && <div className="form-error"><CircleAlert size={16}/>{authError}</div>}
            <div className="demo-disclaimer"><LockKeyhole size={16}/><span>Modo MVP: o login é simulado no navegador. Senhas não são validadas por servidor nem armazenadas.</span></div>
            <button className="button button-primary button-full" type="submit">{register ? 'Criar conta de demonstração' : 'Entrar no painel'} <ArrowRight size={17}/></button>
          </form>
          <p className="auth-switch">{register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <button onClick={() => { setAuthError(''); setAuth({ name: '', company: '', email: '', password: '' }); go(register ? 'login' : 'register'); }}>{register ? 'Entrar' : 'Criar conta'}</button></p>
          <p className="legal-note">Ao continuar, você reconhece que esta é uma versão de teste sem autenticação segura.</p>
        </div>
      </div>
    </div>;
  }

  return <div className="app-shell">
    {sidebarOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-brand-row"><button onClick={() => { setSection('overview'); setSidebarOpen(false); }} aria-label="Ir para visão geral"><Brand /></button><button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu"><X size={19}/></button></div>
      <div className="workspace-switch"><span className="workspace-icon"><Building2 size={17}/></span><span className="workspace-copy"><strong>{user?.company || 'Minha organização'}</strong><small>Workspace de demonstração</small></span><ChevronDown size={15}/></div>
      <nav className="side-nav">
        {['WORKSPACE', 'FINANCEIRO', 'GESTÃO'].map(group => <div className="nav-group" key={group}><span className="nav-group-label">{group}</span>{navItems.filter(item => item.group === group).map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-link ${section === item.id ? 'active' : ''}`} onClick={() => { setSection(item.id); setSidebarOpen(false); setSearch(''); }} title={collapsed ? item.label : undefined}><Icon size={18}/><span>{item.label}</span>{item.id === 'receivables' && totals.overdue > 0 && <b className="nav-count">{totals.overdue}</b>}</button>; })}</div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><strong>Precisa de ajuda?</strong><p>Conheça os recursos do Credor Pay.</p><button onClick={() => setNotice('Central de ajuda disponível na próxima etapa.')}>Acessar central <ArrowRight size={14}/></button></div>
        <button className="nav-link" onClick={() => setSection('settings')}><Settings size={18}/><span>Configurações</span></button>
        <div className="profile-row"><span className="avatar avatar-blue">{initials(user?.name || 'CP')}</span><span className="profile-copy"><strong>{user?.name || 'Usuário demo'}</strong><small>{user?.email || 'demo@credorpay.app'}</small></span><button className="icon-button" onClick={signOut} aria-label="Sair"><LogOut size={17}/></button></div>
      </div>
      <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>{collapsed ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>}</button>
    </aside>
    <main className={`main-area ${collapsed ? 'main-collapsed' : ''}`}>
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Menu size={21}/></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{navItems.find(item => item.id === section)?.label || 'Visão geral'}</strong></div></div>
        <div className="topbar-actions"><span className="demo-pill"><span/> Modo demonstração</span><button className="icon-button notification-button" aria-label="Notificações" onClick={() => setNotice('Você está em dia com as notificações de demonstração.')}><Bell size={18}/><i/></button><span className="topbar-divider"/><span className="avatar avatar-small">{initials(user?.name || 'CP')}</span></div>
      </header>
      <div className="page-content">
        {section === 'overview' && <Overview user={user} totals={totals} customers={customers} contracts={contracts} payments={payments} onSection={setSection} onNew={(kind) => setModal(kind)} />}
        {section === 'customers' && <Customers customers={customers} search={search} setSearch={setSearch} onNew={() => setModal('customer')} />}
        {section === 'contracts' && <Contracts contracts={contracts} search={search} setSearch={setSearch} onNew={() => setModal('contract')} onExport={exportCsv} />}
        {section === 'receivables' && <Receivables contracts={contracts} payments={payments} onNew={() => setModal('payment')} />}
        {section === 'cashflow' && <Cashflow payments={payments} totals={totals} onNew={() => setModal('payment')} onExport={exportCsv} />}
        {section === 'reports' && <Reports contracts={contracts} customers={customers} payments={payments} onExport={exportCsv} />}
        {section === 'settings' && <SettingsPage user={user} onNotice={setNotice} onSignOut={signOut} />}
      </div>
      <footer className="app-footer"><span>© 2026 Credor Pay</span><span><span className="footer-dot"/> Ambiente de demonstração · Dados neste navegador</span></footer>
    </main>
    {modal && <Modal kind={modal} customers={customers} contracts={contracts} onClose={() => setModal(null)} onCustomer={addCustomer} onContract={addContract} onPayment={addPayment} />}
    {notice && <div className="toast"><span className="toast-check"><Check size={16}/></span>{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={15}/></button></div>}
  </div>;
}

function Landing({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return <div className="landing">
    <header className="marketing-nav"><button className="brand-home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><Brand /></button><nav><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a><a href="#seguranca">Segurança</a></nav><div className="nav-ctas"><button className="button button-ghost" onClick={onLogin}>Entrar</button><button className="button button-primary" onClick={onRegister}>Começar grátis <ArrowRight size={16}/></button></div><button className="icon-button mobile-nav-cta" onClick={onRegister} aria-label="Começar grátis"><ArrowRight size={20}/></button></header>
    <section className="hero">
      <div className="hero-copy"><span className="eyebrow"><span className="eyebrow-spark"><Sparkles size={13}/></span> CONTROLE FINANCEIRO EM UM SÓ LUGAR</span><h1>Seu crédito.<br/><span>Sob controle.</span></h1><p>Uma forma mais clara e organizada de acompanhar clientes, contratos, recebíveis e resultados da sua operação financeira.</p><div className="hero-actions"><button className="button button-primary button-large" onClick={onRegister}>Conheça o Credor Pay <ArrowRight size={18}/></button><button className="button button-outline button-large" onClick={onLogin}><span className="play-dot"><ArrowRight size={12}/></span> Acessar demonstração</button></div><div className="hero-trust"><div className="trust-avatars"><span>CP</span><span>CF</span><span>GP</span></div><span><strong>Gestão sem complicação</strong><small>Mais clareza para acompanhar cada etapa</small></span></div></div>
      <div className="hero-visual"><div className="visual-glow"/><div className="dashboard-preview"><div className="preview-sidebar"><div className="preview-brand"><span className="brand-mark"><HandCoins size={15}/></span></div><span className="preview-nav active"><LayoutDashboard size={16}/></span><span className="preview-nav"><Users size={16}/></span><span className="preview-nav"><FileText size={16}/></span><span className="preview-nav"><Wallet size={16}/></span><span className="preview-nav"><FileBarChart size={16}/></span></div><div className="preview-main"><div className="preview-head"><div><small>SEGUNDA-FEIRA, 19 DE OUTUBRO</small><strong>Visão geral</strong></div><span className="preview-avatar">CS</span></div><div className="preview-welcome"><div><small>Bom dia, Carlos 👋</small><strong>Acompanhe sua operação.</strong></div><span className="preview-filter"><CalendarDays size={12}/> Este mês</span></div><div className="preview-metrics"><div><small>Carteira ativa</small><strong>R$ 84.250</strong><span className="metric-positive"><TrendingUp size={11}/> 8,4%</span></div><div><small>A receber</small><strong>R$ 32.680</strong><span className="metric-muted">Próximos 30 dias</span></div></div><div className="preview-chart-card"><div className="preview-chart-head"><span><strong>Fluxo de recebimentos</strong><small>Últimos 6 meses</small></span><span className="chart-legend"><i/> Recebido</span></div><div className="preview-chart"><div className="chart-grid"><i/><i/><i/><i/></div><svg viewBox="0 0 360 115" preserveAspectRatio="none" aria-label="Gráfico ilustrativo de recebimentos"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3c7cf6" stopOpacity=".22"/><stop offset="100%" stopColor="#3c7cf6" stopOpacity="0"/></linearGradient></defs><path d="M0,88 C25,82 30,72 56,76 S88,54 112,62 S148,75 174,49 S215,61 238,35 S270,46 293,27 S330,35 360,10 L360,115 L0,115 Z" fill="url(#areaFill)"/><path d="M0,88 C25,82 30,72 56,76 S88,54 112,62 S148,75 174,49 S215,61 238,35 S270,46 293,27 S330,35 360,10" fill="none" stroke="#3974DB" strokeWidth="2.5" strokeLinecap="round"/></svg></div><div className="preview-months"><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span></div></div><div className="preview-list"><div><span className="preview-person">MO</span><span><strong>Mariana Oliveira</strong><small>Parcela recebida</small></span><b>+ R$ 1.200</b></div><div><span className="preview-person alt">RC</span><span><strong>Rafael Costa</strong><small>Vencimento próximo</small></span><b className="preview-pending">R$ 800</b></div></div></div></div><div className="float-card float-card-top"><span className="float-icon"><ArrowDownLeft size={17}/></span><span><small>Recebimento confirmado</small><strong>+ R$ 1.200,00</strong></span><BadgeCheck size={17} className="float-check"/></div><div className="float-card float-card-bottom"><span className="float-icon purple"><CalendarDays size={17}/></span><span><small>Próximos vencimentos</small><strong>12 parcelas</strong></span><span className="float-arrow"><ArrowRight size={15}/></span></div></div>
    </section>
    <section className="trust-strip"><span>FEITO PARA ORGANIZAR SUA OPERAÇÃO</span><div><span><Check size={16}/> Clientes organizados</span><span><Check size={16}/> Contratos centralizados</span><span><Check size={16}/> Recebíveis visíveis</span><span><Check size={16}/> Relatórios claros</span></div></section>
    <section id="recursos" className="features-section"><div className="section-heading"><span className="eyebrow">TUDO CONECTADO</span><h2>Menos planilhas.<br/><span>Mais visão do negócio.</span></h2><p>Ferramentas essenciais para acompanhar sua carteira sem perder o controle dos detalhes.</p></div><div className="feature-grid"><Feature icon={<Users size={22}/>} number="01" title="Gestão de clientes" text="Centralize contatos, cadastros e histórico de relacionamento em um só lugar."/><Feature icon={<FileText size={22}/>} number="02" title="Contratos organizados" text="Acompanhe valores, condições, parcelas e o status de cada operação."/><Feature icon={<CalendarDays size={22}/>} number="03" title="Recebíveis em dia" text="Visualize vencimentos, pagamentos registrados e itens que precisam de atenção."/><Feature icon={<ChartIcon/>} number="04" title="Visão financeira" text="Entenda entradas, valores a receber e indicadores para tomar decisões melhores."/><Feature icon={<ShieldCheck size={22}/>} number="05" title="Acesso organizado" text="Uma experiência preparada para separar equipes e áreas da operação."/><Feature icon={<Download size={22}/>} number="06" title="Relatórios práticos" text="Consulte os dados da carteira e exporte informações para análise." /></div></section>
    <section id="como-funciona" className="steps-section"><div className="section-heading"><span className="eyebrow">SIMPLES PARA COMEÇAR</span><h2>Organize tudo em<br/><span>três passos.</span></h2></div><div className="steps-grid"><div className="step-item"><span className="step-number">01</span><div className="step-icon"><Building2 size={23}/></div><h3>Configure seu espaço</h3><p>Crie seu acesso de demonstração e conheça a estrutura do painel.</p></div><div className="step-connector"/><div className="step-item"><span className="step-number">02</span><div className="step-icon"><Users size={23}/></div><h3>Cadastre sua carteira</h3><p>Organize clientes, contratos e os vencimentos da sua operação.</p></div><div className="step-connector"/><div className="step-item"><span className="step-number">03</span><div className="step-icon"><TrendingUp size={23}/></div><h3>Acompanhe resultados</h3><p>Use os indicadores e relatórios para visualizar a evolução da carteira.</p></div></div></section>
    <section id="seguranca" className="security-section"><div className="security-icon"><ShieldCheck size={30}/></div><div><span className="eyebrow">TRANSPARÊNCIA DESDE O INÍCIO</span><h2>Feito para evoluir com responsabilidade.</h2><p>O Credor Pay está em fase de MVP. Esta demonstração usa dados locais no navegador e não deve ser utilizada com informações reais. A versão comercial exigirá autenticação segura, banco de dados protegido e revisão de conformidade.</p></div><button className="button button-outline" onClick={onRegister}>Explorar demonstração <ArrowRight size={16}/></button></section>
    <section className="cta-section"><div className="cta-orb orb-one"/><div className="cta-orb orb-two"/><span className="eyebrow light-eyebrow"><Sparkles size={14}/> SEU PRÓXIMO PASSO</span><h2>Clareza financeira<br/>começa com organização.</h2><p>Conheça o painel e veja como os módulos se conectam.</p><button className="button button-white button-large" onClick={onRegister}>Começar agora <ArrowRight size={18}/></button></section>
    <footer className="marketing-footer"><Brand/><span>© 2026 Credor Pay. MVP de demonstração.</span><div><a href="#recursos">Recursos</a><button onClick={onLogin}>Entrar</button><button onClick={onRegister}>Criar conta</button></div></footer>
  </div>;
}
function ChartIcon() { return <Activity size={22}/>; }
function Feature({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) {
  return <article className="feature-card"><div className="feature-top"><span className="feature-icon">{icon}</span><span className="feature-number">{number}</span></div><h3>{title}</h3><p>{text}</p><span className="feature-link">Conhecer recurso <ArrowRight size={14}/></span></article>;
}
function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}
function MetricCard({ label, value, change, icon: Icon, tone, foot }: { label: string; value: string; change?: string; icon: typeof Wallet; tone: string; foot?: string }) {
  return <div className="metric-card"><div className="metric-card-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon size={19}/></span></div><strong>{value}</strong><div className="metric-card-foot">{change && <span className="change-positive"><TrendingUp size={13}/>{change}</span>}<span>{foot || 'em relação ao período anterior'}</span></div></div>;
}
function Status({ children }: { children: string }) {
  const className = children === 'Quitado' || children === 'Confirmado' || children === 'Ativo' || children === 'Em dia' ? 'status-good' : children === 'Atrasado' ? 'status-danger' : 'status-pending';
  return <span className={`status-pill ${className}`}><i/>{children}</span>;
}
function Overview({ user, totals, customers, contracts, payments, onSection, onNew }: { user: DemoUser | null; totals: { principal: number; outstanding: number; received: number; overdue: number; active: number }; customers: Customer[]; contracts: Contract[]; payments: Payment[]; onSection: (s: Section) => void; onNew: (m: ModalKind) => void }) {
  const latest = payments.slice(0, 4);
  return <><PageHeading eyebrow="RESUMO DA OPERAÇÃO" title={`Bom dia, ${(user?.name || 'gestor').split(' ')[0]} 👋`} subtitle="Aqui está um panorama da sua carteira financeira." action={<button className="button button-primary" onClick={() => onNew('contract')}><Plus size={17}/> Novo contrato</button>}/><div className="demo-alert"><span className="demo-alert-icon"><CircleAlert size={17}/></span><span><strong>Ambiente de demonstração</strong><small>Os dados exibidos são ilustrativos e ficam salvos somente neste navegador.</small></span><button onClick={() => onSection('settings')}>Saiba mais <ArrowRight size={14}/></button></div><div className="metric-grid"><MetricCard label="Capital em operações" value={money(totals.principal)} change="+8,4%" icon={BriefcaseBusiness} tone="blue" foot="carteira ativa"/><MetricCard label="Total a receber" value={money(totals.outstanding)} icon={ArrowDownLeft} tone="violet" foot="saldo estimado"/><MetricCard label="Recebido registrado" value={money(totals.received)} change="+12,6%" icon={CircleDollarSign} tone="green" foot="no histórico local"/><MetricCard label="Contratos em atraso" value={String(totals.overdue).padStart(2, '0')} icon={Clock3} tone="orange" foot="precisam de atenção"/></div><div className="overview-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h2>Movimentação financeira</h2><p>Resumo ilustrativo de recebimentos</p></div><button className="select-like" onClick={() => onSection('reports')}>Últimos 6 meses <ChevronDown size={14}/></button></div><div className="chart-summary"><div><small>Total recebido</small><strong>{money(totals.received)}</strong><span className="change-positive"><TrendingUp size={13}/> +12,6%</span></div><div className="chart-legend"><i/> Recebimentos</div></div><div className="main-chart"><div className="chart-y-labels"><span>R$ 20 mil</span><span>R$ 15 mil</span><span>R$ 10 mil</span><span>R$ 5 mil</span><span>R$ 0</span></div><div className="chart-plot"><div className="chart-lines"><i/><i/><i/><i/><i/></div><svg viewBox="0 0 600 190" preserveAspectRatio="none" role="img" aria-label="Gráfico ilustrativo de recebimentos mensais"><defs><linearGradient id="mainArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3974DB" stopOpacity=".2"/><stop offset="100%" stopColor="#3974DB" stopOpacity="0"/></linearGradient></defs><path d="M0 151 C32 142 48 120 85 131 S131 90 165 109 S216 129 248 84 S299 96 332 71 S384 93 414 56 S464 76 500 42 S557 50 600 18 L600 190 L0 190 Z" fill="url(#mainArea)"/><path d="M0 151 C32 142 48 120 85 131 S131 90 165 109 S216 129 248 84 S299 96 332 71 S384 93 414 56 S464 76 500 42 S557 50 600 18" fill="none" stroke="#3974DB" strokeWidth="3" strokeLinecap="round"/></svg><div className="chart-x-labels"><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span></div></div></div></section><section className="panel attention-panel"><div className="panel-heading"><div><h2>Visão da carteira</h2><p>Status dos contratos</p></div><button className="icon-button" onClick={() => onSection('contracts')} aria-label="Ver contratos"><ArrowRight size={17}/></button></div><div className="portfolio-total"><strong>{contracts.length}</strong><span>contratos cadastrados</span></div><div className="portfolio-bar"><i style={{ width: `${contracts.length ? contracts.filter(c => c.status === 'Em dia').length / contracts.length * 100 : 0}%` }}/><i style={{ width: `${contracts.length ? contracts.filter(c => c.status === 'Atrasado').length / contracts.length * 100 : 0}%` }}/><i style={{ width: `${contracts.length ? contracts.filter(c => c.status === 'Quitado').length / contracts.length * 100 : 0}%` }}/></div><div className="portfolio-legend"><span><i className="legend-blue"/> Em dia <b>{contracts.filter(c => c.status === 'Em dia').length}</b></span><span><i className="legend-orange"/> Atrasados <b>{contracts.filter(c => c.status === 'Atrasado').length}</b></span><span><i className="legend-green"/> Quitados <b>{contracts.filter(c => c.status === 'Quitado').length}</b></span></div><button className="button button-outline button-full portfolio-button" onClick={() => onSection('contracts')}>Ver todos os contratos <ArrowRight size={15}/></button></section></div><section className="panel activity-panel"><div className="panel-heading"><div><h2>Atividade recente</h2><p>Últimos recebimentos registrados no MVP</p></div><button className="text-button" onClick={() => onSection('receivables')}>Ver recebíveis <ArrowRight size={15}/></button></div><PaymentTable payments={latest}/></section><div className="quick-actions"><button onClick={() => onNew('customer')}><span className="quick-icon"><Users size={19}/></span><span><strong>Adicionar cliente</strong><small>Cadastre um novo cliente</small></span><ArrowRight size={17}/></button><button onClick={() => onNew('payment')}><span className="quick-icon green"><CircleDollarSign size={19}/></span><span><strong>Registrar recebimento</strong><small>Atualize um pagamento</small></span><ArrowRight size={17}/></button><button onClick={() => onSection('reports')}><span className="quick-icon purple"><FileBarChart size={19}/></span><span><strong>Ver relatórios</strong><small>Analise seus indicadores</small></span><ArrowRight size={17}/></button></div></>;
}
function TableToolbar({ search, setSearch, placeholder, children }: { search: string; setSearch: (s: string) => void; placeholder: string; children?: React.ReactNode }) {
  return <div className="table-toolbar"><label className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder={placeholder}/>{search && <button onClick={() => setSearch('')} aria-label="Limpar busca"><X size={14}/></button>}</label><div className="toolbar-actions">{children}</div></div>;
}
function Customers({ customers, search, setSearch, onNew }: { customers: Customer[]; search: string; setSearch: (s: string) => void; onNew: () => void }) {
  const filtered = customers.filter(c => [c.name, c.email, c.id, c.phone].some(v => v.toLowerCase().includes(search.toLowerCase())));
  return <><PageHeading eyebrow="RELACIONAMENTO" title="Clientes" subtitle="Centralize os dados e acompanhe o relacionamento com sua carteira." action={<button className="button button-primary" onClick={onNew}><Plus size={17}/> Novo cliente</button>}/><div className="metric-grid compact-metrics"><MetricCard label="Total de clientes" value={String(customers.length)} icon={Users} tone="blue" foot="cadastros locais"/><MetricCard label="Clientes ativos" value={String(customers.filter(c => c.status === 'Ativo').length)} icon={BadgeCheck} tone="green" foot="status cadastral"/><MetricCard label="Novos neste mês" value={String(customers.filter(c => c.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7)).length)} icon={TrendingUp} tone="violet" foot="na demonstração"/></div><section className="panel table-panel"><div className="panel-heading"><div><h2>Todos os clientes</h2><p>{filtered.length} registros encontrados</p></div><button className="icon-button" aria-label="Filtros" onClick={() => setSearch('')}><SlidersHorizontal size={17}/></button></div><TableToolbar search={search} setSearch={setSearch} placeholder="Buscar por nome, e-mail ou código..."/><div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Contato</th><th>Cadastrado em</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td><div className="table-person"><span className="avatar">{initials(c.name)}</span><span><strong>{c.name}</strong><small>{c.id}</small></span></div></td><td><span className="cell-main">{c.email}</span><small className="cell-sub">{c.phone || 'Telefone não informado'}</small></td><td>{dateBR(c.createdAt)}</td><td><Status>{c.status}</Status></td><td><button className="icon-button row-more" title="Ações" onClick={() => window.alert('Ações detalhadas serão adicionadas na próxima etapa do MVP.')}><ChevronDown size={16}/></button></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState title="Nenhum cliente encontrado" text="Tente outro termo ou cadastre um novo cliente."/>}</div></section></>;
}
function Contracts({ contracts, search, setSearch, onNew, onExport }: { contracts: Contract[]; search: string; setSearch: (s: string) => void; onNew: () => void; onExport: () => void }) {
  const filtered = contracts.filter(c => [c.id, c.customerName, c.status].some(v => v.toLowerCase().includes(search.toLowerCase())));
  return <><PageHeading eyebrow="OPERAÇÕES DE CRÉDITO" title="Contratos" subtitle="Consulte as condições e acompanhe o andamento de cada contrato." action={<button className="button button-primary" onClick={onNew}><Plus size={17}/> Novo contrato</button>}/><div className="metric-grid compact-metrics"><MetricCard label="Contratos ativos" value={String(contracts.filter(c => c.status !== 'Quitado').length)} icon={FileText} tone="blue" foot="em andamento"/><MetricCard label="Capital contratado" value={money(contracts.reduce((s, c) => s + c.principal, 0))} icon={BriefcaseBusiness} tone="violet" foot="valor principal"/><MetricCard label="Contratos quitados" value={String(contracts.filter(c => c.status === 'Quitado').length)} icon={Check} tone="green" foot="concluídos"/></div><section className="panel table-panel"><div className="panel-heading"><div><h2>Carteira de contratos</h2><p>Informações ilustrativas para teste de interface</p></div><button className="button button-outline button-small" onClick={onExport}><Download size={15}/> Exportar CSV</button></div><TableToolbar search={search} setSearch={setSearch} placeholder="Buscar contrato ou cliente..."/><div className="table-wrap"><table><thead><tr><th>Contrato / Cliente</th><th>Valor principal</th><th>Progresso</th><th>Próximo vencimento</th><th>Status</th></tr></thead><tbody>{filtered.map(c => <tr key={c.id}><td><div className="table-person"><span className="table-icon"><FileText size={17}/></span><span><strong>{c.id}</strong><small>{c.customerName}</small></span></div></td><td><span className="cell-main">{money(c.principal)}</span><small className="cell-sub">Total previsto: {money(c.total)}</small></td><td><div className="progress-cell"><div className="progress-track"><i style={{ width: `${Math.min(100, c.paid / c.installments * 100)}%` }}/></div><small>{c.paid} de {c.installments} parcelas</small></div></td><td>{dateBR(c.dueDate)}</td><td><Status>{c.status}</Status></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState title="Nenhum contrato encontrado" text="Ajuste sua busca ou crie um novo contrato de demonstração."/>}</div></section></>;
}
function Receivables({ contracts, payments, onNew }: { contracts: Contract[]; payments: Payment[]; onNew: () => void }) {
  const due = contracts.filter(c => c.status !== 'Quitado');
  return <><PageHeading eyebrow="CONTROLE DE RECEBIMENTOS" title="Recebíveis" subtitle="Acompanhe pagamentos registrados e os próximos vencimentos." action={<button className="button button-primary" onClick={onNew}><Plus size={17}/> Registrar recebimento</button>}/><div className="metric-grid"><MetricCard label="Recebido confirmado" value={money(payments.filter(p => p.status === 'Confirmado').reduce((s, p) => s + p.amount, 0))} icon={ArrowDownLeft} tone="green" foot="registros confirmados"/><MetricCard label="Recebimentos pendentes" value={money(payments.filter(p => p.status === 'Pendente').reduce((s, p) => s + p.amount, 0))} icon={Clock3} tone="orange" foot="aguardando conferência"/><MetricCard label="Contratos com saldo" value={String(due.length)} icon={CalendarDays} tone="blue" foot="em acompanhamento"/><MetricCard label="Em atraso" value={String(contracts.filter(c => c.status === 'Atrasado').length)} icon={CircleAlert} tone="red" foot="requerem atenção"/></div><section className="panel table-panel"><div className="panel-heading"><div><h2>Histórico de recebimentos</h2><p>Registros salvos neste navegador</p></div></div><PaymentTable payments={payments}/></section><section className="panel table-panel secondary-table"><div className="panel-heading"><div><h2>Próximos vencimentos</h2><p>Baseado nas datas registradas nos contratos</p></div></div><div className="table-wrap"><table><thead><tr><th>Cliente / Contrato</th><th>Saldo estimado</th><th>Data de vencimento</th><th>Status</th></tr></thead><tbody>{due.map(c => <tr key={c.id}><td><div className="table-person"><span className="avatar">{initials(c.customerName)}</span><span><strong>{c.customerName}</strong><small>{c.id}</small></span></div></td><td>{money(Math.max(0, c.total * (c.installments - c.paid) / c.installments))}</td><td>{dateBR(c.dueDate)}</td><td><Status>{c.status}</Status></td></tr>)}</tbody></table>{due.length === 0 && <EmptyState title="Tudo quitado" text="Não há contratos em aberto na demonstração."/>}</div></section></>;
}
function PaymentTable({ payments }: { payments: Payment[] }) {
  return <div className="table-wrap"><table><thead><tr><th>Recebimento</th><th>Data</th><th>Método</th><th>Valor</th><th>Status</th></tr></thead><tbody>{payments.map(p => <tr key={p.id}><td><div className="table-person"><span className="table-icon green"><ArrowDownLeft size={17}/></span><span><strong>{p.customerName}</strong><small>{p.id}</small></span></div></td><td>{dateBR(p.date)}</td><td>{p.method}</td><td><strong className="money-cell">{money(p.amount)}</strong></td><td><Status>{p.status}</Status></td></tr>)}</tbody></table>{payments.length === 0 && <EmptyState title="Nenhum recebimento" text="Os recebimentos registrados aparecerão aqui."/>}</div>;
}
function Cashflow({ payments, totals, onNew, onExport }: { payments: Payment[]; totals: { principal: number; outstanding: number; received: number }; onNew: () => void; onExport: () => void }) {
  const confirmed = payments.filter(p => p.status === 'Confirmado');
  return <><PageHeading eyebrow="CONTROLE FINANCEIRO" title="Fluxo de caixa" subtitle="Visão consolidada dos recebimentos registrados no ambiente local." action={<button className="button button-primary" onClick={onNew}><Plus size={17}/> Nova entrada</button>}/><div className="metric-grid"><MetricCard label="Entradas confirmadas" value={money(totals.received)} icon={ArrowDownLeft} tone="green" foot="total do histórico local"/><MetricCard label="A receber estimado" value={money(totals.outstanding)} icon={Wallet} tone="blue" foot="saldo dos contratos"/><MetricCard label="Operações ativas" value={money(totals.principal)} icon={BriefcaseBusiness} tone="violet" foot="capital principal"/><MetricCard label="Lançamentos" value={String(payments.length)} icon={Activity} tone="orange" foot="no histórico local"/></div><section className="panel table-panel"><div className="panel-heading"><div><h2>Entradas registradas</h2><p>Este resumo não representa extrato bancário conciliado.</p></div><button className="button button-outline button-small" onClick={onExport}><Download size={15}/> Exportar dados</button></div><PaymentTable payments={confirmed}/></section><div className="info-banner"><CircleAlert size={18}/><span><strong>Importante:</strong> o MVP não conecta a contas bancárias e não confirma transações externas. Registros são apenas dados de demonstração.</span></div></>;
}
function Reports({ contracts, customers, payments, onExport }: { contracts: Contract[]; customers: Customer[]; payments: Payment[]; onExport: () => void }) {
  const paid = contracts.filter(c => c.status === 'Quitado').length;
  const overdue = contracts.filter(c => c.status === 'Atrasado').length;
  const received = payments.filter(p => p.status === 'Confirmado').reduce((s, p) => s + p.amount, 0);
  const max = Math.max(1, ...contracts.map(c => c.principal));
  return <><PageHeading eyebrow="INTELIGÊNCIA DE NEGÓCIO" title="Relatórios" subtitle="Indicadores básicos para acompanhar sua operação de demonstração." action={<button className="button button-primary" onClick={onExport}><Download size={17}/> Exportar CSV</button>}/><div className="metric-grid"><MetricCard label="Clientes cadastrados" value={String(customers.length)} icon={Users} tone="blue" foot="base local"/><MetricCard label="Taxa de quitação" value={`${contracts.length ? Math.round(paid / contracts.length * 100) : 0}%`} icon={BadgeCheck} tone="green" foot="contratos quitados"/><MetricCard label="Recebido registrado" value={money(received)} icon={CircleDollarSign} tone="violet" foot="histórico local"/><MetricCard label="Contratos atrasados" value={String(overdue)} icon={Clock3} tone="orange" foot="atenção necessária"/></div><section className="panel report-panel"><div className="panel-heading"><div><h2>Distribuição por contrato</h2><p>Comparativo de valores principais</p></div></div><div className="bar-report">{contracts.map(c => <div className="bar-report-row" key={c.id}><div className="bar-report-label"><span>{c.customerName}</span><strong>{money(c.principal)}</strong></div><div className="bar-report-track"><i style={{ width: `${c.principal / max * 100}%` }}/></div><div className="bar-report-foot"><span>{c.id}</span><Status>{c.status}</Status></div></div>)}</div>{contracts.length === 0 && <EmptyState title="Sem dados para exibir" text="Cadastre um contrato para gerar indicadores."/>}</section><div className="info-banner"><FileBarChart size={18}/><span>Os indicadores são calculados no navegador com dados locais. Não constituem demonstrações contábeis nem substituem conciliação financeira.</span></div></>;
}
function SettingsPage({ user, onNotice, onSignOut }: { user: DemoUser | null; onNotice: (s: string) => void; onSignOut: () => void }) {
  return <><PageHeading eyebrow="PREFERÊNCIAS" title="Configurações" subtitle="Informações da conta e do ambiente de demonstração."/><div className="settings-grid"><section className="panel settings-panel"><div className="settings-section-head"><span className="settings-icon"><Building2 size={20}/></span><div><h2>Organização</h2><p>Dados de identificação do workspace</p></div></div><div className="settings-field"><span>Nome da organização</span><strong>{user?.company || 'Minha organização'}</strong></div><div className="settings-field"><span>Responsável</span><strong>{user?.name || 'Usuário de demonstração'}</strong></div><div className="settings-field"><span>E-mail de acesso</span><strong>{user?.email || 'demo@credorpay.app'}</strong></div><button className="button button-outline" onClick={() => onNotice('A edição do perfil será habilitada em uma próxima versão.')}>Editar perfil</button></section><section className="panel settings-panel"><div className="settings-section-head"><span className="settings-icon purple"><ShieldCheck size={20}/></span><div><h2>Privacidade e dados</h2><p>Limites da versão atual</p></div></div><div className="settings-notice"><CircleAlert size={18}/><span><strong>Armazenamento local</strong><small>Os dados ficam neste navegador. Limpar o armazenamento pode removê-los; outros dispositivos não compartilham informações.</small></span></div><div className="settings-field"><span>Autenticação</span><Status>Pendente para produção</Status></div><div className="settings-field"><span>Banco remoto</span><Status>Pendente para produção</Status></div><button className="button button-outline" onClick={() => { if (window.confirm('Isso apagará clientes, contratos e recebimentos de demonstração salvos neste navegador. Deseja continuar?')) { localStorage.removeItem(STORE.user); saveStore(STORE.customers, []); saveStore(STORE.contracts, []); saveStore(STORE.payments, []); window.location.reload(); } }}>Limpar dados da demonstração</button></section><section className="panel settings-panel full-span"><div className="settings-section-head"><span className="settings-icon orange"><LifeBuoy size={20}/></span><div><h2>Sobre o Credor Pay</h2><p>Produto em construção</p></div></div><p className="settings-description">Esta versão valida a experiência de navegação e os fluxos básicos. Antes de operar com dados reais, será necessário implementar autenticação segura no servidor, banco de dados com isolamento entre organizações, auditoria e revisão jurídica/regulatória.</p><div className="settings-actions"><span className="version-pill">MVP 0.1.0 · Local</span><button className="button button-outline" onClick={onSignOut}><LogOut size={16}/> Sair da demonstração</button></div></section></div></>;
}
function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span><Search size={20}/></span><strong>{title}</strong><p>{text}</p></div>;
}
function Modal({ kind, customers, contracts, onClose, onCustomer, onContract, onPayment }: { kind: Exclude<ModalKind, null>; customers: Customer[]; contracts: Contract[]; onClose: () => void; onCustomer: (event: React.FormEvent<HTMLFormElement>) => void; onContract: (event: React.FormEvent<HTMLFormElement>) => void; onPayment: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const title = kind === 'customer' ? 'Novo cliente' : kind === 'contract' ? 'Novo contrato' : 'Registrar recebimento';
  const description = kind === 'customer' ? 'Adicione um contato à sua base local.' : kind === 'contract' ? 'Registre uma operação para fins de demonstração.' : 'Registre um recebimento no histórico local.';
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><span className="eyebrow">DADOS DE DEMONSTRAÇÃO</span><h2 id="modal-title">{title}</h2><p>{description}</p></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={19}/></button></div>
    {kind === 'customer' && <form className="form-stack modal-form" onSubmit={onCustomer}><label>Nome completo<input name="name" placeholder="Nome do cliente" required autoFocus/></label><label>E-mail<input name="email" type="email" placeholder="cliente@email.com" required/></label><label>Telefone<input name="phone" type="tel" placeholder="(11) 99999-9999"/></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancelar</button><button type="submit" className="button button-primary">Salvar cliente <ArrowRight size={16}/></button></div></form>}
    {kind === 'contract' && <form className="form-stack modal-form" onSubmit={onContract}><label>Cliente<select name="customerId" required defaultValue=""><option value="" disabled>Selecione um cliente</option>{customers.filter(c => c.status === 'Ativo').map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label><div className="form-two-col"><label>Valor principal (R$)<input name="principal" type="number" min="0.01" step="0.01" placeholder="5000,00" required/></label><label>Valor total previsto (R$)<input name="total" type="number" min="0.01" step="0.01" placeholder="5600,00" required/></label></div><div className="form-two-col"><label>Número de parcelas<input name="installments" type="number" min="1" max="120" defaultValue="12" required/></label><label>Próximo vencimento<input name="dueDate" type="date" min="2020-01-01" required/></label></div><p className="form-hint"><CircleAlert size={15}/> Informe apenas condições lícitas e transparentes. O MVP não valida juros ou conformidade contratual.</p><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancelar</button><button type="submit" className="button button-primary">Criar contrato <ArrowRight size={16}/></button></div></form>}
    {kind === 'payment' && <form className="form-stack modal-form" onSubmit={onPayment}><label>Contrato<select name="contractId" required defaultValue=""><option value="" disabled>Selecione um contrato</option>{contracts.filter(c => c.status !== 'Quitado').map(c => <option value={c.id} key={c.id}>{c.customerName} — {c.id}</option>)}</select></label><div className="form-two-col"><label>Valor recebido (R$)<input name="amount" type="number" min="0.01" step="0.01" placeholder="500,00" required/></label><label>Data do recebimento<input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required/></label></div><label>Forma de recebimento<select name="method" defaultValue="Pix"><option>Pix</option><option>Transferência</option><option>Dinheiro</option><option>Outro</option></select></label><p className="form-hint"><CircleAlert size={15}/> Este registro não consulta nem confirma pagamentos em bancos ou provedores.</p><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancelar</button><button type="submit" className="button button-primary">Registrar recebimento <ArrowRight size={16}/></button></div></form>}
  </section></div>;
}
