import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Copy,
  Check,
  Tag,
  Pizza,
  Beef,
  IceCreamCone,
  Salad,
  Clock,
  Percent,
  Truck,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iFood Cupons — Descontos e códigos promocionais" },
      {
        name: "description",
        content:
          "Os melhores cupons iFood em um só lugar: descontos em restaurantes, mercado, farmácia e frete grátis. Copie o código e economize no seu pedido.",
      },
      { property: "og:title", content: "iFood Cupons — Descontos e códigos promocionais" },
      {
        property: "og:description",
        content:
          "Cupons iFood atualizados: descontos em restaurantes, mercado e frete grátis. Copie o código e economize.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Coupon = {
  code: string;
  title: string;
  description: string;
  tag: string;
  category: string;
  expires: string;
  highlight?: boolean;
};

const CATEGORIES = [
  { id: "todos", label: "Todos", icon: Sparkles },
  { id: "restaurantes", label: "Restaurantes", icon: Pizza },
  { id: "mercado", label: "Mercado", icon: Salad },
  { id: "lanches", label: "Lanches", icon: Beef },
  { id: "sobremesas", label: "Sobremesas", icon: IceCreamCone },
  { id: "frete", label: "Frete grátis", icon: Truck },
];

const COUPONS: Coupon[] = [
  {
    code: "BEMVINDO20",
    title: "20% OFF no primeiro pedido",
    description: "Válido para novos usuários em restaurantes selecionados. Desconto máximo de R$ 25.",
    tag: "Primeiro pedido",
    category: "restaurantes",
    expires: "Válido até 31/10",
    highlight: true,
  },
  {
    code: "FRETEGRATIS",
    title: "Frete grátis acima de R$ 30",
    description: "Entrega grátis em pedidos acima de R$ 30 em milhares de restaurantes parceiros.",
    tag: "Entrega",
    category: "frete",
    expires: "Válido hoje",
    highlight: true,
  },
  {
    code: "PIZZA15",
    title: "R$ 15 OFF em pizzarias",
    description: "Desconto em pedidos acima de R$ 50 nas pizzarias participantes da promoção.",
    tag: "Pizza",
    category: "restaurantes",
    expires: "Válido até sexta",
  },
  {
    code: "MERCADO10",
    title: "10% OFF no mercado",
    description: "Economize nas compras de mercado em pedidos acima de R$ 80. Limite de R$ 20 de desconto.",
    tag: "Mercado",
    category: "mercado",
    expires: "Válido até domingo",
  },
  {
    code: "BURGER25",
    title: "25% OFF em hamburguerias",
    description: "Válido de terça a quinta em lanches selecionados. Desconto máximo de R$ 18.",
    tag: "Lanches",
    category: "lanches",
    expires: "Válido até quinta",
  },
  {
    code: "DOCE5",
    title: "R$ 5 OFF em sobremesas",
    description: "Açaí, sorvetes e doces com desconto em pedidos acima de R$ 25.",
    tag: "Doces",
    category: "sobremesas",
    expires: "Válido até 20/10",
  },
  {
    code: "ALMOCO12",
    title: "R$ 12 OFF no almoço",
    description: "Válido de segunda a sexta, das 11h às 14h, em restaurantes com selo participante.",
    tag: "Almoço",
    category: "restaurantes",
    expires: "Válido esta semana",
  },
  {
    code: "ENTREGA0",
    title: "Entrega grátis no mercado",
    description: "Frete por conta da casa em compras de mercado acima de R$ 60.",
    tag: "Entrega",
    category: "frete",
    expires: "Válido hoje",
  },
];

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
    } catch {
      // clipboard indisponível: ainda assim mostra o feedback visual
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
        coupon.highlight ? "border-primary/40" : ""
      }`}
    >
      {coupon.highlight && (
        <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
          Destaque
        </span>
      )}
      <div className="flex-1 p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          <Tag className="h-3 w-3" />
          {coupon.tag}
        </span>
        <h3 className="mt-3 text-lg font-bold">{coupon.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{coupon.description}</p>
      </div>
      <div className="coupon-dash mx-5 h-0.5" />
      <div className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="font-mono text-base font-bold tracking-wider text-primary">{coupon.code}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {coupon.expires}
          </p>
        </div>
        <button
          onClick={copy}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
            copied
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

function Index() {
  const [active, setActive] = useState("todos");
  const filtered =
    active === "todos" ? COUPONS : COUPONS.filter((c) => c.category === active);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Percent className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              iFood <span className="text-primary">Cupons</span>
            </span>
          </div>
          <a
            href="#cupons"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ver cupons
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-glow">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            Cupons atualizados hoje
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Economize no seu próximo pedido no{" "}
            <span className="text-primary">iFood</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Reunimos os melhores cupons de desconto e frete grátis. É só copiar o
            código e aplicar no checkout.
          </p>
          <a
            href="#cupons"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]"
          >
            <Tag className="h-5 w-5" />
            Pegar meu cupom
          </a>
        </div>
      </section>

      {/* Filtros + Cupons */}
      <section id="cupons" className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((coupon) => (
            <CouponCard key={coupon.code} coupon={coupon} />
          ))}
        </div>
      </section>

      {/* Como usar */}
      <section className="border-t bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-3xl font-extrabold">Como usar seu cupom</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Copie o código",
                text: "Escolha o cupom ideal e clique em copiar para guardar o código.",
              },
              {
                step: "2",
                title: "Monte seu pedido",
                text: "Abra o app do iFood e adicione seus itens favoritos ao carrinho.",
              },
              {
                step: "3",
                title: "Aplique no checkout",
                text: "Cole o código no campo de cupom e veja o desconto na hora.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border bg-card p-6 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            iFood Cupons — os melhores descontos em um só lugar. Site não oficial,
            sem vínculo com o iFood.
          </p>
        </div>
      </footer>
    </div>
  );
}
