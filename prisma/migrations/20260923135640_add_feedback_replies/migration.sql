-- CreateEnum
CREATE TYPE "FeedbackReplyAuthor" AS ENUM ('ADMIN', 'LANDLORD');

-- CreateTable
CREATE TABLE "FeedbackReply" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "authorType" "FeedbackReplyAuthor" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackReply_feedbackId_createdAt_idx" ON "FeedbackReply"("feedbackId", "createdAt");

-- AddForeignKey
ALTER TABLE "FeedbackReply" ADD CONSTRAINT "FeedbackReply_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
