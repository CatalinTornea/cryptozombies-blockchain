# Proiect Final — CryptoZombies Extended

Acest document descrie cele **2 funcționalități noi** implementate pentru nota la materia Blockchain.

## Funcționalitatea 1: Hrănire cu pradă rară (+ niveluri bonus)

**Contract:** `ZombieFeeding.sol`

Când un zombie se hrănește cu specii mai rare decât kitty-urile, primește niveluri bonus:

| Specie  | Bonus nivel | Suffix ADN (ultimele 2 cifre) |
|---------|-------------|-------------------------------|
| kitty   | 0           | 99                            |
| dog     | +1          | 77                            |
| dragon  | +2          | 88                            |
| alien   | +2          | 88                            |

**Funcții noi:**
- `feedOnPrey(zombieId, targetDna, species)` — hrănire publică cu pradă rară
- `RarePreyFed` event — emis la bonus de nivel

**Exemplu din cerință:** *„dacă zombie-ul mănâncă ceva mai rar decât kitties, urcă 2 nivele”* — implementat pentru `dragon` și `alien`.

## Funcționalitatea 2: Magazin de abilități speciale

**Contract:** `ZombieSkills.sol` (în lanțul de moștenire, înainte de `ZombieAttack`)

Fiecare zombie poate cumpăra **o singură abilitate** cu ETH:

| ID | Nume      | Preț      | Efect                                      |
|----|-----------|-----------|--------------------------------------------|
| 1  | Berserk   | 0.005 ETH | +15% șanse de victorie la atac             |
| 2  | Fortress  | 0.003 ETH | La înfrângere, nu intră în cooldown         |
| 3  | Swift     | 0.004 ETH | Cooldown redus la jumătate (12h în loc 24h)|

**Funcții noi:**
- `buySkill(zombieId, skillId)` — cumpărare abilitate
- `setSkillPrice(skillId, price)` — doar owner contract
- Câmp nou în structura `Zombie`: `specialSkill`

## Teste

```bash
npm test
```

Teste dedicate:
- `test/ZombieRarePrey.test.ts` — Feature 1
- `test/ZombieSkills.test.ts` — Feature 2

## Demo (local)

**Important pe Windows:** intră întâi în folderul proiectului (acolo e `package.json`):

```powershell
cd "C:\Users\Catalin\Desktop\block\AlucardTeaching-cryptozombies-boilerplate-2e5f129"
```

Pe PowerShell, variabilele de mediu se setează cu `$env:NUME="valoare"`, nu cu sintaxa Linux `NUME=valoare npm ...`.

**Terminal 1:**
```powershell
npm run node
```

**Terminal 2:**
```powershell
npm run deploy:local
$env:ZOMBIE_NAME="Warrior"; npm run interact:create
npm run interact:get
```

**Test Feature 1 — pradă rară (+2 nivele):**
```powershell
# După cooldown (24h pe rețeaua locală) sau rulează npm test pentru demo rapid
$env:ZOMBIE_ID="0"; $env:PREY_DNA="555555555555555500"; $env:PREY_SPECIES="dragon"; npm run interact:feedrare
npm run interact:get
```

**Test Feature 2 — cumpără abilitate:**
```powershell
$env:ZOMBIE_ID="0"; $env:SKILL_ID="1"; npm run interact:buyskill
npm run interact:get
```

Vezi și `WINDOWS_DEMO.ps1` pentru lista completă de comenzi.

## Prezentare la laborator

1. Rulează `npm test` — arată că toate testele trec (55 + teste noi)
2. Demonstrează `interact:feedrare` cu `dragon` — nivelul zombie-ului crește cu 2
3. Demonstrează `interact:buyskill` — skill apare în `interact:get`
4. Explică pe scurt contractele și moștenirea (`ZombieSkills` în lanț)

## Structura moștenirii (actualizată)

```
ZombieFactory → ZombieFeeding → ZombieSkills → ZombieHelper → ZombieAttack → ZombieOwnership
```
