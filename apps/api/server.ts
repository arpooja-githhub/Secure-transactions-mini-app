import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import serverless from "serverless-http";
import { encryptEnvelope, decryptEnvelope } from "@repo/crypto";

// 🔹 Storage (works per serverless instance)
const store = new Map<string, any>();

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, { origin: true });

// 🔐 Validate MASTER_KEY
const MASTER_KEY_HEX = process.env.MASTER_KEY;
if (!MASTER_KEY_HEX) {
  throw new Error("MASTER_KEY environment variable is not set!");
}
const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, "hex");

// -------------------- ROUTES --------------------

// A. ENCRYPT (POST /tx/encrypt)
fastify.post("/tx/encrypt", async (req, reply) => {
  const { partyId, payload } = req.body as any;

  const result = encryptEnvelope(MASTER_KEY, payload);

  const record = {
    ...result,
    partyId,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date().toISOString(),
  };

  store.set(partyId, record);
  return record;
});

// B. FETCH (GET /tx/:partyId)
fastify.get("/tx/:partyId", async (req, reply) => {
  const { partyId } = req.params as { partyId: string };
  const record = store.get(partyId);

  if (!record) {
    return reply.code(404).send({ error: "Record not found" });
  }

  return record;
});

// C. DECRYPT (POST /tx/:partyId/decrypt)
fastify.post("/tx/:partyId/decrypt", async (req, reply) => {
  const { partyId } = req.params as { partyId: string };
  const record = store.get(partyId);

  if (!record) {
    return reply.code(404).send({ error: "Not found" });
  }

  try {
    const decrypted = decryptEnvelope(MASTER_KEY, record);
    return { id: partyId, decrypted };
  } catch {
    return reply.code(400).send({ error: "Decryption failed" });
  }
});

// ❌ NO fastify.listen()

// ✅ Export serverless handler
export default serverless(fastify as any);
