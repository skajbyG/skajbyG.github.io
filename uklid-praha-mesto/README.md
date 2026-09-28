# Úklid Praha Město – web a kontrola úklidu

Statický web (GitHub Pages) na adrese `https://skajbyg.github.io/uklid-praha-mesto/`.

| Stránka | K čemu slouží |
|---|---|
| `index.html` | Prezentace firmy: služby, proč my, postup, kontakt a poptávka (otevře e-mail). |
| `kontrola.html` | **Zkontrolovat úklid** – klient zadá přístupový kód a uvidí kdy, kde, jak dlouho, kdo uklízel, co se udělalo a fotky před / po (včetně porovnání posuvníkem). Odkaz `kontrola.html?kod=UPM-XXXX-XXXX` přihlásí rovnou. |
| `zamestnanci.html` | Zaměstnanecká sekce – zápis úklidu z mobilu (čas, práce, fotky z fotoaparátu nebo galerie), přehled záznamů, správa klientů a jejich kódů. |

## Režimy

Nastavuje se v `assets/js/config.js`.

### `demo` (výchozí)
Vše se ukládá jen do prohlížeče (IndexedDB), je připraven ukázkový klient s kódem **DEMO-2026**.
Zaměstnanec se přihlásí libovolným jménem a PINem **1234**.
Slouží jen k vyzkoušení – co nahraje zaměstnanec na svém telefonu, klient na jiném zařízení **neuvidí**.

### `supabase` (ostrý provoz)
Data i fotky jsou v databázi Supabase (bezplatný tarif stačí), takže záznam z mobilu zaměstnance klient hned vidí u sebe.

1. Založte projekt na [supabase.com](https://supabase.com).
2. V **SQL Editoru** spusťte celý soubor `supabase/schema.sql`.
3. Pro každého zaměstnance: **Authentication → Users → Add user** (e-mail + heslo), pak v SQL:
   ```sql
   insert into public.employees (user_id, name)
   select id, 'Jana Dvořáková' from auth.users where email = 'jana@example.cz';
   ```
4. V `assets/js/config.js` nastavte `backend: 'supabase'`, `supabaseUrl` a `supabaseAnonKey`
   (Project Settings → API). Anon klíč je veřejný, data chrání pravidla RLS ze schématu.
5. Klienty zakládají zaměstnanci v záložce **Klienti** – kód a odkaz pro klienta tam jdou zkopírovat.

**Bezpečnost:** klient bez účtu vidí jen data ke svému kódu (funkce `client_portal`). Kódy mají 8 náhodných znaků.
Fotky leží ve veřejném úložišti pod náhodnými cestami – zobrazí se jen tomu, kdo zná odkaz.
Zaměstnanci musí být v tabulce `employees`, jinak se do sekce nedostanou.

## Technika
Čisté HTML/CSS/JS bez sestavování. 3D bubliny: Three.js r128 (cdnjs), vlastní shader, pauza mimo obrazovku,
respektuje `prefers-reduced-motion`. Fotky se před nahráním zmenšují na max. 1600 px (JPEG).
