"use client"

import { useState } from "react"
import { Play, Square, Loader2, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import axios from "axios"

interface VoicePreviewPlayerProps {
  voiceId: string
  defaultText?: string
}

export function VoicePreviewPlayer({ voiceId, defaultText = "Olá, o que você achou da minha nova voz?" }: VoicePreviewPlayerProps) {
  const [text, setText] = useState(defaultText)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  async function handlePlayPreview() {
    if (isPlaying && audio) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.post("/api/ia/voice/tts", {
        voiceId,
        text: text 
      }, { 
        responseType: 'blob' 
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
      
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao reproduzir amostra de voz.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-white/5 border border-white/10 mt-4">
      <div className="flex items-center gap-2 text-sm text-orange-500 font-medium mb-1">
        <Volume2 className="size-4" />
        Teste de Voz
      </div>
      
      <div className="flex gap-2">
        <Input 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-[#0d0808] border-white/10 text-white"
          placeholder="Digite algo para a voz falar..."
        />
        
        <Button 
          type="button"
          onClick={handlePlayPreview}
          disabled={isLoading || !text}
          className="bg-orange-600 hover:bg-orange-700 text-white min-w-[100px]"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isPlaying ? (
            <>
              <Square className="size-4 mr-2 fill-current" />
              Parar
            </>
          ) : (
            <>
              <Play className="size-4 mr-2 fill-current" />
              Ouvir
            </>
          )}
        </Button>
      </div>
    </div>
  )
}