import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, Check, ChevronDown, Heart, Menu, Search, ShieldCheck, Smartphone, Sparkles, Tag, TicketPercent, UtensilsCrossed, X } from "lucide-react";
import { useState } from "react";
import { FreeDeliveryBadge } from "../components/FreeDeliveryBadge";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Clube de Cupons | Benefícios para seu delivery" },
    { name: "description", content: "Conheça o Clube de Cupons para Delivery. Explore oportunidades de economia e consulte as condições das ofertas. Acesso por R$ 19,90." },
    { property: "og:title", content: "Clube de Cupons para Delivery" },
    { property: "og:description", content: "Mais oportunidades de economizar nos seus pedidos. Conheça o clube por R$ 19,90." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Landing,
});

const benefits = [
  { icon: TicketPercent, title: "Cupons em um só lugar", text: "Encontre ofertas organizadas para facilitar sua busca." },
  { icon: UtensilsCrossed, title: "Ofertas de restaurantes", text: "Explore promoções de estabelecimentos participantes." },
  { icon: Smartphone, title: "Acesso digital", text: "Consulte o clube pelo celular." },
  { icon: BookOpenCheck, title: "Condições transparentes", text: "Veja validade, restrições e regras antes de utilizar cada benefício." },
];

const steps = [
  { title: "Ative seu acesso", text: "Escolha o plano do clube e finalize o pagamento." },
  { title: "Entre na plataforma", text: "Acesse sua área de membros após a confirmação da compra." },
  { title: "Explore os cupons", text: "Confira os benefícios disponíveis e as condições de utilização." },
];

const faqs = [
  ["O que é o Clube de Cupons?", "Uma plataforma digital para consultar cupons e oportunidades de economia em delivery. As ofertas dependem dos estabelecimentos participantes."],
  ["Como recebo meu acesso?", "Após a confirmação do pagamento, você receberá as instruções de acesso. O checkout e a liberação automática ainda estão em implantação."],
  ["Como utilizo os cupons?", "Na área de membros, consulte as condições de cada oferta e siga as instruções de utilização informadas no próprio cupom."],
  ["Os cupons funcionam em qualquer restaurante?", "Não. Cada oferta pode ser limitada a restaurantes, regiões, horários e pedidos específicos."],
  ["Os descontos são sempre os mesmos?", "Não. Os benefícios podem variar conforme a disponibilidade e as regras de cada estabelecimento."],
  ["Por quanto tempo meu acesso fica ativo?", "O período de acesso será informado no checkout antes de qualquer cobrança. Essa condição ainda precisa ser configurada."],
  ["Quais são as formas de pagamento?", "As formas de pagamento serão exibidas no checkout quando a integração estiver disponível."],
  ["Como posso solicitar suporte ou cancelamento?", "Os canais de suporte, regras de cancelamento e eventuais reembolsos serão apresentados antes da compra. Ainda estão sendo configurados."],
];

const sampleCoupons = [
  { icon: "🍕", name: "Pizzaria exemplo", off: "15% OFF", min: "Pedido mínimo: R$ 50", expires: "Validade: ilustrativa" },
  { icon: "🍔", name: "Hamburgueria exemplo", off: "10% OFF", min: "Pedido mínimo: R$ 35", expires: "Validade: ilustrativa" },
];

