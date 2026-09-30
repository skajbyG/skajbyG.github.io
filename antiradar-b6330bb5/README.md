# Antiradar

Interní nástroj – najde podniky v okolí se zastaralým, nefunkčním nebo chybějícím webem a ukáže je na mapě.

**Odkaz:** https://skajbyg.github.io/antiradar-b6330bb5/

Stránka není nikde prolinkovaná, má `noindex` a náhodný název složky, takže se k ní dostane jen ten, kdo má odkaz.
Pozor: repozitář je veřejný, takže zdrojový kód je vidět na GitHubu. Pokud má být skrytý úplně, je potřeba repo přepnout na privátní (GitHub Pages z privátního repa vyžaduje placený plán) nebo aplikaci hostovat jinde.

## Jak to funguje

1. Aplikace se nejdřív zeptá na přístup k poloze (nebo můžeš zadat místo ručně; pravým klikem / dlouhým podržením na mapě přesuneš střed hledání).
2. Vybereš okruh (1–30 km) a klikneš **Najít**.
3. Z OpenStreetMap (Overpass API) se stáhnou všechny podniky v okruhu (obchody, služby, řemeslníci, kanceláře, ubytování, gastro…). Řetězce a velké značky se vynechávají.
4. Každý web se stáhne a automaticky ohodnotí **zašlost 0–100**: chybějící HTTPS, nepřizpůsobení mobilům, staré datum v patičce, tabulkový layout, `<font>`/Flash/rámy, FrontPage/Dreamweaver, stará jQuery / WordPress / Joomla, bezplatná subdoména, „ve výstavbě“, zaparkovaná doména, chybějící SEO údaje atd.
5. Na mapě se zobrazí jen podniky nad zvolenou hranicí zašlosti (posuvník vlevo dole). Fialové jsou podniky bez webu nebo jen s Facebookem.
6. Po kliknutí na špendlík se otevře detail: popis firmy (150–250 slov), plusy, mínusy a proč je to dobrý kandidát. Tlačítko **Kopírovat** zkopíruje vše do schránky.
7. V detailu nastavíš **stav obchodu** (Osloveno / Má zájem / Klient / Nemá zájem) a poznámku. Stav se ukáže jako štítek na špendlíku (O, Z, K, ×) a ukládá se jen v tomto prohlížeči. Odmítnuté firmy jde v legendě skrýt.
8. Weby, které se nepodařilo načíst, jsou šedé „?“. Tlačítkem **Zkusit znovu nenačtené** (po skenu) nebo **Zkusit načíst znovu** (v detailu) se analýza zopakuje.

## Nastavení (⚙️)

- **Claude API klíč** – když ho zadáš, popisy firem, plusy/mínusy a důvody napíše AI (Claude). Bez klíče se popis skládá automaticky z dat. Klíč zůstává jen v tvém prohlížeči (localStorage) a posílá se přímo na `api.anthropic.com`.
- **Google PageSpeed klíč** – pro tlačítko „Změřit rychlost“ (funguje i bez klíče, ale s velmi nízkým limitem).
- **Vlastní CORS proxy** – viz níže. Doporučeno pro spolehlivé výsledky.

## Vlastní proxy (doporučeno)

Prohlížeč nesmí přímo stahovat cizí weby (CORS), proto aplikace používá veřejné proxy (allorigins, corsproxy.io, codetabs). Ty bývají přetížené a některé weby pak skončí jako „?“ (nepodařilo se ověřit). Spolehlivější je vlastní proxy zdarma na Cloudflare Workers:

1. Na https://dash.cloudflare.com → Workers & Pages → Create Worker.
2. Vlož tento kód a nasaď:

```js
export default {
  async fetch(req) {
    const target = new URL(req.url).searchParams.get("url");
    const cors = { "Access-Control-Allow-Origin": "https://skajbyg.github.io" };
    if (!target || !/^https?:\/\//.test(target)) return new Response("missing url", { status: 400, headers: cors });
    try {
      const r = await fetch(target, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (Antiradar)" }, cf: { cacheTtl: 3600 } });
      const body = (await r.text()).slice(0, 800000);
      return new Response(body, { status: r.status, headers: { ...cors, "Content-Type": "text/plain; charset=utf-8" } });
    } catch (e) {
      return new Response("fetch failed", { status: 502, headers: cors });
    }
  }
};
```

3. V Nastavení aplikace vyplň „Vlastní CORS proxy“: `https://<tvuj-worker>.workers.dev/?url=`

## Omezení

- Data o podnicích jsou z OpenStreetMap – podnik, který v OSM chybí, aplikace nenajde. Pokrytí je nejlepší ve městech.
- Automatické hodnocení je orientační; před oslovením firmy web vždy projdi ručně.
- Velké okruhy (20–30 km) ve velkých městech znamenají stovky až tisíce podniků – načítání trvá déle a veřejné proxy mohou začít odmítat požadavky.
