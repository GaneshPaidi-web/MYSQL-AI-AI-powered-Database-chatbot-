import db from "../db.js";
import generateSQL from "../services/aiService.js";
import Chat from "../models/Chat.js";

export const runQuery = async (req, res) => {
  const { question, userId, aiProvider, chatId } = req.body;

  try {
    const schema = await db.getSchema();
    const aiResponse = await generateSQL(question, schema, aiProvider);
    
    if (aiResponse.error) {
      return res.json({ error: aiResponse.error });
    }

    const { sql, chartType, xAxis, yAxis } = aiResponse;

    let rows = [];
    if (sql) {
      const [dbRows] = await db.query(sql);
      rows = dbRows;
    }

    // Prepare response data
    const responseData = {
      sql: sql,
      result: rows,
      chartConfig: { chartType, xAxis, yAxis }
    };

    // Save to chat history if userId is provided
    if (userId) {
      const userMessage = { sender: "user", text: question };
      const botMessage = {
        sender: "bot",
        text: sql || "Query executed successfully.",
        isSql: !!sql,
        chartData: responseData.chartData,
        imageUrl: responseData.imageUrl,
        result: rows,
        chartConfig: responseData.chartConfig
      };

      let currentChat;
      if (chatId) {
        currentChat = await Chat.findByIdAndUpdate(
          chatId,
          { $push: { messages: { $each: [userMessage, botMessage] } } },
          { new: true }
        );
      } else {
        // Create new chat session
        // Generate a descriptive title based on the question/result
        let title = question.replace(/show|display|get|find|list|all|the|me|give/gi, "").trim();
        title = title.charAt(0).toUpperCase() + title.slice(1);
        if (title.length > 30) title = title.substring(0, 30) + "...";
        if (!title) title = "Query Results";
        else if (!title.toLowerCase().includes("result") && !title.toLowerCase().includes("data")) {
            title += " Data";
        }

        currentChat = new Chat({
          userId,
          title,
          messages: [userMessage, botMessage]
        });
        await currentChat.save();
      }
      responseData.chatId = currentChat._id;
    }

    res.json(responseData);

  } catch (error) {
    console.error("Query Execution Error:", error);
    res.json({
      error: error.message
    });
  }
};