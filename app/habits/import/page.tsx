"use client";

import React from "react";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { Check, Loader2, Download, CheckSquare, Square, Target, BarChart3, Mail } from "lucide-react";
import { toast } from "sonner";

interface TaskSuggestion {
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  counter: {
    label: string;
    valueNumber: number;
    unit?: string;
    limit: number;
  };
  category?: {
    name: string;
    emoji?: string;
    color?: string;
  };
  metrics: {
    emoji?: string;
    field?: string;
    unit?: string;
    fieldType: "NUMERIC" | "STRING" | "FLOAT";
  }[];
}

// 1. Ajuste na interface do formulário para incluir o e-mail
interface FormValues {
  targetEmail: string;
  tasks: {
    selected: boolean;
    data: TaskSuggestion;
  }[];
}

export default function ImportTasksPage() {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["task-suggestions"],
    queryFn: async () => {
      const { data } = await axios.get<TaskSuggestion[]>("/api/task/fast-create");
      return data;
    },
  });

  // 2. Setup do Formulário com targetEmail inicial vazio
  const { register, control, handleSubmit, watch, setValue } = useForm<FormValues>({
    values: {
      targetEmail: "",
      tasks: suggestions?.map((t) => ({ selected: false, data: t })) || [],
    },
  });

  const { fields } = useFieldArray({ control, name: "tasks" });
  const watchedTasks = watch("tasks");

  // 3. Mutação ajustada para enviar o objeto { targetEmail, tasks }
  const mutation = useMutation({
    mutationFn: async (payload: { targetEmail: string; tasks: TaskSuggestion[] }) => {
      const { data } = await axios.post("/api/task/fast-create", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Tarefas importadas com sucesso!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || "Erro ao importar as tarefas.";
      toast.error(typeof msg === "string" ? msg : "Erro de validação nos campos.");
    },
  });

  const selectedCount = watchedTasks?.filter((t) => t.selected).length || 0;
  const isAllSelected = selectedCount === fields.length && fields.length > 0;

  const toggleAll = () => {
    const newValue = !isAllSelected;
    fields.forEach((_, index) => setValue(`tasks.${index}.selected`, newValue));
  };

  const onSubmit = (data: FormValues) => {
    const selectedTasks = data.tasks.filter((t) => t.selected).map((t) => t.data);
    
    if (!data.targetEmail) return toast.error("Insira o e-mail de destino.");
    if (selectedTasks.length === 0) return toast.error("Selecione ao menos uma tarefa.");
    
    // Envia o objeto pai conforme o Schema Zod espera
    mutation.mutate({
      targetEmail: data.targetEmail,
      tasks: selectedTasks
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-5xl">
        <header className="mb-10 space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white italic">Fast Create</h1>
              <p className="mt-2 text-lg text-slate-400">Importe tarefas para um usuário via e-mail.</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#18181b] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-[#27272a]"
              >
                {isAllSelected ? <CheckSquare size={18} className="text-blue-400" /> : <Square size={18} />}
                Todos
              </button>

              <button
                type="submit"
                disabled={selectedCount === 0 || mutation.isPending}
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-3 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:opacity-50"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                Importar ({selectedCount})
              </button>
            </div>
          </div>

          {/* NOVO: Campo de E-mail de destino */}
          <div className="relative max-w-md group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              {...register("targetEmail", { required: true })}
              type="email"
              placeholder="E-mail do usuário de destino..."
              className="w-full bg-[#18181b] border border-slate-800 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder:text-slate-600"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {fields.map((field, index) => {
            const isChecked = watchedTasks[index]?.selected;
            const task = field.data;

            return (
              <label
                key={field.id}
                className={`group relative flex cursor-pointer flex-col rounded-3xl border-2 p-6 transition-all duration-300 ${
                  isChecked 
                    ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "border-slate-800 bg-[#18181b] hover:border-slate-700 hover:bg-[#1c1c20]"
                }`}
              >
                <input type="checkbox" {...register(`tasks.${index}.selected`)} className="hidden" />

                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#27272a] text-3xl shadow-inner border border-slate-700">
                      {task.emoji}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight">{task.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-1">{task.description}</p>
                    </div>
                  </div>
                  <div className={`mt-1 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                    isChecked ? "bg-blue-500 border-blue-500 text-white" : "border-slate-700 bg-transparent"
                  }`}>
                    {isChecked && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>

                <div className="my-5 h-[1px] w-full bg-slate-800/50" />

                <div className="grid grid-cols-2 gap-y-3">
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-tighter">
                    <Target size={14} className="text-blue-500" /> Meta Principal
                  </div>
                  <div className="text-right text-sm font-bold text-slate-300">
                    {task.counter.valueNumber} {task.counter.label}
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-tighter">
                    <BarChart3 size={14} className="text-emerald-500" /> Métricas Extras
                  </div>
                  <div className="flex justify-end gap-1.5">
                    {task.metrics.map((m, i) => (
                      <span key={i} title={m.field} className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-xs border border-slate-700">
                        {m.emoji}
                      </span>
                    ))}
                  </div>
                </div>

                {task.category && (
                  <div className="mt-6 pt-4 border-t border-slate-800/50">
                    <span 
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest border"
                      style={{ 
                        backgroundColor: `${task.category.color}15`,
                        color: task.category.color,
                        borderColor: `${task.category.color}40`
                      }}
                    >
                      {task.category.emoji} {task.category.name}
                    </span>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </form>
    </div>
  );
}