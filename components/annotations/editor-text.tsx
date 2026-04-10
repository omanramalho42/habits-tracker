"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { 
  Bold, Italic, List, ListOrdered, 
  Redo, Undo, Code 
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useEffect } from 'react'

interface EditorTextProps {
  value: string
  onChange: (value: string) => void
}

const EditorText = ({ value, onChange }: EditorTextProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    // CRITICAL: Corrige o erro de SSR e Hydration
    immediatelyRender: false, 
    editorProps: {
      attributes: {
        class: "min-h-[150px] w-full rounded-md rounded-t-none border border-t-0 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sincroniza o conteúdo se o valor mudar externamente (ex: via IA Creator)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="flex flex-col w-full border rounded-md border-input">
      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-muted/50 rounded-t-md">
        <ToggleBtn 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={editor.isActive('bold')}
        >
          <Bold className="w-4 h-4" />
        </ToggleBtn>
        
        <ToggleBtn 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={editor.isActive('italic')}
        >
          <Italic className="w-4 h-4" />
        </ToggleBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToggleBtn 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={editor.isActive('bulletList')}
        >
          <List className="w-4 h-4" />
        </ToggleBtn>

        <ToggleBtn 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          active={editor.isActive('orderedList')}
        >
          <ListOrdered className="w-4 h-4" />
        </ToggleBtn>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToggleBtn 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          active={editor.isActive('codeBlock')}
        >
          <Code className="w-4 h-4" />
        </ToggleBtn>
        
        <div className="flex ml-auto gap-1">
          <Button 
            variant="ghost" size="sm" type="button"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" size="sm" type="button"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}

const ToggleBtn = ({ onClick, active, children }: any) => (
  <Button
    type="button"
    variant={active ? "secondary" : "ghost"}
    size="sm"
    onClick={onClick}
    className={active ? "bg-primary/20 text-primary hover:bg-primary/30" : ""}
  >
    {children}
  </Button>
)

export default EditorText