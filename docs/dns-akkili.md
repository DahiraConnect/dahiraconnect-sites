# Bascule DNS akkili.sn — préparation du 23/11/2026

La zone publique utilise encore `ns200.anycast.me` et `dns200.anycast.me` (OVH). La zone Cloudflare du compte connecté est en attente d’activation et contient seulement 11 enregistrements. Aucun serveur DNS ni enregistrement public n’a été modifié pendant cette préparation.

Les serveurs attribués par Cloudflare à cette zone sont :

- `matteo.ns.cloudflare.com`
- `phoenix.ns.cloudflare.com`

## Sous-domaines à conserver

Ces quatre CNAME ont été vérifiés dans le DNS public et sont absents de la copie Cloudflare actuelle :

| Nom | Cible actuelle |
| --- | --- |
| `bureau-dahiraconnect.akkili.sn` | `saa-dahira-bureau.pages.dev` |
| `pcym2nag2r.akkili.sn` | `saa-dahira-console.pages.dev` |
| `dahiraconnect.akkili.sn` | `saa-dahira.pages.dev` |
| `moutahabina.akkili.sn` | `dahiraconnect.pages.dev` |

La copie Cloudflare contient déjà le domaine racine, `www`, `ftp`, quatre MX OVH, le SPF, une vérification Google, `_dmarc` et le SRV d’autodécouverte de la messagerie. Cette copie ne constitue pas un inventaire complet de la zone OVH.

## Avant de changer les serveurs DNS

1. Exporter la zone complète depuis le gestionnaire DNS OVH et la comparer à la zone Cloudflare, en conservant types, cibles, priorités MX/SRV, TTL, sous-domaines et valeurs TXT. Vérifier aussi les entrées DKIM/Brevo et les éventuels services absents de la liste ci-dessus.
2. Copier les enregistrements manquants dans Cloudflare sans remplacer leurs cibles par le Worker. Conserver d’abord le fonctionnement actuel des sites et de la messagerie.
3. Vérifier l’état DNSSEC et les éventuels enregistrements DS chez le registraire avant toute modification des serveurs DNS.
4. Une fois la zone complète vérifiée, remplacer les serveurs DNS chez le registraire par les deux serveurs Cloudflare attribués ci-dessus. Contrôler ensuite l’activation de la zone, les quatre applications, le domaine racine et la messagerie.
5. Procéder séparément à la bascule des sites vers le Worker. Avant une route wildcard, créer des exclusions pour les applications existantes et tous les hôtes inventoriés. Tester Moutahabina et un second site, puis seulement activer la purge de `site-publier`.

Le changement de serveurs DNS dépend de l’accès au gestionnaire actuel du domaine. Aucun accès OVH n’est connecté à cette session ; la recherche d’intégration n’a pas trouvé de plugin OVH pertinent. Ne pas supposer que les 11 entrées Cloudflare suffisent pour cette bascule.

La prévisualisation Worker sur `workers.dev` permet de contrôler le rendu serveur avant cette opération ; elle ne remplace pas les vérifications sur les domaines publics. Voir [worker-multisite.md](worker-multisite.md).

Pour fournir l’inventaire : dans OVHcloud, ouvrir **Domaines & DNS → akkili.sn → Zone DNS → Actions supplémentaires → Exporter la zone**, puis transmettre le fichier exporté. [Procédure officielle de sauvegarde de zone DNS](https://docs.ovhcloud.com/fr/guides/web-cloud/web-hosting/diagnostic-website-not-accessible).
