import { RequestHandler } from "express";
import {
  findUserByEmail,
  updateUserProfileByEmail,
  createUser,
} from "../utils/neon";

async function getOrCreateUserHelper(email: string, username: string = "User") {
  if (!email) {
    throw new Error("Email is required");
  }

  let user = await findUserByEmail(email);

  if (!user) {
    console.log(`Creating new user: ${email}`);
    user = await createUser(email, username);
    if (!user) {
      throw new Error("Failed to create user");
    }
  }

  return user;
}

export const getUserProfile: RequestHandler = async (req, res) => {
  console.log("Getting user profile");

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await getOrCreateUserHelper(email as string);

    console.log(`User profile retrieved: ${user.email}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio || "Ready to begin my healing journey.",
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user profile",
      details: error.message,
    });
  }
};

export const updateUserProfile: RequestHandler = async (req, res) => {
  console.log("Updating user profile");

  try {
    const { email, username, bio } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    if (!username && bio === undefined) {
      return res.status(400).json({
        success: false,
        error: "At least one field (username or bio) must be provided",
      });
    }

    if (username && username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Username cannot be empty",
      });
    }

    await getOrCreateUserHelper(email, username || "User");

    const updates: { username?: string; bio?: string } = {};
    if (username) updates.username = username.trim();
    if (bio !== undefined) updates.bio = bio.trim();

    const updatedUser = await updateUserProfileByEmail(email, updates);

    if (!updatedUser) {
      throw new Error("Failed to update user profile");
    }

    console.log(`User profile updated: ${updatedUser.email}`);

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio || "Ready to begin my healing journey.",
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user profile",
      details: error.message,
    });
  }
};
