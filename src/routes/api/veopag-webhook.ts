import { createFileRoute } from "@tanstack/react-router";
import { getServerConfig } from "../../lib/config.server";
import { handleVeopagWebhook } from "../../lib/webhook.server";
import { reconcileOrder } from "../../lib/checkout.server";
import postgres from "postgres";
export const Route=createFileRoute("/api/veopag-webhook")({server:{handlers:{POST:async({request})=>{
 const cfg=getServerConfig();if(!cfg.checkoutEnabled||!process.env.DATABASE_URL)return new Response("unavailable",{status:503});
 const sql=postgres(process.env.DATABASE_URL,{max:1,prepare:false});
 try{
 const result=await handleVeopagWebhook({rawBody:await request.text(),headers:request.headers},{
 secret:cfg.webhookSignature!,callbackToken:cfg.callbackToken,nowSec:Math.floor(Date.now()/1000),
 recordEvent:async()=> "new",
 markProcessed:async()=>{},
 findOrder:async id=>{const rows=await sql`SELECT id,amount_cents,status FROM public.coupon_orders WHERE id=${id}`;return rows[0] as {id:string;amount_cents:number;status:string}|undefined??null},
 confirm:async id=>{const updated=await reconcileOrder(id);return updated?.status==="COMPLETED"?"ok":"pending"},
 fail:async id=>{await sql`UPDATE public.coupon_orders SET status='FAILED' WHERE id=${id} AND status='PENDING'`;return "ok"},
 queryGateway:async txId=>{const {getDeposit}=await import("../../lib/veopag.server");return getDeposit({clientId:cfg.veopagClientId!,clientSecret:cfg.veopagClientSecret!},{transaction_id:txId})}
 });
 return new Response(result.body,{status:result.status});
 }catch(e){console.error("webhook processing error",e instanceof Error?e.message:"unknown");return new Response("retry",{status:503})}finally{await sql.end()}
}}}});