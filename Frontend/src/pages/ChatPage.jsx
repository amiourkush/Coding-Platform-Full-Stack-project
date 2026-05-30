import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";

export default function ChatPage({problem}) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts:[{text:"Tell me your problem"}],
    },
  ]);

  const { register, handleSubmit, reset } = useForm();

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const onSubmit = async (data) => {
    const userMessage = {
      role: "user",
      parts:[{text:data.message}]
    };

    setMessages((prev) => [...prev, userMessage]);

    reset();


    try{
      const response = await axiosClient.post("/ai/chat",{
        messages : messages,
        title:problem.title,
        description:problem.description,
        testCases : problem.visibleTestCases,
        startCode:problem.startCode
      });

      setMessages(prev=>[...prev,{
        role:"model",
        parts:[{text:response.data.message}]
      }])
    }catch(err){
      console.log("API Error :",err);
      setMessages(prev=>[...prev,{
        role:"model",
        parts:[{text:"Sorry,I encountered an error"}]
      }])
    }

  }
  return (
    <div className="h-screen flex flex-col bg-base-200">

      {/* Header */}
      <div className="navbar bg-base-100 shadow">
        <div className="flex-1">
          <span className="text-xl font-bold">
            AI Assistant
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${
              msg.role === "user"
                ? "chat-end"
                : "chat-start"
            }`}
          >
            <div className="chat-bubble">
              {msg.parts[0].text}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 bg-base-100 border-t"
      >
        <div className="flex gap-2">
          <input
            {...register("message", {
              required: true,
            })}
            type="text"
            placeholder="Type your message..."
            className="input input-bordered flex-1"
          />

          <button
            type="submit"
            className="btn btn-primary"
          >
            Send
          </button>
        </div>
      </form>

    </div>
  );
}

