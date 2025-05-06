import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "당신은 고등학교 1학년 과학 수업에서 센트랄 도그마(DNA → RNA → 단백질)를 가르치는 AI 튜터입니다. 수업과 관련된 질문에만 답하고, 과학 수업 외 주제는 정중히 거절하세요."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const isValidInput = (text) => {
    const keywords = ["DNA", "RNA", "단백질", "전사", "번역", "코돈", "염기서열"];
    return keywords.some((keyword) => text.includes(keyword));
  };

  const checkRNA = (rna) => {
    const correct = "UAC GCU AAA CUG";
    return rna.replace(/\s/g, "").toUpperCase() === correct.replace(/\s/g, "").toUpperCase();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage = { role: "user", content: input };

    if (!isValidInput(input)) {
      setMessages((prev) => [...prev, newUserMessage, { role: "assistant", content: "그건 흥미롭지만 지금은 과학 수업 시간이에요. RNA나 단백질 합성에 대해 이야기해볼까요?" }]);
      setInput("");
      return;
    }

    if (checkRNA(input)) {
      setMessages((prev) => [...prev, newUserMessage, { role: "assistant", content: "정답입니다! DNA의 염기서열과 정확히 상보적인 RNA를 작성했어요. 전사가 성공적으로 이루어졌습니다." }]);
      setInput("");
      return;
    }

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", { messages: updatedMessages });
      setMessages([...updatedMessages, res.data.reply]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ GPT 응답 중 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>🧬 센트랄 도그마 AI 튜터</h1>
      <div style={{ border: "1px solid #ccc", borderRadius: "6px", padding: "1rem", height: "400px", overflowY: "scroll", marginTop: "1rem", backgroundColor: "#fff" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "0.5rem" }}>
            <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
          </div>
        ))}
        {loading && <p>GPT 응답 중...</p>}
      </div>
      <div style={{ marginTop: "1rem", display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSend}
          style={{ marginLeft: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "4px" }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
