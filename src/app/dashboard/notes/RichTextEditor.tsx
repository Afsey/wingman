import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Unlink } from 'lucide-react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="rte-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`rte-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`rte-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`rte-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      
      <div className="rte-divider" />
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`rte-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rte-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>

      <div className="rte-divider" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`rte-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`rte-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`rte-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        title="Quote"
      >
        <Quote size={16} />
      </button>

      <div className="rte-divider" />

      <button
        onClick={setLink}
        className={`rte-btn ${editor.isActive('link') ? 'is-active' : ''}`}
        title="Set Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className="rte-btn"
        title="Remove Link"
      >
        <Unlink size={16} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rte-content',
      },
    },
  });

  return (
    <div className="rte-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
