import { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

interface FileTreeProps {
  node: FileNode;
  onFileClick?: (content: string, fileName: string) => void;
}

function FileTreeNode({ node, onFileClick, level = 0 }: FileTreeProps & { level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else if (node.content && onFileClick) {
      onFileClick(node.content, node.name);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tf')) {
      return '📄';
    }
    return '📝';
  };

  return (
    <div className="select-none">
      <div
        onClick={handleClick}
        className={`
          flex items-center space-x-2 py-1.5 px-2 rounded cursor-pointer
          ${node.type === 'file' ? 'hover:bg-gray-100' : 'hover:bg-blue-50'}
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {node.type === 'folder' && (
          <span className="text-gray-500">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}

        {node.type === 'folder' ? (
          <Folder className={`h-4 w-4 ${isOpen ? 'text-blue-500' : 'text-gray-400'}`} />
        ) : (
          <span className="text-lg">{getFileIcon(node.name)}</span>
        )}

        <span className={`text-sm ${node.type === 'folder' ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
          {node.name}
        </span>
      </div>

      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode
              key={index}
              node={child}
              onFileClick={onFileClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ node, onFileClick }: FileTreeProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <FileTreeNode node={node} onFileClick={onFileClick} level={0} />
    </div>
  );
}
