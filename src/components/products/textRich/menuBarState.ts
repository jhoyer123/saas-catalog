import type { Editor } from "@tiptap/core";
import type { EditorStateSnapshot } from "@tiptap/react";

/**
 * State selector for the MenuBar component.
 * Extracts the relevant editor state for rendering menu buttons.
 */
export function menuBarStateSelector(ctx: EditorStateSnapshot<Editor | null>) {
  const editor = ctx.editor;

  if (!editor) {
    return {
      isBold: false,
      canBold: false,
      isItalic: false,
      canItalic: false,
      isStrike: false,
      canStrike: false,
      isCode: false,
      canCode: false,
      canClearMarks: false,
      isParagraph: false,
      isHeading1: false,
      isHeading2: false,
      isHeading3: false,
      isHeading4: false,
      isHeading5: false,
      isHeading6: false,
      isBulletList: false,
      isOrderedList: false,
      isCodeBlock: false,
      isBlockquote: false,
      canUndo: false,
      canRedo: false,
    };
  }

  return {
    isBold: editor.isActive("bold"),
    canBold: editor.can().chain().toggleBold().run(),
    isItalic: editor.isActive("italic"),
    canItalic: editor.can().chain().toggleItalic().run(),
    isStrike: editor.isActive("strike"),
    canStrike: editor.can().chain().toggleStrike().run(),
    isCode: editor.isActive("code"),
    canCode: editor.can().chain().toggleCode().run(),
    canClearMarks: editor.can().chain().unsetAllMarks().run(),

    isParagraph: editor.isActive("paragraph"),
    isHeading1: editor.isActive("heading", { level: 1 }),
    isHeading2: editor.isActive("heading", { level: 2 }),
    isHeading3: editor.isActive("heading", { level: 3 }),
    isHeading4: editor.isActive("heading", { level: 4 }),
    isHeading5: editor.isActive("heading", { level: 5 }),
    isHeading6: editor.isActive("heading", { level: 6 }),

    isBulletList: editor.isActive("bulletList"),
    isOrderedList: editor.isActive("orderedList"),
    isCodeBlock: editor.isActive("codeBlock"),
    isBlockquote: editor.isActive("blockquote"),

    canUndo: editor.can().chain().undo().run(),
    canRedo: editor.can().chain().redo().run(),
  };
}

export type MenuBarState = ReturnType<typeof menuBarStateSelector>;
