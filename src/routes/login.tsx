import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, TicketPercent, LoaderCircle } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/login")({ component: Login });
function Login() {
 const [email,setEmail]=useState(""); const [loading,setLoading]=useState(false); const [notice,setNotice]=useState(""); 
 async function signIn(e:React.FormEvent){e.preventDefault();setLoading(true);setNotice("");try{
 const {error}=await supabase.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{emailRedirectTo:window.location.origin+"/membros",shouldCreateUser:true}});
 if(error) throw error;setNotice("Enviamos um link de acesso para seu e-mail. Verifique também a pasta de spam.");
 }catch{setNotice("Não foi possível enviar o link. Confira o e-mail e tente novamente.");}finally{setLoading(false)}}
 return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12"><section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40"><Link to="/" className="mb-8 inline-flex items-center gap-2 font-black text-slate-900"><span className="rounded-xl bg-red-600 p-2 text-white"><TicketPercent size={20}/></span> Clube<span className="text-red-600">Cupons</span></Link><h1 className="text-3xl font-black">Entre no seu clube</h1><p className="mt-3 text-slate-600">Receba um link seguro no e-mail para acessar sua conta. Não é necessário criar senha.</p><form onSubmit={signIn} className="mt-7 space-y-4"><label htmlFor="email" className="block text-sm font-bold">Seu e-mail</label><div className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 focus-within:ring-2 focus-within:ring-red-500"><Mail size={18} className="text-slate-400"/><input id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com" className="min-h-12 w-full outline-none"/></div><button disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 font-bold text-white hover:bg-red-700 disabled:opacity-60">{loading?<LoaderCircle className="animate-spin" size={18}/>:<Mail size={18}/>} Enviar link de acesso</button></form>{notice&&<p role="status" className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{notice}</p>}<p className="mt-6 text-center text-xs text-slate-500">Acesso sujeito à confirmação do pagamento e validade de 30 dias.</p></section></main>;
}
