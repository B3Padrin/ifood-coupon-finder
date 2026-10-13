import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/privacidade")({component:Page});
function Page(){return <main className="mx-auto max-w-2xl px-5 py-16"><h1 className="text-3xl font-black">Política de Privacidade</h1><p className="mt-5 text-slate-600">Documento em elaboração. As informações de tratamento de dados serão publicadas antes da coleta de dados pessoais e da abertura das vendas.</p><Link to="/" className="mt-6 inline-block font-bold text-red-600">Voltar</Link></main>}
