import { createFileRoute } from "@tanstack/react-router";
import { membershipFor,userFromBearer } from "../../lib/checkout.server";
export const Route=createFileRoute("/api/my-membership")({server:{handlers:{GET:async({request})=>{
 const user=await userFromBearer(request.headers.get("authorization"));if(!user)return Response.json({error:"Não autenticado"},{status:401});
 try{const access=await membershipFor(user.id);return Response.json({access},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({error:"Consulta indisponível"},{status:503})}
}}}});