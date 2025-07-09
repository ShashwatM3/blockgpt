export async function POST(req) {
  const { messages } = await req.json();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "qwen/qwen3-32b:free",
      messages: [
        { role: "system", content: "Complete the flow of the conversation by answering the latest question/statement stated by the user, while keeping the other messages as context to craft your response. You must reply in the following format: A string of length maximum 1-2 sentences" },
        ...messages,
      ]
    }),
  });

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || "No response. Try again in a bit.";

  return Response.json({ answer });
}
