"use client"

import { useState } from "react"
import { X, MoreHorizontal, ThumbsUp, Send, Sparkles, Paperclip, Smile, Type } from "lucide-react"

interface AssistantDialogProps {
  isOpen: boolean
  onClose: () => void
}

const NotionIcon = () => (
  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
    <span className="text-black font-bold text-sm">N</span>
  </div>
)

export default function AssistantDialog({ isOpen, onClose }: AssistantDialogProps) {
  const [message, setMessage] = useState("")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-[#1a1a1a] rounded-3xl overflow-hidden border border-[#2a2a2a]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-white text-xl font-semibold">Assistant</h2>
          <button className="text-[#666] hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-12 w-7 h-7 bg-[#252525] hover:bg-[#333] rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-[#666]" />
        </button>

        {/* Chat content */}
        <div className="p-4 space-y-4">
          {/* User message */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🧑‍💼</span>
            </div>
            <div>
              <div className="text-white font-medium text-sm">Lisa Jackson</div>
              <div className="text-[#999] text-sm">Create a document for a next meeting.</div>
            </div>
          </div>

          {/* AI response */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <div className="flex-1">
              <div className="text-[#2563eb] font-medium text-sm">AI Assistant</div>
              <div className="text-[#999] text-sm mb-3">Sure, I&apos;ll create the document shortly.</div>
              
              {/* Document card */}
              <div className="bg-[#252525] rounded-2xl p-3 border border-[#333]">
                <div className="flex items-start gap-3">
                  <NotionIcon />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">Document for the meeting</div>
                    <div className="text-[#777] text-xs mt-0.5 line-clamp-2">
                      The development phase is on track and shared the milestones achieved so far.
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#333]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#666] text-xs">Shared with</span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-purple-500 border-2 border-[#252525]" />
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-orange-400 to-red-500 border-2 border-[#252525]" />
                    </div>
                  </div>
                  <button className="text-[#666] hover:text-white transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 pt-2">
          <div className="flex items-center gap-2 bg-[#252525] rounded-2xl px-4 py-3 border border-[#333]">
            <div className="flex items-center gap-3 text-[#555]">
              <button className="hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" />
              </button>
              <button className="hover:text-white transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="hover:text-white transition-colors">
                <Type className="w-4 h-4" />
              </button>
              <button className="hover:text-white transition-colors">
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-[#555] outline-none mx-2"
            />
            <button className="text-[#2563eb] hover:text-blue-400 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
