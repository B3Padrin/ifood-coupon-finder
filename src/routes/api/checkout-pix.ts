import { createFileRoute } from "@tanstack/react-router";
import { createOrResumeOrder,userFromBearer } from "../../lib/checkout.server";
export const Route=createFileRoute("/api/checkout-pix")({server:{handlers:{POST:async({request})=>{
 const user=await userFromBearer(request.headers.get("authorization"));if(!user)return Response.json({error:"Faça login para continuar"},{status:401});
 try{const body=await request.json();const data=await createOrResumeOrder(user,{name:String(body.name??""),document:String(body.document??""),phone:body.phone?String(body.phone):undefined});return Response.json(data,{headers:{"Cache-Control":"no-store"}})}catch(e){console.error("PIX creation failed",e instanceof Error?e.message:"unknown");return Response.json({error:"Não foi possível criar cobrança. Verifique a configuração do servidor."},{status:503})}
}}}});