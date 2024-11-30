import React, { useState, useMemo } from 'react';
import type { Schema } from '../types';
import AceEditor from 'react-ace';
import TreeView from 'react-accessible-treeview';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import { FolderOpen, Folder, DocumentTasks } from '@carbon/react/icons';
import styles from './schema-viewer.scss';

interface SchemaViewerProps {
  data: string;
  errors: Array<{ text: string }>;
}

const transformDataToTree = (data: Schema) => {
  let idCounter = 1;

  const generateNodes = (key: string, value: any, parentId: number | null) => {
    const nodeId = idCounter++;
    const children = [];

    if (Array.isArray(value)) {
      value.forEach((item) => {
        children.push({
          id: idCounter++,
          name: `${item.description} (${item.concept})`,
          parent: nodeId,
          children: [],
        });
      });
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([childKey, childValue]) => {
        children.push(generateNodes(childKey, childValue, nodeId));
      });
    }

    return {
      id: nodeId,
      name: key,
      parent: parentId,
      children,
    };
  };

  const rootId = idCounter++;
  const rootNodes = Object.entries(data).map(([key, value]) => generateNodes(key, value, rootId));

  return [
    {
      id: rootId,
      name: 'Root',
      parent: null,
      children: rootNodes,
    },
  ];
};

const flattenTree = (tree: any[]) => {
  const flatArray: any[] = [];

  const traverse = (node: any) => {
    flatArray.push({
      id: node.id,
      name: node.name,
      parent: node.parent,
      children: node.children.map((child: any) => child.id),
    });
    node.children.forEach(traverse);
  };

  tree.forEach(traverse);
  return flatArray;
};

const FolderIcon = ({ isOpen }: { isOpen: boolean }) =>
  isOpen ? <FolderOpen className={styles.openDir} /> : <Folder className={styles.closeDir} />;

const SchemaViewer: React.FC<SchemaViewerProps> = ({ data, errors }) => {
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);

  const parsedData = useMemo(() => {
    try {
      const schemaData: Schema = JSON.parse(data);
      return schemaData;
    } catch {
      const dummySchema: Schema = {
        services: {
          all: [],
          'program:HIV': [],
          'program:TB': [],
          'age<5': [],
          'visitAttribute:prisoner': [],
        },
        commodities: {},
      };
      return dummySchema;
    }
  }, [data]);
  const treeData = transformDataToTree(parsedData);
  const flattenedTreeData = flattenTree(treeData);

  const handleNodeClick = (node: any) => {
    setSelectedNodes((prevSelected) =>
      prevSelected.includes(node.id) ? prevSelected.filter((id) => id !== node.id) : [...prevSelected, node.id],
    );
  };

  return (
    <div className={styles.schemaViewerContainer}>
      {
        <div className={styles.treeViewContainer}>
          <TreeView
            data={flattenedTreeData}
            aria-label="Exemption Tree"
            togglableSelect
            clickAction="EXCLUSIVE_SELECT"
            multiSelect
            onNodeSelect={handleNodeClick}
            nodeRenderer={({ element, isBranch, isSelected, getNodeProps, level, isExpanded }) => (
              <div
                {...getNodeProps()}
                style={{ paddingLeft: 20 * (level - 1) }}
                className={`${styles.treeNode} ${isSelected ? styles.treeNodeSelected : ''}`}>
                {isBranch ? <FolderIcon isOpen={isExpanded} /> : <DocumentTasks className={styles.fileIcon} />}
                {element.name}
              </div>
            )}
          />
        </div>
      }
    </div>
  );
};

export default SchemaViewer;
