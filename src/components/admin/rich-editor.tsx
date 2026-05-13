"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import ImageExtension from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Undo, Redo, ImageIcon,
} from "lucide-react"
import { useCallback } from "react"

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
}

export function RichEditor({ content, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      Placeholder.configure({ placeholder: "开始编写攻略内容..." }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  const addImage = useCallback(() => {
    const url = window.prompt("输入图片 URL")
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) return null

  const btn = (onClick: () => void, active: boolean, icon: React.ReactNode, label: string) => (
    <Button
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="h-8 w-8"
      onClick={onClick}
      aria-label={label}
      type="button"
    >
      {icon}
    </Button>
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-0.5 rounded-md border bg-muted/50 p-1">
        {btn(() => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), <Bold className="h-4 w-4" />, "加粗")}
        {btn(() => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), <Italic className="h-4 w-4" />, "斜体")}
        {btn(() => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"), <Strikethrough className="h-4 w-4" />, "删除线")}
        {btn(() => editor.chain().focus().toggleCode().run(), editor.isActive("code"), <Code className="h-4 w-4" />, "行内代码")}

        <div className="w-px h-6 bg-border mx-1" />

        {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }), <Heading1 className="h-4 w-4" />, "标题1")}
        {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }), <Heading2 className="h-4 w-4" />, "标题2")}
        {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }), <Heading3 className="h-4 w-4" />, "标题3")}

        <div className="w-px h-6 bg-border mx-1" />

        {btn(() => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), <List className="h-4 w-4" />, "无序列表")}
        {btn(() => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), <ListOrdered className="h-4 w-4" />, "有序列表")}
        {btn(() => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"), <Quote className="h-4 w-4" />, "引用")}

        <div className="w-px h-6 bg-border mx-1" />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addImage} aria-label="插入图片" type="button">
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().undo().run()} aria-label="撤销" type="button">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editor.chain().focus().redo().run()} aria-label="重做" type="button">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-[300px] rounded-md border bg-background px-4 py-3">
        <EditorContent editor={editor} className="prose prose-neutral dark:prose-invert max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px]" />
      </div>
    </div>
  )
}
