export function FreeDeliveryBadge() {
 return <div className="inline-flex max-w-full items-center gap-1.5 rounded-xl bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-[#16A34A] transition-transform duration-200 hover:-translate-y-0.5">
  <svg width="25" height="21" viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0">
   <path d="M7 25h7l5-10h10l6 10h5" stroke="#16A34A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
   <circle cx="13" cy="27" r="5" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2.6"/><circle cx="36" cy="27" r="5" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2.6"/>
   <path d="m20 15 5 8h10l-4-8h-11Z" fill="#86EFAC" stroke="#16A34A" strokeWidth="2"/>
   <path d="m22 11 4 4-5 5m5-5 4 2" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"/>
   <circle cx="24" cy="7" r="4" fill="#16A34A"/><path d="M20 5h9" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round"/>
   <path d="M29 12h7v8h-7z" fill="#BBF7D0" stroke="#16A34A" strokeWidth="1.7"/>
  </svg><span>+ Frete Grátis</span>
 </div>;
}
