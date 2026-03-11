// services/qdrant.js
import axios from "axios";

/**
 * Get a Qdrant client for a specific URL
 * @param {string} url - Qdrant base URL
 */
const getQdrantClient = (url) => {
  if (!url) throw new Error("Qdrant URL is required");
  return axios.create({ baseURL: url });
};

/**
 * Create a collection in Qdrant if it does not exist
 * @param {string} name - collection name
 * @param {string} qdrantUrl - Qdrant URL
 * @param {number} vectorSize - default 1536
 */
export const createCollection = async (name, qdrantUrl, vectorSize = 1536) => {
  try {
    const client = getQdrantClient(qdrantUrl);

    // Check if collection exists
    const res = await client.get(`/collections/${name}`).catch(() => null);
    if (res && res.data && res.data.status === "ok") {
      console.log(`🔹 Qdrant collection '${name}' already exists`);
      return;
    }

    // Create collection
    await client.put(`/collections/${name}`, {
      vectors: {
        size: vectorSize,
        distance: "Cosine", // or "Dot" / "Euclid"
      },
    });

    console.log(`✅ Qdrant collection '${name}' created successfully`);
  } catch (err) {
    console.error(`❌ Failed to create Qdrant collection '${name}':`, err.message);
    throw err;
  }
};

/**
 * Insert a vector into a collection
 * @param {string} collection - collection name
 * @param {number[]} vector - vector array
 * @param {object} payload - optional metadata
 * @param {string} qdrantUrl - Qdrant URL
 */
export const insertVector = async (collection, vector, payload = {}, qdrantUrl) => {
  try {
    const client = getQdrantClient(qdrantUrl);

    await client.post(`/collections/${collection}/points`, {
      points: [
        {
          vector,
          payload,
        },
      ],
    });

    console.log(`✅ Vector inserted into collection '${collection}'`);
  } catch (err) {
    console.error(`❌ Failed to insert vector into '${collection}':`, err.message);
    throw err;
  }
};

/**
 * Search for similar vectors in a collection
 * @param {string} collection - collection name
 * @param {number[]} vector - query vector
 * @param {number} limit - max results
 * @param {string} qdrantUrl - Qdrant URL
 */
export const searchVector = async (collection, vector, limit = 5, qdrantUrl) => {
  try {
    const client = getQdrantClient(qdrantUrl);

    const res = await client.post(`/collections/${collection}/points/search`, {
      vector,
      limit,
    });

    return res.data.result || [];
  } catch (err) {
    console.error(`❌ Qdrant search failed in '${collection}':`, err.message);
    throw err;
  }
};