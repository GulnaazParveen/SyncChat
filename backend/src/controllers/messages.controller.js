import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import conversation from "../models/conversation.js";
import message from "../models/message.model.js";
const sendMessage = asyncHandler(async (req, res) => {
  const { message: messageText } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  // Check if a conversation exists
  let conversations = await conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  // If no conversation, create one
  if (!conversations) {
    conversations = await conversation.create({
      participants: [senderId, receiverId],
      conversationMessage: [], 
    });
  }

  console.log("Message received:", messageText);

  // Create a new message
  const newMessage = await message.create({
    sender: senderId,
    receiver: receiverId,
    message: messageText,
  });

  if (!newMessage) {
    throw new ApiError(401, "Message sending failed");
  }

  // Push new message ID to conversationMessage array
  conversations.conversationMessage.push(newMessage._id);
  await conversations.save(); // Save the updated conversation

  return res
    .status(201)
    .json(new ApiResponse(200, newMessage, "Message sent successfully"));
});


// get messages between two users
const getMessage = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user._id;

  const getConversation = await conversation
    .findOne({
      participants: { $all: [senderId, userToChatId] },
    })
    .populate({ path: "conversationMessage", model: "Message" }); // Populate messages

  if (!getConversation) {
    throw new ApiError(401, "No conversation found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getConversation.conversationMessage,
        "Messages retrieved successfully"
      )
    );
});


export { sendMessage,getMessage};
