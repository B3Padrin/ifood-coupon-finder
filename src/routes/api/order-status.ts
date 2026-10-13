import { createFileRoute } from "@tanstack/react-router";
import { readOrder,reconcileOrder,userFromBearer } from "../../lib/checkout.server";
export const Route=createFileRoute("/api/order-status")({server:{handlers:{GET:async({request})=>{
 const user=await userFromBearer(request.headers.get("authorization"));if(!user)return Response.json({error:"Não autenticado"},{status:401});
 const id=new URL(request.url).searchParams.get("id")??"";if(!/^[a-f0-9-]{36}$/i.test(id))return Response.json({error:"Pedido inválido"},{status:400});
 const order=await readOrder(user.id,id);if(!order)return Response.json({error:"Pedido não encontrado"},{status:404});
 try{const updated=await reconcileOrder(id);return Response.json({status:updated?.status??order.status},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({status:order.status},{headers:{"Cache-Control":"no-store"}})}
}}}});