import '../tiptap.scss';

import { Color } from '@tiptap/extension-color';
import Link, { LinkOptions } from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const buttonCss =
  'inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20';

function MenuBar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`${editor.isActive('bold') ? 'is-active' : ''} ${buttonCss}`}
      >
        bold
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`${editor.isActive('italic') ? 'is-active' : ''} ${buttonCss}`}
      >
        italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`${editor.isActive('strike') ? 'is-active' : ''} ${buttonCss}`}
      >
        strike
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`${editor.isActive('code') ? 'is-active' : ''} ${buttonCss}`}
      >
        code
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className={buttonCss}
      >
        clear marks
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().run()}
        className={buttonCss}
      >
        clear nodes
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`${editor.isActive('paragraph') ? 'is-active' : ''} ${buttonCss}`}
      >
        paragraph
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''} ${buttonCss}`}
      >
        h1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} ${buttonCss}`}
      >
        h2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''} ${buttonCss}`}
      >
        h3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`${editor.isActive('heading', { level: 4 }) ? 'is-active' : ''} ${buttonCss}`}
      >
        h4
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={`${editor.isActive('heading', { level: 5 }) ? 'is-active' : ''} ${buttonCss}`}
      >
        h5
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={`${editor.isActive('heading', { level: 6 }) ? 'is-active' : ''} ${buttonCss}`}
      >
        h6
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${editor.isActive('bulletList') ? 'is-active' : ''} ${buttonCss}`}
      >
        bullet list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${editor.isActive('orderedList') ? 'is-active' : ''} ${buttonCss}`}
      >
        ordered list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`${editor.isActive('codeBlock') ? 'is-active' : ''} ${buttonCss}`}
      >
        code block
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${editor.isActive('blockquote') ? 'is-active' : ''} ${buttonCss}`}
      >
        blockquote
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={buttonCss}
      >
        horizontal rule
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className={buttonCss}
      >
        hard break
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className={buttonCss}
      >
        undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={buttonCss}
      >
        redo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setColor('#958DF1').run()}
        className={`${
          editor.isActive('textStyle', { color: '#958DF1' }) ? 'is-active' : ''
        } ${buttonCss}`}
      >
        purple
      </button>
    </div>
  );
}

const UnfurlLink = Link.extend<
  LinkOptions,
  { unfurledValues: Partial<Record<string, UnfurlLinkStorage>> }
>({
  name: 'UnfurlLink',
  priority: 1000,
  inclusive: false,
  addStorage() {
    return {
      ...this.parent?.(),
      unfurledValues: {},
    };
  },
  renderHTML({ mark, HTMLAttributes }) {
    const unfurlLink = this.storage.unfurledValues[HTMLAttributes.href];

    // kick off the api request to get the unfurl data
    if (!unfurlLink) {
      this.storage.unfurledValues[HTMLAttributes.href] = { status: 'initiate' };
    }

    const parentAnchor = this.parent!({ mark, HTMLAttributes }) as readonly [string, ...unknown[]];

    if (!unfurlLink || unfurlLink.status !== 'unfurled') {
      return parentAnchor;
    }

    // unfurl is supported at this point.  Redraw the anchor to show additional content
    const unfurlContent = [
      'span',
      {
        class:
          'unfurled inline-flex items-center space-x-2 rounded-md px-2 py-1 font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20',
      },
      ['img', { src: unfurlLink.data.icon, class: 'size-6' }],
      ['span', { class: 'font-bold' }, unfurlLink.data.appName],
      ['span', { class: 'text hover:underline' }, unfurlLink.data.text],
      ['span', { class: 'content hidden' }, 0],
      [
        'span',
        {
          class:
            'ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20',
        },
        unfurlLink.data.secondaryText,
      ],
    ];

    return ['a', parentAnchor[1], unfurlContent];
  },
  parseHTML() {
    return [
      {
        tag: 'a[href]:not([href *= "javascript:" i])',
        getAttrs(node) {
          if (typeof node === 'string') {
            return {};
          }

          // It feels completely wrong to remove a node here.  But it seems to work for the use cases I've tried.
          // I wouldn't be surprised if this doesn't work as a general solution.
          node
            .querySelector('span.unfurled')
            ?.replaceChildren(node.querySelector('span.unfurled > span.content')!);

          return {
            href: node.parentElement?.parentElement?.getAttribute('href'),
            target: node.parentElement?.parentElement?.getAttribute('target'),
            rel: node.parentElement?.parentElement?.getAttribute('rel'),
            class: node.parentElement?.parentElement?.getAttribute('class'),
          };
        },
      },
    ];
  },
});

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({}),
  UnfurlLink.configure({
    protocols: ['http', 'https'],
    HTMLAttributes: {
      class:
        'align-middle font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer',
    },
  }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
];

export type UnfurlLinkStorage =
  | {
      status: 'initiate' | 'unsupported';
    }
  | {
      status: 'unfurled';
      data: {
        icon: string;
        appName: string;
        text: string;
        secondaryText: string;
      };
    };

function TipTapEditor({
  content,
  onUpdate,
  links,
}: {
  content: string;
  onUpdate: (html: string, storage: Partial<Record<string, UnfurlLinkStorage>>) => void;
  links: Partial<Record<string, UnfurlLinkStorage>>;
}) {
  const editor = useEditor(
    {
      extensions,
      content,
      onCreate({ editor: editorArg }) {
        onUpdate(editorArg.getHTML(), editorArg.storage[UnfurlLink.name].unfurledValues);
      },
      onUpdate({ editor: editorArg }) {
        onUpdate(editorArg.getHTML(), editorArg.storage[UnfurlLink.name].unfurledValues);
      },
    },
    [links]
  );

  if (!editor) {
    return null;
  }

  editor.storage[UnfurlLink.name].unfurledValues = links;

  return (
    <div className="space-y-4">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>

    // Neelav - Keeping this around in case we want to reference the initial way we rendered the editor
    // <EditorProvider
    //     onUpdate={({ editor }) => { onUpdate(editor.getHTML(), editor.storage[UnfurlLink.name].unfurledValues); }}
    //     slotBefore={<MenuBar />}
    //     extensions={extensions}
    //     content={content}
    // >{""}</EditorProvider>
  );
}

export default TipTapEditor;
