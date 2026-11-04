const importPage = () => import('src/pages/venture-debt/venture-debt-page');
let page: ReturnType<typeof importPage> | undefined;

export function loadVentureDebtPage() {
  page ??= importPage().catch(error => {
    page = undefined;
    throw error;
  });
  return page;
}

export function preloadVentureDebtPage() {
  void loadVentureDebtPage().catch(() => { /* Navigation can retry a failed preload. */ });
}
