# Deploy di produzione

Il sito viene compilato e pubblicato automaticamente sulla VM Azure a ogni push sul branch `main`.

## Architettura

- GitHub Actions compila il progetto con Node.js 22.
- La build statica viene letta da `dist/wita/browser`.
- Ogni commit crea una directory in `/var/www/wita/releases/<commit>`.
- Il link `/var/www/wita/current` viene aggiornato atomicamente.
- Nginx pubblica il contenuto puntato da `current`.
- Le cinque release più recenti vengono conservate per consentire un rollback.

## Configurazione iniziale della VM

Accedere come `witauser` e installare Nginx:

```bash
sudo apt update
sudo apt install -y nginx
```

Creare l'utente dedicato al deploy e le directory del sito:

```bash
sudo adduser --disabled-password --gecos "" wita-deploy
sudo install -d -o wita-deploy -g www-data -m 2755 /var/www/wita
sudo install -d -o wita-deploy -g www-data -m 2755 /var/www/wita/releases
sudo install -d -o wita-deploy -g wita-deploy -m 700 /home/wita-deploy/.ssh
```

Creare una pagina provvisoria e il primo collegamento `current`:

```bash
sudo -u wita-deploy mkdir -p /var/www/wita/releases/bootstrap
printf '%s\n' '<!doctype html><html lang="it"><title>Wita</title><h1>Wita</h1><p>Deploy in preparazione.</p></html>' | sudo tee /var/www/wita/releases/bootstrap/index.html
sudo chown -R wita-deploy:www-data /var/www/wita/releases/bootstrap
sudo -u wita-deploy ln -sfn /var/www/wita/releases/bootstrap /var/www/wita/current
```

La configurazione `deploy/nginx/wita.care.conf` deve essere copiata in `/etc/nginx/sites-available/wita.care`.

Attivarla con:

```bash
sudo ln -sfn /etc/nginx/sites-available/wita.care /etc/nginx/sites-enabled/wita.care
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

## Chiave dedicata a GitHub Actions

La pipeline non deve utilizzare la chiave SSH personale di un amministratore. Generare sul computer locale una nuova chiave dedicata:

```powershell
ssh-keygen -t ed25519 -C "github-actions-wita-deploy" -f "$env:USERPROFILE\.ssh\wita_github_actions_ed25519_unencrypted"
```

Quando `ssh-keygen` richiede la passphrase, premere `Invio` due volte senza digitare nulla. La chiave deve essere priva di passphrase perché verrà usata in modo non interattivo. Copiare solo il file `.pub` sulla VM e installarlo come:

```text
/home/wita-deploy/.ssh/authorized_keys
```

Impostare quindi:

```bash
sudo chown -R wita-deploy:wita-deploy /home/wita-deploy/.ssh
sudo chmod 700 /home/wita-deploy/.ssh
sudo chmod 600 /home/wita-deploy/.ssh/authorized_keys
```

## GitHub Environment

Creare nel repository un environment chiamato `production` e aggiungere questi secret:

- `WITA_DEPLOY_PRIVATE_KEY`: contenuto completo della chiave privata dedicata.
- `WITA_SSH_KNOWN_HOSTS`: riga della VM presente nel file locale `~/.ssh/known_hosts`.

La chiave privata non deve mai essere aggiunta al repository.

## DNS e HTTPS

Prima del cambio DNS, verificare il sito tramite l'indirizzo IP della VM. Quando il record DNS di `wita.care` punterà alla VM, configurare il certificato TLS e il redirect HTTPS. Le porte TCP 80 e 443 devono essere consentite sia dal firewall Azure sia dal firewall della VM, se attivo.

## Rollback

Elencare le release:

```bash
ls -1dt /var/www/wita/releases/*
```

Attivare una release precedente:

```bash
sudo -u wita-deploy ln -sfn /var/www/wita/releases/<commit> /var/www/wita/current.next
sudo -u wita-deploy mv -Tf /var/www/wita/current.next /var/www/wita/current
```
