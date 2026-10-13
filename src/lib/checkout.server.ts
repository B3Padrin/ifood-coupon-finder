import postgres from "postgres";
import { PRODUCT, orderExternalId, amountToCents } from "./product";
import { getServerConfig } from "./config.server";
import { createDeposit, getDeposit } from "./veopag.server";
import { isValidCpf, onlyDigits } from "./cpf";

let sqlClient: ReturnType<typeof postgres> | undefined;
function db(){const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL ausente");return sqlClient??=postgres(url,{max:5,prepare:false});}
function creds(){const cfg=getServerConfig();if(!cfg.checkoutEnabled)throw new Error("Checkout não habilitado no servidor");return {cfg,auth:{clientId:cfg.veopagClientId!,clientSecret:cfg.veopagClientSecret!}};}
export async function userFromBearer(header:string|null){const token=/^Bearer (\S+)$/.exec(header??"")?.[1];if(!token)return null;const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return null;const res=await fetch(url.replace(/\/$/,"")+"/auth/v1/user",{headers:{apikey:key,Authorization:"Bearer "+token}});if(!res.ok)return null;const u=await res.json() as {id?:string;email?:string};return u.id&&u.email?{id:u.id,email:u.email}:null;}
export async function createOrResumeOrder(user:{id:string;email:string},payer:{name:string;document:string;phone?:string}){
 const {cfg,auth}=creds();if(payer.name.trim().length<3||!isValidCpf(payer.document))throw new Error("Dados do comprador inválidos");
 const sql=db();const rows=await sql`SELECT * FROM public.coupon_orders WHERE user_id=${user.id} AND status='PENDING' ORDER BY created_at DESC LIMIT 1`;
 let order=rows[0];
 if(!order){const id=crypto.randomUUID();const external=orderExternalId(id);const inserted=await sql`INSERT INTO public.coupon_orders (id,user_id,external_id) VALUES (${id},${user.id},${external}) ON CONFLICT DO NOTHING RETURNING *`;order=inserted[0]??(await sql`SELECT * FROM public.coupon_orders WHERE user_id=${user.id} AND status='PENDING' LIMIT 1`)[0];}
 if(!order)throw new Error("Não foi possível reservar o pedido");
 if(order.pix_code&&order.transaction_id)return {orderId:order.id,pixCode:order.pix_code,status:order.status};
 const deposit=await createDeposit(auth,{amount:PRODUCT.amountCents/100,externalId:order.external_id,callbackUrl:cfg.appBaseUrl!.replace(/\/$/,"")+"/api/veopag-webhook",payer:{name:payer.name.trim(),email:user.email,document:onlyDigits(payer.document),...(payer.phone?{phone:onlyDigits(payer.phone)}:{})}});
 await sql`UPDATE public.coupon_orders SET transaction_id=${deposit.transactionId},pix_code=${deposit.qrcode},updated_at=now() WHERE id=${order.id} AND status='PENDING'`;
 return {orderId:order.id,pixCode:deposit.qrcode,status:deposit.status};
}
export async function readOrder(userId:string,id:string){const rows=await db()`SELECT id,status,transaction_id,external_id FROM public.coupon_orders WHERE id=${id} AND user_id=${userId} LIMIT 1`;return rows[0]??null;}
export async function reconcileOrder(id:string){
 const {auth}=creds();const sql=db();const rows=await sql`SELECT * FROM public.coupon_orders WHERE id=${id} LIMIT 1`;const order=rows[0];if(!order)return null;
 if(order.status==='COMPLETED')return order;
 const snapshot=await getDeposit(auth,{external_id:order.external_id});
 if(!snapshot||snapshot.externalId!==order.external_id||amountToCents(snapshot.amount)!==PRODUCT.amountCents|| (order.transaction_id&&snapshot.transactionId!==order.transaction_id))return order;
 if(snapshot.status==='COMPLETED'){await sql.begin(async tx=>{
 const changed=await tx`UPDATE public.coupon_orders SET status='COMPLETED',transaction_id=${snapshot.transactionId},updated_at=now() WHERE id=${id} AND status<>'COMPLETED' RETURNING *`;
 if(changed.length){await tx`INSERT INTO public.coupon_memberships (user_id,order_id,starts_at,expires_at,status) VALUES (${order.user_id},${id},now(),now()+interval '30 days','ACTIVE') ON CONFLICT (user_id) DO UPDATE SET order_id=excluded.order_id,starts_at=excluded.starts_at,expires_at=excluded.expires_at,status='ACTIVE'`; }
 });}else if(snapshot.status==='FAILED'){await sql`UPDATE public.coupon_orders SET status='FAILED',updated_at=now() WHERE id=${id} AND status='PENDING'`;}
 return (await sql`SELECT * FROM public.coupon_orders WHERE id=${id}`)[0];
}
export async function membershipFor(userId:string){const rows=await db()`SELECT starts_at,expires_at,status FROM public.coupon_memberships WHERE user_id=${userId} LIMIT 1`;return rows[0]??null;}
