// src/components/common/utils/htmlToEditorState.js
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
// Make sure ParagraphNode is imported from rich-text if it's the specific type you registered
import { ParagraphNode } from '@lexical/rich-text'; 

export function htmlToEditorState(htmlString) {
  return (editor) => {
    let contentToParse = htmlString || ''; // Ensure it's a string, not null/undefined

    // Heuristic: If it doesn't start with '<' and contains meaningful text,
    // assume it's plain text and wrap it in a paragraph.
    // This handles cases where data might be saved as plain text from previous versions.
    if (contentToParse.trim() !== '' && !contentToParse.startsWith('<') && !contentToParse.includes('<')) {
      contentToParse = `<p>${contentToParse}</p>`;
    } 
    // If it's empty or just whitespace, ensure it's an empty paragraph for Lexical
    else if (contentToParse.trim() === '') {
        contentToParse = '<p></p>';
    }

    const parser = new DOMParser();
    const dom = parser.parseFromString(contentToParse, 'text/html');
    
    let nodes = [];
    try {
      nodes = $generateNodesFromDOM(editor, dom);
    } catch (e) {
      console.error("Error parsing HTML with $generateNodesFromDOM, falling back to plain text:", e);
      // Fallback if parsing fails: create a single paragraph node with the plain text content
      // Strip any lingering HTML tags in the fallback to ensure plain text
      nodes = [$createParagraphNode().append($createTextNode(contentToParse.replace(/<[^>]*>?/gm, '')))];
    }

    $getRoot().clear().append(...nodes);

    // Final check: if after appending nodes, the root is still empty or doesn't have a paragraph-like node,
    // ensure there's at least one empty paragraph node for user input.
    const root = $getRoot();
    if (root.getTextContent().trim() === '' && root.getChildrenSize() === 0) {
      root.clear().append($createParagraphNode());
    }
    // Optional: If you find issues with lists from old plain-text saves not being parsed,
    // you might need a more complex pre-processor here or in `ensureHtml` in page.js
  };
}