const demoOffers = [
  {name:"4 Big Macs — McDonald's",price:"R$ 99,90",image:"/images/offers/big-mac.webp",alt:"Fotografia de 4 Big Macs — McDonald's; arquivo sujeito a autorização de uso"},
  {name:"2 Whoppers + batatas — Burger King",price:"R$ 49,90",image:"/images/offers/whopper.webp",alt:"Fotografia de 2 Whoppers + batatas — Burger King; arquivo sujeito a autorização de uso"},
  {name:"2 sanduíches de 30 cm — Subway",price:"R$ 39,90",image:"/images/offers/subway.webp",alt:"Fotografia de 2 sanduíches de 30 cm — Subway; arquivo sujeito a autorização de uso"},
  {name:"3 cheeseburgers + batata",price:"R$ 34,90",image:"/images/offers/cheeseburgers.webp",alt:"Fotografia de 3 cheeseburgers + batata; arquivo sujeito a autorização de uso"},
  {name:"2 brownies com sorvete",price:"R$ 24,90",image:"/images/offers/brownie.webp",alt:"Fotografia de 2 brownies com sorvete; arquivo sujeito a autorização de uso"},
  {name:"4 churros recheados",price:"R$ 19,90",image:"/images/offers/churros.webp",alt:"Fotografia de 4 churros recheados; arquivo sujeito a autorização de uso"},
  {name:"2 copos da felicidade",price:"R$ 29,90",image:"/images/offers/copo-felicidade.webp",alt:"Fotografia de 2 copos da felicidade; arquivo sujeito a autorização de uso"},
  {name:"12 brigadeiros gourmet",price:"R$ 24,90",image:"/images/offers/brigadeiros.webp",alt:"Fotografia de 12 brigadeiros gourmet; arquivo sujeito a autorização de uso"},
  {name:"2 milk-shakes de 500 ml",price:"R$ 24,90",image:"/images/offers/milkshake-chocolate.webp",alt:"Fotografia de 2 milk-shakes de 500 ml; arquivo sujeito a autorização de uso"},
  {name:"3 milk-shakes de morango",price:"R$ 34,90",image:"/images/offers/milkshake-morango.webp",alt:"Fotografia de 3 milk-shakes de morango; arquivo sujeito a autorização de uso"},
  {name:"2 açaís de 500 ml",price:"R$ 29,90",image:"/images/offers/acai.webp",alt:"Fotografia de 2 açaís de 500 ml; arquivo sujeito a autorização de uso"},
  {name:"Milk-shake de Oreo 700 ml",price:"R$ 16,90",image:"/images/offers/milkshake-oreo.webp",alt:"Fotografia de Milk-shake de Oreo 700 ml; arquivo sujeito a autorização de uso"},
  {name:"Pizza grande + refrigerante 2 L",price:"R$ 34,90",image:"/images/offers/pizza-refrigerante.webp",alt:"Fotografia de Pizza grande + refrigerante 2 L; arquivo sujeito a autorização de uso"},
  {name:"2 pizzas grandes",price:"R$ 59,90",image:"/images/offers/duas-pizzas.webp",alt:"Fotografia de 2 pizzas grandes; arquivo sujeito a autorização de uso"},
  {name:"20 mini coxinhas",price:"R$ 19,90",image:"/images/offers/coxinhas.webp",alt:"Fotografia de 20 mini coxinhas; arquivo sujeito a autorização de uso"},
  {name:"2 cachorro-quentes completos",price:"R$ 24,90",image:"/images/offers/cachorro-quente.webp",alt:"Fotografia de 2 cachorro-quentes completos; arquivo sujeito a autorização de uso"},
] as const;

// Add filenames here only after a licensed photograph is committed and verified.
const verifiedOfferImages: readonly string[] = [];

