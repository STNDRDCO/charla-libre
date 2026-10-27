"use client";
export function Retirar({ accion, token }: { accion: (f: FormData) => Promise<void>; token: string }) {
  return (
    <form action={accion} onSubmit={e => { if (!confirm("¿Retirar la charla? Deja de aparecer y no se puede reservar. Podés volver cuando quieras.")) e.preventDefault(); }}>
      <input type="hidden" name="token" value={token} />
      <button className="boton chico peligro">Retirar</button>
    </form>
  );
}
