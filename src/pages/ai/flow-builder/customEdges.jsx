import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';

export function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    borderRadius: 16,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 11,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            type="button"
            className="w-4 h-4 bg-red-500 hover:bg-red-600 text-white font-black text-[9px] rounded-full shadow-md border border-white flex items-center justify-center cursor-pointer hover:scale-125 transition-all"
            onClick={(evt) => {
              evt.stopPropagation();
              if (data?.onDeleteEdge) {
                data.onDeleteEdge(id);
              }
            }}
            title="Excluir Conexão"
          >
            ✕
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = {
  buttonEdge: ButtonEdge,
};