function OfferPhoto({src,alt}:{src:string;alt:string}) {
 const [failed,setFailed]=useState(false);
 if(!verifiedOfferImages.includes(src)||failed)return null;
 return <div className="mb-4 aspect-[4/3] overflow-hidden rounded-2xl"><img src={src} alt={alt} loading="lazy" decoding="async" width={650} height={488} onError={()=>setFailed(true)} className="h-full w-full object-cover" /></div>;
}
function Brand() {
  return <a href="#inicio" className="flex items-center gap-2.5 font-extrabold tracking-tight text-slate-900" aria-label="Clube de Cupons, início"><span className="grid size-10 place-items-center rounded-2xl bg-red-600 text-white"><TicketPercent size={22}/></span><span>Clube<span className="text-red-600">Cupons</span></span></a>;
}
function BuyButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <Link to="/checkout" className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${className}`}>{children}<ArrowRight size={18}/></Link>;
}
function PhonePreview() {
  return <div className="relative mx-auto w-full max-w-[340px] rotate-[-2deg] rounded-[2.8rem] border-[9px] border-slate-900 bg-white p-4 shadow-[0_35px_90px_-35px_rgba(50,30,30,.4)] sm:p-5" aria-label="Prévia ilustrativa da interface de cupons">
    <div className="mx-auto mb-5 h-5 w-28 rounded-b-2xl bg-slate-900" />
    <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-red-600">Seu espaço de vantagens</p><p className="text-lg font-black text-slate-900">Clube de Cupons</p></div><span className="rounded-xl bg-red-50 p-2 text-red-600"><Tag size={19}/></span></div>
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-3 text-xs text-slate-400"><Search size={16}/> Buscar oportunidades</div>
    <div className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-[11px] font-bold text-amber-800">EXEMPLOS ILUSTRATIVOS • NÃO DISPONÍVEIS PARA RESGATE</div>
    <div className="space-y-3">{sampleCoupons.map(c => <div key={c.name} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-red-50 text-2xl">{c.icon}</span><div className="min-w-0"><p className="text-xs font-bold text-slate-900">{c.name}</p><p className="text-base font-black text-red-600">{c.off}</p><div className="mt-1"><FreeDeliveryBadge/></div></div></div><div className="mt-2 flex justify-between gap-2 text-[10px] text-slate-500"><span>{c.min}</span><span>{c.expires}</span></div><p className="mt-2 text-[9px] leading-snug text-slate-500">Oferta e frete de demonstração — não disponíveis para resgate.</p><div className="mt-3 rounded-lg bg-slate-100 py-2 text-center text-[11px] font-bold text-slate-600">Visualizar condições</div></div>)}</div>
  </div>;
}
function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div id="inicio" className="min-h-screen overflow-x-hidden bg-[#fafafa] text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3"><Brand/><nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex" aria-label="Navegação principal"><a href="#beneficios" className="hover:text-red-600">Benefícios</a><a href="#como-funciona" className="hover:text-red-600">Como funciona</a><a href="#oferta" className="hover:text-red-600">Preço</a><a href="#faq" className="hover:text-red-600">Dúvidas</a></nav><div className="hidden md:block"><Link to="/login" className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">Acessar Clube</Link></div><button className="rounded-lg p-2 md:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button></div>{menuOpen && <nav className="flex flex-col gap-1 border-t bg-white px-5 py-3 text-sm font-semibold md:hidden" aria-label="Menu mobile">{[["#beneficios","Benefícios"],["#como-funciona","Como funciona"],["#oferta","Preço"],["#faq","Dúvidas"]].map(([href,label])=><a key={href} href={href} onClick={()=>setMenuOpen(false)} className="rounded-lg px-3 py-3 hover:bg-red-50">{label}</a>)}<Link to="/login" className="px-3 py-3 text-red-600">Acessar Clube</Link></nav>}</header>
    <main>
      <section className="relative overflow-hidden bg-white"><div className="absolute -right-40 top-0 size-[520px] rounded-full bg-red-50 blur-3xl" aria-hidden="true"/><div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 md:grid-cols-2 md:py-20"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-700"><Sparkles size={15}/> Seu novo jeito de descobrir vantagens</div><h1 className="max-w-xl text-[2.45rem] font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.6rem]">Seu delivery favorito pode sair <span className="text-red-600">muito mais barato!</span></h1><p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">Tenha acesso a um clube exclusivo de cupons e oportunidades de economia em restaurantes participantes.</p><div className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4"><TicketPercent className="text-red-600"/><span className="font-bold">Acesso ao Clube por apenas <strong className="text-xl text-red-600">R$ 19,90</strong></span></div><div className="mt-6 max-w-md"><BuyButton className="w-full">QUERO ACESSAR OS CUPONS</BuyButton></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500"><span className="flex items-center gap-1.5"><Smartphone size={15}/> Acesso digital</span><span className="flex items-center gap-1.5"><ShieldCheck size={15}/> Pagamento seguro</span><span className="flex items-center gap-1.5"><BookOpenCheck size={15}/> Consulte as condições</span></div></div><div className="relative hidden justify-center md:flex"><div className="absolute inset-10 rounded-full bg-red-100 blur-3xl" aria-hidden="true"/><div className="relative"><PhonePreview/></div></div></div></section>
      <section className="bg-slate-50 px-5 py-14 md:hidden"><h2 className="mb-7 text-center text-2xl font-black">Veja como será seu clube</h2><PhonePreview/></section>
      <section aria-labelledby="demo-offers-title" className="bg-white px-5 py-16"><div className="mx-auto max-w-6xl"><div className="mb-7"><p className="text-xs font-black uppercase tracking-widest text-red-600">Prévia do catálogo</p><h2 id="demo-offers-title" className="mt-2 text-2xl font-black sm:text-3xl">Ofertas do catálogo</h2><p className="mt-2 text-sm text-slate-600">Prévia do catálogo — ofertas e frete ainda não disponíveis para resgate.</p></div><div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6" role="region" aria-label="Carrossel de 16 ofertas demonstrativas" tabIndex={0}>{demoOffers.map((offer)=><article key={offer.name} className="w-[230px] shrink-0 snap-start rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm sm:w-[250px]"><OfferPhoto src={offer.image} alt={offer.name} /><h3 className="mt-1 min-h-12 text-base font-extrabold text-slate-900">{offer.name}</h3><p className="mt-2 text-xl font-black text-red-600">{offer.price}</p><div className="mt-2"><FreeDeliveryBadge/></div></article>)}</div></div></section>
      <section id="beneficios" className="scroll-mt-24 px-5 py-20"><div className="mx-auto max-w-6xl"><p className="mb-3 text-center text-xs font-black uppercase tracking-[.2em] text-red-600">Vantagens do clube</p><h2 className="mx-auto max-w-2xl text-center text-3xl font-black tracking-tight sm:text-4xl">Mais oportunidades de economizar nos seus pedidos.</h2><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(b=><article key={b.title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><span className="mb-5 grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600"><b.icon size={23}/></span><h3 className="mb-2 text-lg font-extrabold">{b.title}</h3><p className="text-sm leading-relaxed text-slate-600">{b.text}</p></article>)}</div></div></section>
      <section id="como-funciona" className="scroll-mt-24 bg-white px-5 py-20"><div className="mx-auto max-w-6xl"><p className="mb-3 text-center text-xs font-black uppercase tracking-[.2em] text-red-600">Simples assim</p><h2 className="text-center text-3xl font-black sm:text-4xl">Como funciona?</h2><div className="relative mt-12 grid gap-5 md:grid-cols-3"><div className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-red-200 md:block"/>{steps.map((s,i)=><article key={s.title} className="relative rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm"><span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-red-600 text-2xl font-black text-white shadow-lg shadow-red-100">{i+1}</span><h3 className="text-xl font-extrabold">{s.title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-600">{s.text}</p></article>)}</div></div></section>
      <section id="oferta" className="scroll-mt-24 bg-[#fff4f4] px-5 py-20"><div className="mx-auto max-w-xl rounded-[2rem] border border-red-100 bg-white p-7 shadow-[0_25px_70px_-30px_rgba(180,20,30,.25)] sm:p-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-extrabold text-red-600"><Heart size={15}/> Clube de benefícios</div><h2 className="text-3xl font-black">Seu acesso ao Clube de Cupons</h2><p className="mt-3 text-slate-600">Acesso à plataforma de cupons e benefícios de delivery.</p><div className="my-7 border-y border-slate-100 py-6"><span className="text-sm text-slate-500">Valor de acesso</span><p className="mt-1 text-5xl font-black tracking-tight text-red-600">R$ 19,90</p></div><ul className="space-y-4">{["Plataforma digital","Catálogo de ofertas","Consulta de condições","Área exclusiva para membros"].map(v=><li key={v} className="flex items-center gap-3 font-semibold"><span className="grid size-7 place-items-center rounded-full bg-green-50 text-green-700"><Check size={16}/></span>{v}</li>)}</ul><div className="mt-8"><BuyButton className="w-full">GARANTIR MEU ACESSO — R$ 19,90</BuyButton></div><p className="mt-4 text-center text-xs leading-relaxed text-slate-500">Prazo de acesso, renovação e cancelamento serão apresentados no checkout antes da compra. Compra ainda não disponível.</p></div></section>
      <section id="faq" className="scroll-mt-24 px-5 py-20"><div className="mx-auto max-w-3xl"><p className="mb-3 text-center text-xs font-black uppercase tracking-[.2em] text-red-600">Perguntas frequentes</p><h2 className="mb-9 text-center text-3xl font-black sm:text-4xl">Tire suas dúvidas</h2><div className="space-y-3">{faqs.map(([q,a])=><details key={q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold marker:hidden">{q}<ChevronDown size={19} className="shrink-0 text-red-600 transition group-open:rotate-180"/></summary><p className="mt-4 text-sm leading-relaxed text-slate-600">{a}</p></details>)}</div></div></section>
      <section className="bg-slate-900 px-5 py-14 text-center text-white"><h2 className="text-3xl font-black">Seu próximo pedido começa com mais possibilidades.</h2><p className="mx-auto mt-3 max-w-xl text-slate-300">Conheça o clube e veja como consultar oportunidades de economia.</p><div className="mx-auto mt-7 max-w-sm"><BuyButton className="w-full">QUERO CONHECER O CLUBE</BuyButton></div></section>
    </main>
    <footer className="bg-white px-5 pb-28 pt-12 md:pb-12"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-7 md:flex-row"><div><Brand/><p className="mt-3 max-w-sm text-sm text-slate-500">Plataforma independente de benefícios para delivery. Ofertas demonstrativas não são válidas para resgate.</p></div><div className="flex flex-col gap-3 text-sm text-slate-600"><Link to="/termos">Termos de Uso</Link><Link to="/privacidade">Política de Privacidade</Link><span>Suporte: canal em configuração</span><span>Informações comerciais: em configuração</span></div></div><p className="mx-auto mt-10 max-w-6xl border-t pt-5 text-xs text-slate-400">© {new Date().getFullYear()} ClubeCupons. Todos os direitos reservados.</p></footer>
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+.75rem)] shadow-[0_-8px_30px_rgba(0,0,0,.08)] backdrop-blur md:hidden"><div className="mx-auto flex max-w-lg items-center gap-3"><div className="shrink-0"><p className="text-[10px] text-slate-500">Acesso ao clube</p><p className="text-xl font-black text-red-600">R$ 19,90</p></div><BuyButton className="min-w-0 flex-1 px-2 py-3 text-xs">QUERO MEU ACESSO</BuyButton></div></div>
  </div>;
}
