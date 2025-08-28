import mongoose from "mongoose";

export interface IJournalEntry extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  encryptedContent: string;
  aiResponse: string;
  mood?: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  encryptedContent: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: String,
    required: true,
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
  },
  tags: [
    {
      type: String,
      lowercase: true,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

JournalEntrySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IJournalEntry>(
  "JournalEntry",
  JournalEntrySchema,
);
