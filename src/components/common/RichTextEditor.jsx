// src/components/common/RichTextEditor.jsx

import React, { useCallback, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

// Lexical Nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $getRoot, $createParagraphNode, ParagraphNode, TextNode } from 'lexical';
import { LinkNode, AutoLinkNode } from '@lexical/link';

// Lexical Plugins
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

// Lexical Commands & Utilities
import { $getSelection, $isRangeSelection, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND } from 'lexical';

// Basic editor theme
const theme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  paragraph: 'mb-1',
  list: {
    listitem: 'ml-4',
    nested: { listitem: 'ml-4' },
    ul: 'list-disc',
    ol: 'list-decimal',
  },
  link: 'text-blue-600 hover:underline',
  root: 'p-2 min-h-[100px] border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 overflow-auto outline-none',
};

// Toolbar component
function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const formatText = useCallback((format) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format), [editor]);
    const formatList = useCallback((type) => editor.dispatchCommand(type === 'ul' ? INSERT_UNORDERED_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND, undefined), [editor]);
    const formatAlign = useCallback((alignType) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignType), [editor]);

    return (
        <div className="flex flex-wrap gap-1 mb-2 bg-gray-50 p-2 rounded-md border border-gray-200">
            <button onClick={() => formatText('bold')} className="p-1 border rounded hover:bg-gray-100 text-gray-700" title="Bold"><strong>B</strong></button>
            <button onClick={() => formatText('italic')} className="p-1 border rounded hover:bg-gray-100 text-gray-700" title="Italic"><em>I</em></button>
            <button onClick={() => formatText('underline')} className="p-1 border rounded hover:bg-gray-100 text-gray-700" title="Underline"><u>U</u></button>
            <button onClick={() => formatList('ul')} className="p-1 border rounded hover:bg-gray-100 text-gray-700" title="Bulleted List">UL</button>
            <button onClick={() => formatList('ol')} className="p-1 border rounded hover:bg-gray-100 text-gray-700" title="Numbered List">OL</button>
            <button onClick={() => formatAlign('left')} className="p-1 border rounded hover:bg-gray-100 text-gray-700" title="Align Left">Left</button>
            <button onClick={() => formatAlign('center')} className="p-1 border rounded hover:bg-gray-100 text-gray-700" title="Align Center">Center</button>
            <button onClick={() => formatAlign('right')} className="p-1 border rounded hover:bg-gray-100 text-gray-700" title="Align Right">Right</button>
        </div>
    );
}

// This component contains the core logic for syncing external state with the editor.
function EditorCore({ initialHtml, onChange, placeholder, isEditable }) {
    const [editor] = useLexicalComposerContext();

    // *** THE CORE FIX IS HERE ***
    // This useEffect synchronizes the external `initialHtml` prop with the editor's state.
    useEffect(() => {
        editor.update(() => {
            // Get the current HTML content from the editor
            const currentHtml = $generateHtmlFromNodes(editor);

            // Guard condition: Only update the editor if the external HTML is different from the internal HTML.
            // This prevents an infinite loop where `onChange` triggers a re-render that triggers this effect.
            if (currentHtml !== initialHtml) {
                const parser = new DOMParser();
                const dom = parser.parseFromString(initialHtml || '<p><br></p>', 'text/html'); // Use a non-empty paragraph for empty strings
                const nodes = $generateNodesFromDOM(editor, dom);
                $getRoot().clear().append(...nodes);
            }
        });
    }, [initialHtml, editor]); // Rerun this effect only if initialHtml or the editor instance changes.

    const handleOnChange = useCallback((editorState) => {
        editorState.read(() => {
            const htmlString = $generateHtmlFromNodes(editor);
            onChange(htmlString);
        });
    }, [editor, onChange]);

    const placeholderTop = isEditable ? '40px' : '10px';

    return (
        <div className="relative">
            {isEditable && <ToolbarPlugin />}
            <RichTextPlugin
                contentEditable={<ContentEditable className={theme.root} />}
                placeholder={<div className="absolute left-2 pointer-events-none text-gray-400" style={{ top: placeholderTop }}>{placeholder}</div>}
                ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <ListPlugin />
            <LinkPlugin />
            <OnChangePlugin onChange={handleOnChange} />
        </div>
    );
}

// The main component wrapper. The `key` prop has been removed for stability.
const RichTextEditor = ({ initialHtml, onChange, placeholder = 'Enter text...', isEditable = true }) => {
    
    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError: (error) => console.error(error),
        nodes: [
            HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, ParagraphNode, TextNode
        ],
        editable: isEditable,
        // The editorState is initialized empty. The useEffect in EditorCore will populate it.
        editorState: null,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <EditorCore
                initialHtml={initialHtml}
                onChange={onChange}
                placeholder={placeholder}
                isEditable={isEditable}
            />
        </LexicalComposer>
    );
};

export default RichTextEditor;