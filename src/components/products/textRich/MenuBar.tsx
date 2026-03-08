import { useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Editor } from "@tiptap/react";

export default function MenuBar({ editor }: { editor: Editor | null }) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isH1: editor?.isActive("heading", { level: 1 }),
      isH2: editor?.isActive("heading", { level: 2 }),
      isH3: editor?.isActive("heading", { level: 3 }),
      isBold: editor?.isActive("bold"),
      isItalic: editor?.isActive("italic"),
      isStrike: editor?.isActive("strike"),
      isLeft: editor?.isActive({ textAlign: "left" }),
      isCenter: editor?.isActive({ textAlign: "center" }),
      isRight: editor?.isActive({ textAlign: "right" }),
      isBullet: editor?.isActive("bulletList"),
      isOrdered: editor?.isActive("orderedList"),
      isHighlight: editor?.isActive("highlight"),
    }),
  });

  if (!editor) {
    return null;
  }

  const Options = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      preesed: editorState?.isH1,
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      preesed: editorState?.isH2,
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      preesed: editorState?.isH3,
    },
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      preesed: editorState?.isBold,
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      preesed: editorState?.isItalic,
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      preesed: editorState?.isStrike,
    },
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      preesed: editorState?.isLeft,
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      preesed: editorState?.isCenter,
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      preesed: editorState?.isRight,
    },
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      preesed: editorState?.isBullet,
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      preesed: editorState?.isOrdered,
    },
    {
      icon: <Highlighter className="size-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      preesed: editorState?.isHighlight,
    },
  ];

  return (
    <div className="border rounded-md p-1 mb-1 space-x-2 z-50">
      {Options.map((option, index) => (
        <Toggle key={index} pressed={!!option.preesed} onClick={option.onClick}>
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
}
