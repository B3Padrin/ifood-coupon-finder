import { describe,it,expect,vi } from "vitest";
import { createDeposit,getDeposit } from "./veopag.server";
import { membershipWindow,PRODUCT } from "./product";
import { verifySignature } from "./webhook.server";
import { createHmac } from "node:crypto";
const creds={clientId:"test-client",clientSecret:"test-secret"};
function mockFetch(status:number,payload:unknown){return vi.fn(async(url:string)=>new Response(JSON.stringify(String(url).includes("/auth/login")?{token:"test-token-123456789"}:payload),{status:String(url).includes("/auth/login")?200:status,headers:{"Content-Type":"application/json"}})) as unknown as typeof fetch;}
describe("VeoPag contracts",()=>{
 it("creates PIX with documented 201 response",async()=>{const f=mockFetch(201,{qrCodeResponse:{transactionId:"tx-1",status:"PENDING",qrcode:"00020126580014br.gov.bcb.pix",amount:19.9}});const d=await createDeposit(creds,{amount:19.9,externalId:"order-1",callbackUrl:"https://example.com/hook",payer:{name:"Teste Teste",email:"test@example.com",document:"52998224725"}},f);expect(d.status).toBe("PENDING");expect(d.qrcode).toContain("000201");expect(d.idempotent).toBe(false)});
 it("reads gateway status",async()=>{const f=mockFetch(200,{deposit:{transaction_id:"tx-2",external_id:"order-2",amount:19.9,status:"COMPLETED"}});const d=await getDeposit(creds,{external_id:"order-2"},f);expect(d?.status).toBe("COMPLETED")});
 it("rejects invalid signature and replay",()=>{const rawBody='{"status":"COMPLETED"}';const ts="1000";const secret="secret";const sig=createHmac("sha256",secret).update(ts+"."+rawBody).digest("hex");expect(verifySignature({rawBody,timestamp:ts,signature:sig,secret,nowSec:1000})).toBe("ok");expect(verifySignature({rawBody,timestamp:ts,signature:"bad",secret,nowSec:1000})).toBe("invalid");expect(verifySignature({rawBody,timestamp:ts,signature:sig,secret,nowSec:1400})).toBe("replay")});
 it("grants exactly 30 days",()=>{const date=new Date("2026-10-13T00:00:00Z");const w=membershipWindow(date);expect(w.expiresAt.getTime()-w.startsAt.getTime()).toBe(PRODUCT.accessDays*86400000)});
});