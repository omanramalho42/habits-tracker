"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload, Plus, Sparkles, Wand2, ImageIcon, Paperclip } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Emoji } from "@prisma/client"
import { toast } from "sonner"
import { generateEmojiAction } from "@/app/_actions/emoji.actions"
import Image from "next/image"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50),
  // Remova qualquer .max() daqui
  imageUrl: z.string().min(1, "Imagem é obrigatória"), 
})

type FormData = z.infer<typeof formSchema>

async function fetchEmojis(): Promise<Emoji[]> {
  const res = await fetch("/api/emoji")
  if (!res.ok) throw new Error("Failed to fetch emojis")
  return res.json()
}

async function createEmoji(data: { name: string; imageUrl: string }): Promise<Emoji> {
  const res = await fetch("/api/emoji", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create emoji")
  return res.json()
}

export function EmojiSuggestions() {
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<"original" | "ai" | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: emojis = [], isLoading } = useQuery({
    queryKey: ["emojis"],
    queryFn: fetchEmojis,
  })

  const createMutation = useMutation({
    mutationFn: createEmoji,

    onSuccess: (newEmoji) => {
      // 🔄 Atualiza cache instantaneamente (otimista)
      queryClient.setQueryData<Emoji[]>(["emojis"], (old) =>
        old ? [...old, newEmoji] : [newEmoji]
      );

      // 🔁 Garante sincronização com backend
      queryClient.invalidateQueries({ queryKey: ["emojis"] });

      // ✅ Feedback pro usuário
      toast.success("Emoji criado com sucesso 🚀");

      // 🎯 Seleciona automaticamente
      setSelectedId(newEmoji.id);

      // 🧹 RESET COMPLETO
      form.reset();

      setImageUrlPreview(null);
      setOriginalPreview(null);
      setAiPreview(null);
      setSelectedSource(null);
      setSelectedFile(null);

      // ❌ Fecha modal
      setDialogOpen(false);
    },

    onError: () => {
      toast.error("Erro ao criar emoji 😢");
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      let finalImageUrl = data.imageUrl;

      // 1. Se o usuário APENAS anexou e NÃO gerou com IA (ainda é base64)
      // Precisamos fazer o upload antes de salvar no banco
      if (data.imageUrl.startsWith("data:") && selectedFile) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("attachment", selectedFile);
        formData.append("generateAI", "false"); // Indica que é apenas upload

        const result = await generateEmojiAction(formData);

        if (!result.success || !result.url) {
          throw new Error(result.error || "Erro ao fazer upload da imagem");
        }
        finalImageUrl = result.url;
      }

      // 2. Se cair aqui e finalImageUrl começar com "http", ele já está pronto!
      // Envia para sua API Route que salva no Prisma
      createMutation.mutate({
        name: data.name,
        imageUrl: finalImageUrl, // Aqui vai a URL do Cloudinary
      });

    } catch (error: any) {
      console.error("Erro no submit:", error);
      toast.error(error.message || "Erro ao enviar imagem 😢");
    }
  };

  const { formState: { errors }} = form
  console.log(errors, "errors")
  const handleGenerateWithAI = async () => {
    const emojiName = form.getValues("name");
    
    if (!emojiName) {
      form.setError("name", { message: "Dê um nome para a IA se inspirar" });
      return;
    }

    setIsGeneratingAI(true);
    
    try {
      const formData = new FormData();
      formData.append("name", emojiName);
      formData.append("generateAI", "true"); // 🔥 IMPORTANTE

      // 👇 opcional (só se tiver referência)
      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      const result = await generateEmojiAction(formData);

      if (result.success && result.url) {
        setAiPreview(result.url);
        setSelectedSource("ai");

        form.setValue("imageUrl", result.url, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });

        toast.success("Emoji gerado com IA! ✨");
      } else {
        throw new Error(result.error || "Falha na geração");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erro na geração.");
    } finally {
      setIsGeneratingAI(false);
    }
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.1,
      },
    },
  }
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;

        setOriginalPreview(result);
        setSelectedSource("original");

        form.setValue("imageUrl", result, {
          shouldValidate: true,
          shouldDirty: true,
        });
      };
      reader.readAsDataURL(file);

      toast.success("Imagem anexada! ✨");
    }
  };
  const isImage = (url: string) => {
    return (
      url.startsWith("data:") ||
      url.startsWith("http") ||
      url.includes("cloudinary")
    );
  };
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0d0808]">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#1a0a0a] via-[#150505] to-[#0d0808]" />
      
      {/* Radial glow effect */}
      <div className="absolute left-1/2 top-1/3 h-150 w-200 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#ff4d2d]/20 via-[#ff3d1d]/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#ff6b4a]/15 via-transparent to-transparent blur-2xl" />
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
        {/* Release badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-4"
        >
          <span className="inline-flex items-center rounded-full border border-[#ff5a3d]/30 bg-[#ff5a3d]/10 px-4 py-1.5 text-sm font-medium text-[#ff8a70] backdrop-blur-sm shadow-[0_0_20px_rgba(255,90,61,0.2)]">
            Release v1.65
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          // @ts-ignore
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 text-balance bg-linear-to-r from-[#ffa590] via-[#ff7a5c] to-[#ff5a3d] bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent sm:text-5xl"
        >
          AI Emoji Suggestions
        </motion.h1>

        {/* Emoji Selector */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative mb-12 w-full max-w-3xl"
        >
          {/* Glow behind cards */}
          <div className="absolute -bottom-8 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-linear-to-r from-transparent via-[#ff5a3d]/20 to-transparent blur-2xl" />
          
          {/* Scrollable container */}
          <div className="scrollbar-hide relative flex gap-4 overflow-x-auto px-4 py-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {isLoading ? (
              <div className="flex w-full items-center justify-center py-12">
                <Spinner className="size-8 text-[#ff5a3d]" />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {emojis.map((emoji, index) => {
                  const isSelected = selectedId === emoji.id
                  
                  return (
                    <motion.button
                      key={emoji.id}
                      // @ts-ignore
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      whileHover={{ 
                        scale: isSelected ? 1.05 : 1.1,
                        transition: { type: "spring", stiffness: 400, damping: 25 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedId(isSelected ? null : emoji.id)}
                      className="group relative shrink-0"
                      style={{ 
                        transitionDelay: `${index * 50}ms`,
                      }}
                    >
                      {/* Selection glow */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                            }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -inset-1 rounded-2xl bg-linear-to-br from-[#ff7a5c] via-[#ff5a3d] to-[#cc3d22] blur-md"
                          />
                        )}
                      </AnimatePresence>
                      
                      {/* Hover glow */}
                      <div className={`absolute -inset-1 rounded-2xl bg-linear-to-br from-[#ff5a3d]/40 to-[#ff3d1d]/20 opacity-0 blur-lg transition-opacity duration-300 ${isSelected ? '' : 'group-hover:opacity-100'}`} />
                      
                      {/* Card */}
                      <div
                        className={`
                          relative flex h-20 w-20 items-center justify-center rounded-2xl
                          border transition-all duration-300
                          sm:h-24 sm:w-24
                          ${isSelected
                            ? "border-[#ff7a5c]/80 bg-[#1a0808]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_30px_rgba(255,90,61,0.4)]"
                            : "border-[#ff5a3d]/20 bg-[#1a0a0a]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-[#ff5a3d]/40 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(255,90,61,0.2)]"
                          }
                          backdrop-blur-xl
                        `}
                      >
                        {/* Inner glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 via-transparent to-transparent" />
                        
                        {isImage(emoji.imageUrl) ? (
                          <Image
                            fill
                            src={emoji.imageUrl}
                            alt={emoji.name}
                            className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12"
                          />
                        ) : (
                          <span className="text-3xl sm:text-4xl">
                            {emoji.imageUrl}
                          </span>
                        )}
                      </div>
                      
                      {/* Selection indicator pulse */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ 
                            scale: [1, 1.15, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute -inset-2 rounded-3xl border-2 border-[#ff5a3d]/40"
                        />
                      )}
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Create Emoji Button - Premium Dark Glass with Neon */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.5 }}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 0 50px rgba(255,90,61,0.5), 0 0 100px rgba(255,60,30,0.3)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setDialogOpen(true)}
          className="group relative overflow-hidden rounded-2xl"
        >
          {/* Outer neon glow */}
          <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-[#ff3d1d] via-[#ff5a3d] to-[#cc2211] opacity-60 blur-lg transition-all duration-300 group-hover:opacity-90 group-hover:blur-xl" />
          
          {/* Button container */}
          <div className="relative flex items-center gap-3 rounded-2xl border border-[#ff5a3d]/40 bg-linear-to-br from-[#1a0808]/95 via-[#200a0a]/90 to-[#150505]/95 px-8 py-4 backdrop-blur-xl transition-all duration-300 group-hover:border-[#ff7a5c]/60">
            {/* Inner glass reflection */}
            <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/10 via-transparent to-transparent" />
            <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-[#ff3d1d]/10 via-transparent to-transparent" />
            
            {/* Animated sparkles */}
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <Sparkles className="size-5 text-[#ff8a70]" />
            </motion.div>
            
            {/* Icon */}
            <div className="relative flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-[#ff5a3d] to-[#cc3311] shadow-[0_0_20px_rgba(255,90,61,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Plus className="size-5 text-white" />
            </div>
            
            {/* Text */}
            <span className="relative bg-linear-to-r from-[#ffd0c0] via-[#ffb090] to-[#ff8a70] bg-clip-text text-lg font-bold tracking-wide text-transparent">
              Criar Novo Emoji
            </span>
          </div>
          
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,90,61,0.5), transparent)",
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["200% 0", "-200% 0"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.button>

        {/* Create Emoji Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent 
            showCloseButton={false}
            className="border-[#ff5a3d]/30 bg-linear-to-br from-[#1a0808]/98 via-[#150505]/98 to-[#0d0808]/98 p-0 backdrop-blur-xl sm:max-w-md"
          >
            {/* Dialog glow effects */}
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-linear-to-r from-[#ff3d1d]/20 via-transparent to-[#ff5a3d]/20 blur-2xl" />
            
            <div className="relative p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="bg-linear-to-r from-[#ffa590] via-[#ff7a5c] to-[#ff5a3d] bg-clip-text text-2xl font-bold text-transparent">
                  Criar Novo Emoji
                </DialogTitle>
                <DialogDescription className="text-[#ff8a70]/70">
                  Adicione uma imagem e um nome para seu novo emoji
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* ÁREA DA IA E PREVIEW */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel className="text-sm font-medium text-[#ffa590]">Resultado da IA</FormLabel>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={onFileChange}
                          accept="image/*,.svg" 
                        />

                        {/* ÚNICO BOTÃO DE ANEXO (Referência) */}
                        <motion.button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          whileHover={{ scale: 1.1 }}
                          className={`p-1.5 rounded-md border transition-colors ${
                            selectedFile 
                              ? "border-orange-500 bg-orange-500/20 text-orange-400" 
                              : "border-white/10 bg-white/5 text-white/40 hover:text-[#ff8a70]"
                          }`}
                        >
                          <Paperclip className="size-4" />
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={handleGenerateWithAI}
                          disabled={isGeneratingAI}
                          whileHover={{ scale: isGeneratingAI ? 1 : 1.05 }}
                          className="group flex items-center gap-1.5 rounded-lg border border-[#ff5a3d]/40 bg-[#ff5a3d]/20 px-3 py-1.5 text-xs font-medium text-[#ff8a70] transition-all disabled:cursor-wait disabled:opacity-50"
                        >
                          {isGeneratingAI ? (
                            <>
                              <Spinner className="size-3 animate-spin" />
                              <span>Processando...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="size-3" />
                              <span>{selectedFile ? "Gerar da Referência" : "Gerar com IA"}</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* ÁREA APENAS PARA VISUALIZAÇÃO (Sem clique de upload) */}
                    <FormControl>
                      <div className="grid grid-cols-2 gap-4">
                        
                        {/* ORIGINAL */}
                        <div
                          onClick={() => {
                            if (originalPreview) {
                              setSelectedSource("original");
                              form.setValue("imageUrl", originalPreview);
                            }
                          }}
                          className={`cursor-pointer rounded-xl border p-2 transition ${
                            selectedSource === "original"
                              ? "border-orange-500 shadow-[0_0_20px_rgba(255,165,0,0.5)]"
                              : "border-white/10"
                          }`}
                        >
                          {originalPreview ? (
                            <img
                              src={originalPreview}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="h-32 flex items-center justify-center text-xs text-white/30">
                              Original
                            </div>
                          )}
                        </div>

                        {/* IA Preview Card */}
                        <div
                          onClick={() => {
                            if (aiPreview && !isGeneratingAI) {
                              setSelectedSource("ai");
                              form.setValue("imageUrl", aiPreview);
                            }
                          }}
                          className={`relative cursor-pointer rounded-xl border p-2 transition-all duration-300 ${
                            isGeneratingAI ? "opacity-70" : "opacity-100"
                          } ${
                            selectedSource === "ai"
                              ? "border-[#ff5a3d] shadow-[0_0_20px_rgba(255,90,61,0.5)]"
                              : "border-white/10"
                          }`}
                        >
                          {isGeneratingAI ? (
                            // ESTADO DE LOADING DENTRO DO CARD
                            <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg bg-white/5">
                              <Spinner className="size-6 text-[#ff5a3d]" />
                              <span className="animate-pulse text-[10px] font-medium text-[#ff8a70]">
                                Estilizando...
                              </span>
                            </div>
                          ) : aiPreview ? (
                            <div className="relative">
                              <img
                                src={aiPreview}
                                className="h-32 w-full rounded-lg object-cover"
                                alt="AI Preview"
                              />
                              <span className="absolute right-1 top-1 rounded bg-[#ff5a3d] px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                                IA ✨
                              </span>
                            </div>
                          ) : (
                            <div className="flex h-32 items-center justify-center text-xs text-white/30">
                              IA
                            </div>
                          )}
                        </div>

                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#ffa590]">
                          Nome do Emoji
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={createMutation.isPending || isGeneratingAI}
                            placeholder="Ex: Foguete, Coracao..."
                            className="border-[#ff5a3d]/30 bg-[#0d0808]/50 text-white placeholder:text-[#ff8a70]/40 focus-visible:border-[#ff5a3d]/60 focus-visible:ring-[#ff5a3d]/20"
                          />
                        </FormControl>
                        <FormMessage className="text-[#ff6b4a]" />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setDialogOpen(false)
                        form.reset()
                        setImageUrlPreview(null)
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 rounded-xl border border-[#ff5a3d]/30 bg-[#1a0808]/50 px-4 py-3 text-sm font-medium text-[#ff8a70] transition-all duration-300 hover:border-[#ff5a3d]/50 hover:bg-[#ff5a3d]/10"
                    >
                      Cancelar
                    </motion.button>
                    
                    <motion.button
                      type="submit"
                      // Desabilita se estiver criando no banco OU se a IA ainda estiver gerando a imagem
                      disabled={createMutation.isPending || isGeneratingAI}
                      className={`
                        relative flex flex-1 items-center justify-center gap-2 rounded-xl
                        // ... restante das classes
                        ${(createMutation.isPending || isGeneratingAI) ? "cursor-not-allowed opacity-70" : ""}
                      `}
                    >
                      {createMutation.isPending ? (
                        <>
                          <Spinner className="size-4" />
                          Criando...
                        </>
                      ) : isGeneratingAI ? (
                        <>
                          <Spinner className="size-4" />
                          Aguarde a IA...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="size-4" />
                          Criar Emoji
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
