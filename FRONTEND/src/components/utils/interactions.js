import API from "../api/API";

export const createInteraction = async (productId, type) => {
  try {
    await API.post("/user/interaction", {
      productId,
      type,
    });
  } catch (error) {
    console.error("Failed to create interaction:", error);
  }
};