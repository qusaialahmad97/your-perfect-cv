// src/components/cv/SectionCustomizer.jsx

import React from 'react';
// [THE FIX] This now correctly imports from the React 19-compatible library
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const SectionCustomizer = ({ sectionOrder, setSectionOrder }) => {

    const handleOnDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(sectionOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSectionOrder(items);
    };

    return (
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
            <h4 className="font-semibold mb-3 text-gray-700">Reorder Sections</h4>
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="sections">
                    {(provided) => (
                        <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {sectionOrder.map((sectionTitle, index) => (
                                <Draggable key={sectionTitle} draggableId={sectionTitle} index={index}>
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="p-2 bg-white rounded-md shadow-sm border flex items-center"
                                        >
                                            <span className="text-gray-500 mr-2">☰</span>
                                            <span className="text-sm font-medium">{sectionTitle}</span>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default SectionCustomizer;