export function getTextWithNewlines(element: Element): string {
  let textContent = '';
  element.childNodes.forEach((node, index) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.includes('... -->>') && index === element.childNodes.length - 3) {
        textContent += node.textContent.replace('... -->>', '');
        return;
      }
      textContent += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE && (node as Element).className !== 'red') {
      const childElement = node as Element;
      if (['P', 'DIV', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(childElement.tagName)) {
        textContent += '\n'; // Add a newline before the block element content
        textContent += getTextWithNewlines(childElement);
        if (!['BR'].includes(childElement.tagName)) {
          textContent += '\n'; // Add a newline after block elements except <br>
        }
      } else {
        textContent += getTextWithNewlines(childElement);
      }
    }
  });
  return textContent.trim();
}

// const remoteDataFecther: DataStrategy = {
//   fetchChapter: fetchChapterContent,
//   fetchChapterContents: fetchChapters,
//   fetchBook
// };

// export default remoteDataFecther;
