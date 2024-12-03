import React, { useState, useMemo, useCallback } from 'react';
import { TreeView } from '@carbon/react';
import { Folder, DocumentTasks } from '@carbon/react/icons';
import styles from './schema-viewer.scss';

interface SchemaViewerProps {
  data: string;
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon: React.ReactNode;
}

const transformDataToTree = (data: Record<string, any>, parentKey = 'root'): TreeNode[] => {
  return Object.entries(data).map(([key, value]) => {
    const nodeId = `${parentKey}-${key}`;
    const isObject = typeof value === 'object' && !Array.isArray(value);

    return {
      id: nodeId,
      label: isObject || Array.isArray(value) ? key : `${key}: ${value}`,
      icon:
        isObject || Array.isArray(value) ? (
          <Folder className={styles.folderIcon} />
        ) : (
          <DocumentTasks className={styles.dirIcon} />
        ),
      children: Array.isArray(value)
        ? value.map((item, index) => ({
            id: `${nodeId}-${index}`,
            label: `${item.description} (${item.concept})`,
            icon: <DocumentTasks className={styles.dirIcon} />,
          }))
        : isObject
        ? transformDataToTree(value, nodeId)
        : undefined,
    };
  });
};

const SchemaViewer: React.FC<SchemaViewerProps> = ({ data }) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const treeData = useMemo(() => {
    try {
      return transformDataToTree(JSON.parse(data));
    } catch {
      return [];
    }
  }, [data]);

  const handleSelect = useCallback((selectedNodeIds: string[]) => {
    setSelectedNodes(selectedNodeIds);
  }, []);

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const renderTreeNodes = (nodes: TreeNode[]) =>
    nodes.map((node) => {
      const isExpanded = expandedNodes.has(node.id);
      return (
        <TreeView.TreeNode
          key={node.id}
          id={node.id}
          label={node.label}
          renderIcon={() => node.icon}
          isExpanded={isExpanded}
          onToggle={() => handleToggle(node.id)}
          multiselect={true}
          className={styles.treeView}>
          {node.children && renderTreeNodes(node.children)}
        </TreeView.TreeNode>
      );
    });

  return (
    <div className={styles.treeViewContainer}>
      <TreeView
        label="Exemption schema"
        selectedIds={selectedNodes}
        onSelect={(_, selectedNodeIds) => handleSelect(selectedNodeIds)}
        hideLabel
        multiselect>
        {renderTreeNodes(treeData)}
      </TreeView>
    </div>
  );
};

export default SchemaViewer;
