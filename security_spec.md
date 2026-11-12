# Security Specification — HUELLA VT (`huellasvt-16c36`)

## 1. Data Invariants
1. **Default Deny Catch-All**: Any path not explicitly matched in `firestore.rules` is strictly denied (`allow read, write: if false;`).
2. **Path ID Hardening**: Document IDs (`petId`, `sponsorId`, `adminId`) must match `^[a-zA-Z0-9_\-]+$` with length `<= 128`.
3. **Identity Integrity**: On `Pet` creation, `incoming().authorUid == request.auth.uid`, `incoming().id == petId`, and `request.auth.token.email_verified == true`.
4. **Strict Keys & Anti-Shadow-Fields**: Both `Pet` and `Sponsor` enforce `hasAll` for required keys and `hasOnly` for allowed keys on creation, and `affectedKeys().hasOnly(...)` on action-based updates.
5. **Volumetric String Boundaries**: Every string field enforces `.size() >= min && .size() <= max` (including `photoBase64 <= 450000` bytes for compressed WebP).
6. **Immortal Fields**: `id`, `authorUid`, and `createdAt` cannot be mutated during updates.
7. **Terminal State Locking**: Once a `Pet` reaches `status == 'resolved'`, non-admin users cannot mutate it further.
8. **Admin Privilege Verification**: Admin privileges require either the verified bootstrap email (`hz.mdiego@gmail.com` with `email_verified == true`) or an explicit document in `/admins/$(request.auth.uid)`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Payload 1 (Identity Spoofing)**: Authenticated user `uid_A` attempts to create a `/pets/pet-1` document with `authorUid: "uid_B"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Spoof)**: Attacker with `email: "hz.mdiego@gmail.com"` but `email_verified: false` attempts to create a `/sponsors/spon-1` document. -> `PERMISSION_DENIED`
3. **Payload 3 (Shadow Field Injection)**: Authenticated user creates `/pets/pet-2` including an undeclared field `"isSuperFeatured": true`. -> `PERMISSION_DENIED`
4. **Payload 4 (Denial-of-Wallet Oversized String)**: Authenticated user creates `/pets/pet-3` with `description` of 10,000 characters (`> 400`). -> `PERMISSION_DENIED`
5. **Payload 5 (ID Poisoning)**: Authenticated user creates `/pets/pet$bad!id` containing disallowed characters. -> `PERMISSION_DENIED`
6. **Payload 6 (Immortal Field Mutation)**: Pet creator attempts to update `createdAt` or `authorUid` on `/pets/pet-1`. -> `PERMISSION_DENIED`
7. **Payload 7 (Terminal State Re-opening)**: Non-admin pet creator attempts to update `/pets/pet-resolved` after `status` is already `'resolved'`. -> `PERMISSION_DENIED`
8. **Payload 8 (Unauthorized Cross-User Update)**: User `uid_B` attempts to mark User `uid_A`'s pet `/pets/pet-1` as `'resolved'`. -> `PERMISSION_DENIED`
9. **Payload 9 (Value Poisoning on Update)**: Pet creator updates whitelisted field `status` to `"hacked_status"` (not in `['lost', 'found', 'adoption', 'resolved']`). -> `PERMISSION_DENIED`
10. **Payload 10 (Non-Admin Sponsor Write)**: Regular authenticated user attempts to create or update `/sponsors/spon-1`. -> `PERMISSION_DENIED`
11. **Payload 11 (Self-Admin Escalation)**: Authenticated user attempts to write `/admins/uid_A` to grant themselves admin rights. -> `PERMISSION_DENIED`
12. **Payload 12 (Inactive Sponsor Read Leak)**: Unauthenticated user attempts to read `/sponsors/spon-inactive` where `isActive == false`. -> `PERMISSION_DENIED`
