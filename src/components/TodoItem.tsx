import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Todo } from "@/types";
import styles from "@/styles/Todo.module.css";
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: todo.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.todoItem} ${todo.completed ? styles.completed : ""}`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className={styles.checkbox}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <span className={styles.todoText}>{todo.text}</span>
      <button
        onClick={() => onDelete(todo.id)}
        className={styles.deleteButton}
        onPointerDown={(e) => e.stopPropagation()}
      >
        削除
      </button>
    </li>
  );
};
