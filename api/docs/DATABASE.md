# Database Architecture Documentation

This system utilizes a **PostgreSQL** relational database managed via **Prisma ORM**. The schema is optimized for a high-concurrency, limited-stock product drop scenario, prioritizing strict data integrity, trace mutations, and highly efficient lookup boundaries.

---

## Core Data Models

### 1. User Model
Represents individual customers authenticated within the platform.
* `id` (String, UUID, PK): Unique identification key.
* `email` (String, Unique): User's authenticated email communication link.
* `password` (String): Securely hashed credential string.
* `createdAt` / `updatedAt`: Standard tracking dimensions.

### 2. Product Model
Represents limited-stock drop catalog items.
* `id` (String, UUID, PK): Unique item identification key.
* `title` (String): Product display title.
* `price` (Int): Item cost stored in the lowest currency unit (e.g., cents) to prevent floating-point calculation errors.
* `totalStock` (Int): Original starting inventory allocation volume.
* `availableStock` (Int): Real-time counter representing unreserved inventory units available for transaction execution.

### 3. Reservation Model
Temporary, short-lived transactional allocations designed to isolate and hold specific inventory chunks while a checkout payload processes.
* `id` (String, UUID, PK): Unique reservation tracker.
* `userId` (String, FK): Reference to the acquiring `User`.
* `productId` (String, FK): Reference to the targeted `Product`.
* `status` (Enum: `PENDING`, `COMPLETED`, `EXPIRED`): The precise life-cycle stage of the stock allocation block.
* `expiresAt` (DateTime): Boundary timestamp marking exactly when a pending hold lapses and re-enters the active inventory pool.

### 4. Order Model
Permanent operational records establishing completed sales.
* `id` (String, UUID, PK): Unique system order identifier.
* `userId` (String, FK): Purchaser tracking link.
* `reservationId` (String, FK, Unique): A strict **1:1 mapping** link pointing back to the foundational reservation instance to ensure no order is ever instantiated without an active hold.
* `totalAmount` (Int): Financial capture volume.

### 5. InventoryLog Model
An immutable audit log tracking every micro-mutation occurring against our stock quantities to aid ledger balancing and support high-throughput analytical insights.
* `id` (String, UUID, PK): Unique entry record ID.
* `productId` (String, FK): Targeted stock entity.
* `delta` (Int): Signed variance tracking value (e.g., `-1` for a new hold acquisition, `+1` for an expiration reclaim mutation).
* `reason` (String): Contextual metadata text tag (`RESERVATION_HOLD`, `CRON_EXPIRED_RECLAIM`, etc.).

---

## Performance Tuning & Concurrency Guardrail Indices

To sustain stable operations during rapid-fire, high-concurrency request drops, the persistence boundary establishes explicit compound performance indexing layers:

### ⚡ `@@index([status, expiresAt])`
* **Target Entity:** `Reservation`
* **Strategic Focus:** Drastically optimizes background automation performance. The background cleanup cron worker continuously queries the database looking for entries matching `status === PENDING` and `expiresAt < NOW()`. This composite index converts heavy database tablespaces searches into lightning-fast, high-efficiency range scans.

### ⚡ `@@index([userId, productId])`
* **Target Entity:** `Reservation`
* **Strategic Focus:** Eliminates multiple concurrent allocation exploits. Enables immediate structural visibility when scanning user histories to block overlapping pending reservations before initiating heavy database level raw locking sequences.