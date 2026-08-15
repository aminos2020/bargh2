import { mongoose } from "@/lib/db";

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkGroup", required: true },
    membershipType: {
      type: String,
      enum: ["member", "supervisor", "employer_expert", "employer_ceo"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ userId: 1, groupId: 1, membershipType: 1 }, { unique: true });
schema.index({ groupId: 1, membershipType: 1 });

export const GroupMembership =
  (mongoose.models.GroupMembership as mongoose.Model<any>) || mongoose.model("GroupMembership", schema, "groupmemberships");
