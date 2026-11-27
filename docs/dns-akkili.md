# Bascule DNS akkili.sn — préparation du 23/11/2026

Le domaine est désormais délégué à Cloudflare : statut `active` et nouveaux serveurs confirmés directement auprès du registre `.sn` le 23/11/2026. Certains résolveurs récursifs peuvent encore retourner les anciens NS OVH en cache. Les quatre applications ont répondu HTTP 200 ; les enregistrements MX et DKIM Brevo ont été contrôlés directement sur le serveur Cloudflare.

La zone contient les 23 enregistrements uniques de l’export OVH. Les 12 ajouts et les 11 ajustements de TTL ont été explicitement autorisés, appliqués puis vérifiés.

Les serveurs attribués par Cloudflare à cette zone sont :

- `matteo.ns.cloudflare.com`
- `phoenix.ns.cloudflare.com`

## Sous-domaines à conserver

Ces quatre CNAME ont été vérifiés dans le DNS public et sont maintenant présents dans Cloudflare :

| Nom | Cible actuelle |
| --- | --- |
| `bureau-dahiraconnect.akkili.sn` | `saa-dahira-bureau.pages.dev` |
| `pcym2nag2r.akkili.sn` | `saa-dahira-console.pages.dev` |
| `dahiraconnect.akkili.sn` | `saa-dahira.pages.dev` |
| `moutahabina.akkili.sn` | `dahiraconnect.pages.dev` |

La copie Cloudflare contient déjà le domaine racine, `www`, `ftp`, quatre MX OVH, le SPF, une vérification Google, `_dmarc` et le SRV d’autodécouverte de la messagerie. La comparaison complète de cette copie avec l’export reçu est détaillée ci-dessous.

## Export OVH reçu et comparé

Fichier fourni : `akkili.sn.zone`, numéro de série `2095429233`. Les 23 enregistrements uniques correspondent aux réponses DNS publiques ; le numéro de série public est également `2095429233`. Une ligne SPF strictement identique apparaît deux fois dans l’export et sera représentée par une seule entrée dans Cloudflare.

Les quatre priorités MX sont identiques : mx0 = 1, mx1 = 5, mx2 = 50, mx3 = 100. Le SRV d’autodécouverte correspond également. Aucun enregistrement supplémentaire ni conflit de cible n’a été trouvé dans Cloudflare.

### Modifications appliquées le 23/11/2026

| Type | Nom | Cible / valeur | TTL |
| --- | --- | --- | --- |
| `TXT` | `akkili.sn` | Vérification Brevo : valeur de l’export | 300 s |
| `CNAME` | `brevo1._domainkey.akkili.sn` | b1.akkili-sn.dkim.brevo.com | 300 s |
| `CNAME` | `brevo2._domainkey.akkili.sn` | b2.akkili-sn.dkim.brevo.com | 300 s |
| `CNAME` | `bureau-dahiraconnect.akkili.sn` | saa-dahira-bureau.pages.dev | 3600 s |
| `CNAME` | `dahiraconnect.akkili.sn` | saa-dahira.pages.dev | 3600 s |
| `CNAME` | `img.send.akkili.sn` | send-akkili-sn.img.brand.brevosend.com | 300 s |
| `CNAME` | `moutahabina.akkili.sn` | dahiraconnect.pages.dev | 3600 s |
| `CNAME` | `ovhmo-selector-1._domainkey.akkili.sn` | ovhmo-selector-1._domainkey.4549297.ct.dkim.mail.ovh.net | 3600 s |
| `CNAME` | `ovhmo-selector-2._domainkey.akkili.sn` | ovhmo-selector-2._domainkey.4549298.ct.dkim.mail.ovh.net | 3600 s |
| `CNAME` | `pcym2nag2r.akkili.sn` | saa-dahira-console.pages.dev | 3600 s |
| `CNAME` | `r.send.akkili.sn` | send-akkili-sn.r.brand.brevosend.com | 300 s |
| `CNAME` | `send.akkili.sn` | send-akkili-sn.brand.brevosend.com | 300 s |

Les 11 entrées déjà présentes ont conservé leurs valeurs et sont passées du TTL automatique à 3600 secondes, comme dans l’export. Toutes les entrées sont en DNS seul (`proxied=false`). Les NS et le SOA OVH n’ont pas été importés : Cloudflare gère ceux de sa propre zone.

Le changement de délégation OVH vers Cloudflare est maintenant confirmé. Aucun DS DNSSEC n’a été trouvé lors du contrôle public ; DNSSEC est désactivé dans la zone Cloudflare. Ces états devront être revérifiés au moment de changer les serveurs DNS.

**Application autorisée et vérifiée :** après accord explicite de l’utilisateur, les 12 créations et les 11 ajustements de TTL ont réussi. Une nouvelle lecture de l’API Cloudflare confirme 23/23 enregistrements conformes, aucune entrée supplémentaire, tous les TTL et priorités MX/SRV corrects, et le proxy désactivé partout. La zone était encore `pending` lors de la copie ; son activation et la délégation Cloudflare ont ensuite été confirmées.

## Avant de changer les serveurs DNS

1. Comparaison effectuée avec l’export OVH fourni (23 enregistrements uniques, tous conformes au DNS public). Revérifier le numéro de série si la bascule est différée.
2. Copie effectuée et vérifiée : 23/23 enregistrements conformes à l’export, cibles existantes conservées, aucun raccordement au Worker.
3. Vérifier l’état DNSSEC et les éventuels enregistrements DS chez le registraire avant toute modification des serveurs DNS.
4. Une fois la zone complète vérifiée, remplacer les serveurs DNS chez le registraire par les deux serveurs Cloudflare attribués ci-dessus. Contrôler ensuite l’activation de la zone, les quatre applications, le domaine racine et la messagerie.
5. Procéder séparément à la bascule des sites vers le Worker. Avant une route wildcard, créer des exclusions pour les applications existantes et tous les hôtes inventoriés. Tester Moutahabina et un second site, puis seulement activer la purge de `site-publier`.

Le changement de serveurs DNS dépend de l’accès au gestionnaire actuel du domaine. Aucun accès OVH n’est connecté à cette session ; la recherche d’intégration n’a pas trouvé de plugin OVH pertinent. La comparaison et la synchronisation de la zone complète sont terminées ; le changement de serveurs DNS est effectué et la prochaine étape est le raccordement du Worker de production.

La prévisualisation Worker sur `workers.dev` permet de contrôler le rendu serveur avant cette opération ; elle ne remplace pas les vérifications sur les domaines publics. Voir [worker-multisite.md](worker-multisite.md).

Pour fournir l’inventaire : dans OVHcloud, ouvrir **Domaines & DNS → akkili.sn → Zone DNS → Actions supplémentaires → Exporter la zone**, puis transmettre le fichier exporté. [Procédure officielle de sauvegarde de zone DNS](https://docs.ovhcloud.com/fr/guides/web-cloud/web-hosting/diagnostic-website-not-accessible).
