CREATE TABLE "storefront_visits" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT NOT NULL,
    "entryPath" TEXT NOT NULL,
    "lastPath" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "firstIndex" INTEGER NOT NULL,
    "lastIndex" INTEGER NOT NULL,
    CONSTRAINT "storefront_visits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "storefront_visits_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "storefront_visit_events" (
    "visitId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "detail" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "storefront_visit_events_pkey" PRIMARY KEY ("visitId", "sequence"),
    CONSTRAINT "storefront_visit_events_visitId_fkey" FOREIGN KEY ("visitId")
        REFERENCES "storefront_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "storefront_visits_startedAt_idx" ON "storefront_visits"("startedAt");
CREATE INDEX "storefront_visits_lastSeenAt_id_idx" ON "storefront_visits"("lastSeenAt", "id");
CREATE INDEX "storefront_visits_userId_idx" ON "storefront_visits"("userId");
CREATE INDEX "storefront_visit_events_kind_path_visitId_idx" ON "storefront_visit_events"("kind", "path", "visitId");
