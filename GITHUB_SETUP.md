# Cum pui proiectul pe GitHub (repo privat)

Cerința lab: **repository privat** pe GitHub cu tot codul proiectului final.

---

## Pasul 1 — Instalează Git (obligatoriu)

1. Descarcă: https://git-scm.com/download/win
2. Instalează (Next → Next, lasă opțiunile default)
3. **Închide și redeschide PowerShell** (sau Cursor)
4. Verifică:

```powershell
git --version
```

Trebuie să vezi ceva de genul `git version 2.x.x`.

---

## Pasul 2 — Cont GitHub

1. Mergi la https://github.com/signup dacă nu ai cont
2. Confirmă emailul

---

## Pasul 3 — Creează repository PRIVAT (pe site)

1. https://github.com/new
2. **Repository name:** `cryptozombies-blockchain` (sau alt nume)
3. **Visibility:** Private
4. **NU** bifa „Add a README” (ai deja cod local)
5. Click **Create repository**
6. Notează URL-ul, ex: `https://github.com/TU_USER/cryptozombies-blockchain.git`

---

## Pasul 4 — Upload cod din PowerShell

Deschide PowerShell în folderul proiectului:

```powershell
cd "C:\Users\Catalin\Desktop\block\AlucardTeaching-cryptozombies-boilerplate-2e5f129"
```

### 4a. Inițializează git (prima dată)

```powershell
git init
git add .
git status
```

Verifică că **NU** apar în listă: `node_modules`, `.env`, `artifacts`, `cache`.

### 4b. Primul commit

```powershell
git commit -m "Proiect final Blockchain: CryptoZombies cu prada rara si skills shop"
```

La primul commit poate cere nume/email (o singură dată):

```powershell
git config user.email "emailul-tau@example.com"
git config user.name "Catalin"
```

(apoi rulează din nou `git commit`)

### 4c. Conectează la GitHub și push

Înlocuiește `TU_USER` și `NUME_REPO` cu ale tale:

```powershell
git branch -M main
git remote add origin https://github.com/TU_USER/NUME_REPO.git
git push -u origin main
```

Te va întreba să te loghezi:
- **Recomandat:** browser login (Git Credential Manager)
- Sau **Personal Access Token** ca parolă (nu parola contului GitHub)

#### Token GitHub (dacă cere parolă)

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → bifează `repo`
3. Copiază tokenul și folosește-l ca **parolă** la `git push`

---

## Pasul 5 — Verificare

1. Deschide repo-ul pe GitHub în browser
2. Trebuie să vezi: `contracts/`, `test/`, `scripts/`, `FINAL_PROJECT.md`, `package.json`
3. Repo trebuie să aibă eticheta **Private**

---

## Ce NU urca pe GitHub

| Fișier | Motiv |
|--------|--------|
| `.env` | chei private / RPC |
| `node_modules/` | prea mare, se regenerează cu `npm install` |
| `artifacts/`, `cache/` | generate de Hardhat |

Acestea sunt deja în `.gitignore`.

---

## Update-uri ulterioare (după ce modifici cod)

```powershell
cd "C:\Users\Catalin\Desktop\block\AlucardTeaching-cryptozombies-boilerplate-2e5f129"
git add .
git commit -m "Descriere modificare"
git push
```

---

## Invită profesorul (opțional)

Repo privat → Settings → Collaborators → Add people → email/username profesor.

---

## Probleme frecvente

**`git` nu e recunoscut** → reinstalează Git, redeschide terminalul.

**`remote origin already exists`** → `git remote set-url origin https://github.com/TU_USER/NUME_REPO.git`

**Push rejected** → repo-ul GitHub are README creat; rulează:
`git pull origin main --allow-unrelated-histories`
apoi `git push`.
