// Types for handling files
interface LocalFile {
  name: string;
  content: string;
}

// Function to read and parse local files
export const handleFileUpload = (file: File): Promise<LocalFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && event.target.result) {
        const content = event.target.result as string;
        resolve({
          name: file.name,
          content: content
        });
      } else {
        reject('File read failed.');
      }
    };

    reader.onerror = () => {
      reject('Error reading file.');
    };

    reader.readAsText(file);
  });
};