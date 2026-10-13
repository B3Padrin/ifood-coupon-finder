import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LockKeyhole, TicketPercent, LoaderCircle } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/login")({ component: Login });
function Login() {
 const [mode,setMode]=useState<"login"|"signup"|"recovery">("login");
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [loading,setLoading]=useState(false);const [notice,setNotice]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setLoading(true);setNotice("");
 try{
 const address=email.trim().toLowerCase();
 if(mode==="recovery"){const {error}=await supabase.auth.resetPasswordForEmail(address,{redirectTo:window.location.origin+"/redefinir-senha"});if(error)throw error;setNotice("Se este e-mail estiver cadastrado, você receberá instruções para recuperar sua senha.");return;}
 if(password.length<8){setNotice("Use uma senha de pelo menos 8 caracteres.");return;}
 if(mode==="signup"){const {data,error}=await supabase.auth.signUp({email:address,password});if(error)throw error;
 if(!data.session){setNotice("Cadastro registrado, mas o servidor ainda exige confirmação de e-mail. Desative Confirm email no provedor Supabase para permitir acesso imediato.");return;}
 }else{const {error}=await supabase.auth.signInWithPassword({email:address,password});if(error)throw error;}
 window.location.assign("/membros");
 }catch{setNotice("Não foi possível concluir. Verifique seus dados ou tente novamente.");}finally{setLoading(false)}}
 return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12"><section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40"><Link to="/" className="mb-8 inline-flex items-center gap-2 font-black"><span className="rounded-xl bg-red-600 p-2 text-white"><TicketPercent size={20}/></span> Clube<span className="text-red-600">Cupons</span></Link><h1 className="text-3xl font-black">{mode==="signup"?"Criar conta":mode==="recovery"?"Recuperar senha":"Entre no seu clube"}</h1><p className="mt-3 text-sm text-slate-600">{mode==="signup"?"Cadastre-se com e-mail e senha. Não é necessário clicar em link de confirmação quando o provedor estiver configurado.":mode==="recovery"?"Enviaremos instruções de recuperação ao seu e-mail.":"Entre com seu e-mail e senha para consultar sua assinatura."}</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-bold">E-mail<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 outline-red-500"/></label>{mode!=="recovery"&&<label className="block text-sm font-bold">Senha<input type="password" required minLength={8} autoComplete={mode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-4 outline-red-500"/></label>}<button disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 font-bold text-white disabled:opacity-60">{loading?<LoaderCircle className="animate-spin" size={18}/>:<LockKeyhole size={18}/>} {mode==="signup"?"Criar conta":mode==="recovery"?"Enviar recuperação":"Entrar"}</button></form>{notice&&<p role="status" className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{notice}</p>}<div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-red-600"><button type="button" onClick={()=>{setMode(mode==="signup"?"login":"signup");setNotice("")}}>{mode==="signup"?"Já tenho conta":"Criar conta"}</button><button type="button" onClick={()=>{setMode(mode==="recovery"?"login":"recovery");setNotice("")}}>{mode==="recovery"?"Voltar ao login":"Esqueci minha senha"}</button></div><p className="mt-6 text-xs text-slate-500">Acesso aos benefícios somente após confirmação do pagamento pelo servidor.</p></section></main>;
}
