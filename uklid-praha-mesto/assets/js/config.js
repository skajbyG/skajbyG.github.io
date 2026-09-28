// Nastavení webu Úklid Praha Město.
//
// backend: 'demo'     – vše se ukládá jen v tomto prohlížeči (IndexedDB). Vhodné pro
//                       vyzkoušení; data NEJSOU sdílená mezi zařízeními.
//          'supabase' – ostrý provoz. Fotky a záznamy se ukládají do Supabase, takže
//                       zaměstnanec nahraje z mobilu a klient to hned uvidí u sebe.
//                       Návod je v README.md a databázové schéma v supabase/schema.sql.
export const CONFIG = {
  backend: 'demo',
  supabaseUrl: '',      // např. 'https://abcd1234.supabase.co'
  supabaseAnonKey: '',  // veřejný (anon / publishable) klíč projektu

  company: {
    name: 'Úklid Praha Město',
    legalName: 'Úklid Praha Město, s.r.o.',
    phone: '+420 775 724 032',
    email: 'uklidprahamesto@seznam.cz',
    address: 'Moskevská ev. č. 189, Praha 10 – Vršovice',
  },
};
