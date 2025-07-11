/**
 * Helper para validar rapidamente um voucher antes do resgate.
 * Retorna true se o voucher estiver liberado para resgate.
 */
export async function validateVoucher(code: string): Promise<boolean> {
  if (!code) return false

  try {
    const res = await fetch(`/api/voucher/validate-for-redeem/${code}`, {
      cache: "no-store",
    })
    return res.ok
  } catch {
    return false
  }
}
